import {
  RobotConfig,
  RobotRound,
  RobotDifficulty,
  RobotDifficultySettings,
  SyllableItem,
  WordSlot,
} from './types';
import {
  EASY_WORDS,
  MEDIUM_WORDS,
  HARD_WORDS,
  DISTRACTOR_SYLLABLES,
  WordEntry,
} from './wordList';

export const DIFFICULTY_PRESETS: Record<RobotDifficulty, RobotDifficultySettings> = {
  easy:   { distractorCount: 2 },
  medium: { distractorCount: 3 },
  hard:   { distractorCount: 4 },
};

export const DEFAULT_CONFIG: RobotConfig = {
  totalRounds: 5,
  distractorCount: 3,
  difficulty: 'medium',
};

export function getConfigForDifficulty(difficulty: RobotDifficulty): RobotConfig {
  const preset = DIFFICULTY_PRESETS[difficulty];
  return {
    totalRounds: 5,
    distractorCount: preset.distractorCount,
    difficulty,
  };
}

export function getDifficultyForAge(age: number): RobotDifficulty {
  if (age <= 7) return 'easy';
  if (age <= 9) return 'medium';
  return 'hard';
}

function getWordPool(difficulty: RobotDifficulty): WordEntry[] {
  switch (difficulty) {
    case 'easy':   return EASY_WORDS;
    case 'medium': return MEDIUM_WORDS;
    case 'hard':   return HARD_WORDS;
  }
}

let syllableIdCounter = 0;

function nextId(): string {
  syllableIdCounter += 1;
  return `syl-${syllableIdCounter}-${Date.now()}`;
}

export function generateRound(config: RobotConfig = DEFAULT_CONFIG): RobotRound {
  const { distractorCount, difficulty } = config;
  const pool = getWordPool(difficulty);

  // Rastgele kelime seç
  const entry = pool[Math.floor(Math.random() * pool.length)];
  const correctSyllables = entry.syllables;

  // Distractor hece üret — doğru hecelerle çakışmasın
  const distractorPool = DISTRACTOR_SYLLABLES.filter(
    (s) => !correctSyllables.includes(s)
  );
  const shuffledDistractors = [...distractorPool]
    .sort(() => Math.random() - 0.5)
    .slice(0, distractorCount);

  // Doğru + distractor heceleri birleştir, karıştır
  const allSyllables: SyllableItem[] = [
    ...correctSyllables.map((syl) => ({
      id: nextId(),
      syllable: syl,
      isCorrect: true,
      placed: false,
      slotIndex: null as number | null,
    })),
    ...shuffledDistractors.map((syl) => ({
      id: nextId(),
      syllable: syl,
      isCorrect: false,
      placed: false,
      slotIndex: null as number | null,
    })),
  ];

  const pool_shuffled = [...allSyllables].sort(() => Math.random() - 0.5);

  // Slots
  const slots: WordSlot[] = correctSyllables.map((syl, idx) => ({
    index: idx,
    expectedSyllable: syl,
    filledWith: null,
  }));

  return {
    targetWord: entry.word,
    syllables: correctSyllables,
    pool: pool_shuffled,
    slots,
    startedAt: Date.now(),
  };
}

export function tryPlaceSyllable(
  round: RobotRound,
  syllableId: string,
  slotIndex: number
): {
  correct: boolean;
  reactionTimeMs: number;
  newRound: RobotRound;
  roundComplete: boolean;
} {
  const syllableItem = round.pool.find((s) => s.id === syllableId);
  const slot = round.slots[slotIndex];

  if (!syllableItem || !slot || syllableItem.placed || slot.filledWith) {
    return {
      correct: false,
      reactionTimeMs: Date.now() - round.startedAt,
      newRound: round,
      roundComplete: false,
    };
  }

  const correct = syllableItem.syllable === slot.expectedSyllable;

  if (!correct) {
    return {
      correct: false,
      reactionTimeMs: Date.now() - round.startedAt,
      newRound: round, // değişiklik yok, hece geri zıplayacak (UI tarafında)
      roundComplete: false,
    };
  }

  // Doğru — hece yerleşiyor
  const newPool = round.pool.map((s) =>
    s.id === syllableId ? { ...s, placed: true, slotIndex } : s
  );
  const newSlots = round.slots.map((s, idx) =>
    idx === slotIndex ? { ...s, filledWith: syllableItem.syllable } : s
  );

  const roundComplete = newSlots.every((s) => s.filledWith !== null);

  return {
    correct: true,
    reactionTimeMs: Date.now() - round.startedAt,
    newRound: {
      ...round,
      pool: newPool,
      slots: newSlots,
    },
    roundComplete,
  };
}
