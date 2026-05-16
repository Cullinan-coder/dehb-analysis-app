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
  tappedLetter: string;
  targetLetter: string;
  correct: boolean;
  reactionTimeMs: number;
};

export type LetterHuntDifficulty = 'easy' | 'medium' | 'hard';

export type LetterHuntConfig = {
  totalRounds: number;
  choicesPerRound: number;
  alphabet: string[];
  difficulty: LetterHuntDifficulty;
};

export type DifficultySettings = {
  choicesPerRound: number;
  fontSize: number;
};
