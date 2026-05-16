export type RobotFactoryRound = {
  word: string;
  correctSyllables: string[];  // doğru sıra
  choices: string[];            // karışık + distraktörler
  startedAt: number;
};

export type WordResult = {
  word: string;
  completed: boolean;       // doğru sırayla tamamlandı mı
  wrongTaps: number;        // round içinde toplam yanlış tıklama
  isTimeout: boolean;
  reactionTimeMs: number;
};

export type RobotFactoryConfig = {
  totalRounds: number;
  roundTimeoutMs: number;
  distractorCount: number;
};
