import {
  DetectiveConfig,
  DetectiveRound,
  LetterItem,
  DetectiveDifficulty,
  DetectiveDifficultySettings,
} from './types';

const TURKISH_LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'İ', 'K',
  'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'Y', 'Z',
];

export const DIFFICULTY_PRESETS: Record<DetectiveDifficulty, DetectiveDifficultySettings> = {
  easy:   { totalLetters: 15, targetsPerRound: 3, flashlightRadius: 220 },
  medium: { totalLetters: 22, targetsPerRound: 3, flashlightRadius: 180 },
  hard:   { totalLetters: 30, targetsPerRound: 3, flashlightRadius: 140 },
};

export const DEFAULT_CONFIG: DetectiveConfig = {
  totalRounds: 10,
  totalLetters: 22,
  targetsPerRound: 3,
  flashlightRadius: 180,
  difficulty: 'medium',
};

export function getConfigForDifficulty(difficulty: DetectiveDifficulty): DetectiveConfig {
  const preset = DIFFICULTY_PRESETS[difficulty];
  return {
    totalRounds: 10,
    totalLetters: preset.totalLetters,
    targetsPerRound: preset.targetsPerRound,
    flashlightRadius: preset.flashlightRadius,
    difficulty,
  };
}

export function getDifficultyForAge(age: number): DetectiveDifficulty {
  if (age <= 7) return 'easy';
  if (age <= 9) return 'medium';
  return 'hard';
}

// İki nokta arasında minimum mesafe (çakışmasın diye)
function isFarEnough(
  x: number,
  y: number,
  existing: { x: number; y: number }[],
  minDist: number
): boolean {
  return existing.every((p) => {
    const dx = (p.x - x);
    const dy = (p.y - y);
    return Math.sqrt(dx * dx + dy * dy) >= minDist;
  });
}

export function generateRound(config: DetectiveConfig = DEFAULT_CONFIG): DetectiveRound {
  const { totalLetters, targetsPerRound } = config;

  // Hedef harf seç
  const targetLetter = TURKISH_LETTERS[Math.floor(Math.random() * TURKISH_LETTERS.length)];

  // Distractor pool
  const distractorPool = TURKISH_LETTERS.filter((l) => l !== targetLetter);

  const items: LetterItem[] = [];
  const placedPositions: { x: number; y: number }[] = [];
  const MIN_DIST = 0.12; // 12% minimum mesafe (normalized)
  const MAX_ATTEMPTS = 50;

  // Önce hedef harfleri yerleştir
  for (let i = 0; i < targetsPerRound; i++) {
    let placed = false;
    for (let attempt = 0; attempt < MAX_ATTEMPTS && !placed; attempt++) {
      const x = 0.1 + Math.random() * 0.8; // 10%-90% aralığı (kenarlardan uzak)
      const y = 0.1 + Math.random() * 0.8;
      if (isFarEnough(x, y, placedPositions, MIN_DIST)) {
        items.push({
          id: `target-${i}`,
          letter: targetLetter,
          x,
          y,
          isTarget: true,
          found: false,
        });
        placedPositions.push({ x, y });
        placed = true;
      }
    }
  }

  // Sonra distractor'ları yerleştir
  const distractorCount = totalLetters - targetsPerRound;
  for (let i = 0; i < distractorCount; i++) {
    const letter = distractorPool[Math.floor(Math.random() * distractorPool.length)];
    let placed = false;
    for (let attempt = 0; attempt < MAX_ATTEMPTS && !placed; attempt++) {
      const x = 0.1 + Math.random() * 0.8;
      const y = 0.1 + Math.random() * 0.8;
      if (isFarEnough(x, y, placedPositions, MIN_DIST)) {
        items.push({
          id: `distractor-${i}`,
          letter,
          x,
          y,
          isTarget: false,
          found: false,
        });
        placedPositions.push({ x, y });
        placed = true;
      }
    }
  }

  return {
    targetLetter,
    items,
    foundCount: 0,
    totalTargets: targetsPerRound,
    startedAt: Date.now(),
  };
}

export function evaluateTap(
  round: DetectiveRound,
  itemId: string
): {
  correct: boolean;
  isTarget: boolean;
  reactionTimeMs: number;
  newRound: DetectiveRound;
  roundComplete: boolean;
} {
  const item = round.items.find((i) => i.id === itemId);
  if (!item || item.found) {
    return {
      correct: false,
      isTarget: false,
      reactionTimeMs: Date.now() - round.startedAt,
      newRound: round,
      roundComplete: false,
    };
  }

  const correct = item.isTarget;
  const newItems = correct
    ? round.items.map((i) => (i.id === itemId ? { ...i, found: true } : i))
    : round.items;
  const newFoundCount = correct ? round.foundCount + 1 : round.foundCount;
  const roundComplete = newFoundCount >= round.totalTargets;

  return {
    correct,
    isTarget: item.isTarget,
    reactionTimeMs: Date.now() - round.startedAt,
    newRound: {
      ...round,
      items: newItems,
      foundCount: newFoundCount,
    },
    roundComplete,
  };
}
