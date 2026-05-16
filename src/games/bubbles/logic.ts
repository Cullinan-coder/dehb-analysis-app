import {
  BubblesConfig,
  BubblesRound,
  BubblesDifficulty,
  BubblesDifficultySettings,
  RoundTarget,
  Bubble,
} from './types';

const TURKISH_LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'İ', 'K',
  'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'Y', 'Z',
];

const VOWELS = ['A', 'E', 'İ', 'O', 'U']; // basitlik için 5 temel sesli

export const ROUND_TARGETS: RoundTarget[] = [
  { type: 'vowels',        letters: VOWELS,    description: 'Sesli harfleri patlat!' },
  { type: 'single_letter', letters: ['B'],     description: 'B harflerini patlat!' },
  { type: 'single_letter', letters: ['D'],     description: 'D harflerini patlat!' },
  { type: 'vowels',        letters: ['M', 'N'], description: 'M ve N patlat!' },
  { type: 'vowels',        letters: VOWELS,    description: 'Yine sesli harfler!' },
];

export const DIFFICULTY_PRESETS: Record<BubblesDifficulty, BubblesDifficultySettings> = {
  easy:   { spawnIntervalMs: 1500, riseDurationMs: 7000, targetsPerRound: 8 },
  medium: { spawnIntervalMs: 1000, riseDurationMs: 5500, targetsPerRound: 10 },
  hard:   { spawnIntervalMs: 700,  riseDurationMs: 4000, targetsPerRound: 12 },
};

export const DEFAULT_CONFIG: BubblesConfig = {
  totalRounds: 5,
  targetsPerRound: 10,
  spawnIntervalMs: 1000,
  riseDurationMs: 5500,
  difficulty: 'medium',
};

export function getConfigForDifficulty(difficulty: BubblesDifficulty): BubblesConfig {
  const preset = DIFFICULTY_PRESETS[difficulty];
  return {
    totalRounds: 5,
    targetsPerRound: preset.targetsPerRound,
    spawnIntervalMs: preset.spawnIntervalMs,
    riseDurationMs: preset.riseDurationMs,
    difficulty,
  };
}

export function getDifficultyForAge(age: number): BubblesDifficulty {
  if (age <= 7) return 'easy';
  if (age <= 9) return 'medium';
  return 'hard';
}

export function createRound(roundIndex: number, config: BubblesConfig): BubblesRound {
  const target = ROUND_TARGETS[roundIndex % ROUND_TARGETS.length];
  return {
    targetIndex: roundIndex,
    target,
    poppedTargets: 0,
    totalTargetsNeeded: config.targetsPerRound,
    startedAt: Date.now(),
  };
}

let bubbleCounter = 0;

export function spawnBubble(target: RoundTarget): Bubble {
  bubbleCounter += 1;

  // %50 olasılıkla hedef harf, %50 distractor
  // Bu sayede hedef hep gelir, oyuncu sıkılmaz
  const isTarget = Math.random() < 0.5;

  let letter: string;
  if (isTarget) {
    letter = target.letters[Math.floor(Math.random() * target.letters.length)];
  } else {
    const distractorPool = TURKISH_LETTERS.filter((l) => !target.letters.includes(l));
    letter = distractorPool[Math.floor(Math.random() * distractorPool.length)];
  }

  return {
    id: `bubble-${bubbleCounter}-${Date.now()}`,
    letter,
    startX: 0.05 + Math.random() * 0.9, // %5-%95 aralığı
    isTarget,
    spawnedAt: Date.now(),
  };
}
