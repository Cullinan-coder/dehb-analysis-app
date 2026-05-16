export type RobotDifficulty = 'easy' | 'medium' | 'hard';

export type SyllableItem = {
  id: string;
  syllable: string;
  isCorrect: boolean;
  placed: boolean;
  slotIndex: number | null; // hangi slot'a yerleşti
};

export type WordSlot = {
  index: number;          // 0, 1 (2 heceli kelimeler için)
  expectedSyllable: string;
  filledWith: string | null; // yerleştirilen hece
};

export type RobotRound = {
  targetWord: string;
  syllables: string[]; // doğru sıralama
  pool: SyllableItem[]; // havuzdaki tüm heceler (karışık)
  slots: WordSlot[];
  startedAt: number;
};

export type RobotPlaceResult = {
  syllableId: string;
  syllable: string;
  slotIndex: number;
  correct: boolean;
  reactionTimeMs: number;
};

export type RobotConfig = {
  totalRounds: number;
  distractorCount: number;
  difficulty: RobotDifficulty;
};

export type RobotDifficultySettings = {
  distractorCount: number;
};
