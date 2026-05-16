export type LetterChoice = {
  letter: string;
  isTarget: boolean;
};

export type LetterHuntRound = {
  target: string;
  choices: LetterChoice[];
  startedAt: number;
};

export type LetterTapResult = {
  tappedLetter: string | null; // null = timeout (omisyon)
  targetLetter: string;
  correct: boolean;
  reactionTimeMs: number;
  isTimeout: boolean;
};

export type LetterHuntConfig = {
  totalRounds: number;
  choicesPerRound: number;
  roundTimeoutMs: number;
  alphabet: string[];
};
