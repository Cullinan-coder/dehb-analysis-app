export type FrogJumpDifficulty = 'easy' | 'medium' | 'hard';

export type LilyPad = {
  number: number;
  position: number; // 0..N-1 → ekrandaki sırası
};

export type FrogJumpRound = {
  pads: LilyPad[];
  targetSequence: number[]; // [1,2,3,...,N]
  currentTargetIndex: number; // şu an kaçıncıyı arıyor
  startedAt: number;
};

export type FrogJumpTapResult = {
  tappedNumber: number;
  expectedNumber: number;
  correct: boolean;
  reactionTimeMs: number;
};

export type FrogJumpConfig = {
  totalRounds: number;
  maxNumber: number;
  difficulty: FrogJumpDifficulty;
};

export type FrogJumpDifficultySettings = {
  maxNumber: number;
  fontSize: number;
};
