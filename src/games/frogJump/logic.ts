import {
  FrogJumpConfig,
  FrogJumpRound,
  LilyPad,
  FrogJumpDifficulty,
  FrogJumpDifficultySettings,
} from './types';

export const DIFFICULTY_PRESETS: Record<FrogJumpDifficulty, FrogJumpDifficultySettings> = {
  easy:   { maxNumber: 5,  fontSize: 48 },
  medium: { maxNumber: 8,  fontSize: 40 },
  hard:   { maxNumber: 10, fontSize: 36 },
};

export const DEFAULT_CONFIG: FrogJumpConfig = {
  totalRounds: 10,
  maxNumber: 8,
  difficulty: 'medium',
};

export function getConfigForDifficulty(difficulty: FrogJumpDifficulty): FrogJumpConfig {
  const preset = DIFFICULTY_PRESETS[difficulty];
  return {
    totalRounds: 10,
    maxNumber: preset.maxNumber,
    difficulty,
  };
}

export function getDifficultyForAge(age: number): FrogJumpDifficulty {
  if (age <= 7) return 'easy';
  if (age <= 9) return 'medium';
  return 'hard';
}

export function generateRound(config: FrogJumpConfig = DEFAULT_CONFIG): FrogJumpRound {
  const { maxNumber } = config;

  // 1..maxNumber sayılarını oluştur
  const numbers = Array.from({ length: maxNumber }, (_, i) => i + 1);
  const targetSequence = [...numbers];

  // Karıştır
  const shuffled = [...numbers].sort(() => Math.random() - 0.5);

  const pads: LilyPad[] = shuffled.map((num, idx) => ({
    number: num,
    position: idx,
  }));

  return {
    pads,
    targetSequence,
    currentTargetIndex: 0,
    startedAt: Date.now(),
  };
}

export function evaluateTap(
  round: FrogJumpRound,
  tappedNumber: number
): { correct: boolean; reactionTimeMs: number; nextTargetIndex: number; roundComplete: boolean } {
  const expectedNumber = round.targetSequence[round.currentTargetIndex];
  const correct = tappedNumber === expectedNumber;
  const nextTargetIndex = correct ? round.currentTargetIndex + 1 : round.currentTargetIndex;
  const roundComplete = correct && nextTargetIndex >= round.targetSequence.length;

  return {
    correct,
    reactionTimeMs: Date.now() - round.startedAt,
    nextTargetIndex,
    roundComplete,
  };
}
