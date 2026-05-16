export type BubblesDifficulty = 'easy' | 'medium' | 'hard';

export type BubbleTargetType = 'vowels' | 'single_letter';

export type RoundTarget = {
  type: BubbleTargetType;
  letters: string[];      // hedef harfler
  description: string;    // "Sesli harfler" gibi
};

export type Bubble = {
  id: string;
  letter: string;
  startX: number; // 0..1 yatay pozisyon
  isTarget: boolean;
  spawnedAt: number;
};

export type BubblesRound = {
  targetIndex: number;        // ROUND_TARGETS dizisindeki index
  target: RoundTarget;
  poppedTargets: number;
  totalTargetsNeeded: number;
  startedAt: number;
};

export type BubbleTapResult = {
  tappedLetter: string;
  isTarget: boolean;
  reactionTimeMs: number;
};

export type BubblesConfig = {
  totalRounds: number;
  targetsPerRound: number;
  spawnIntervalMs: number;
  riseDurationMs: number;
  difficulty: BubblesDifficulty;
};

export type BubblesDifficultySettings = {
  spawnIntervalMs: number;
  riseDurationMs: number;
  targetsPerRound: number;
};
