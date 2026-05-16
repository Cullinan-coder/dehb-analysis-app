export type DetectiveDifficulty = 'easy' | 'medium' | 'hard';

export type LetterItem = {
  id: string;
  letter: string;
  x: number; // 0..1 ekran yüzdesi
  y: number; // 0..1 ekran yüzdesi
  isTarget: boolean;
  found: boolean;
};

export type DetectiveRound = {
  targetLetter: string;
  items: LetterItem[];
  foundCount: number;
  totalTargets: number;
  startedAt: number;
};

export type DetectiveTapResult = {
  tappedLetter: string;
  targetLetter: string;
  correct: boolean;
  reactionTimeMs: number;
};

export type DetectiveConfig = {
  totalRounds: number;
  totalLetters: number;
  targetsPerRound: number;
  flashlightRadius: number;
  difficulty: DetectiveDifficulty;
};

export type DetectiveDifficultySettings = {
  totalLetters: number;
  targetsPerRound: number;
  flashlightRadius: number;
};
