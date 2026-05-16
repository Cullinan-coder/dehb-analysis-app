export type ItemColor = 'red' | 'blue' | 'green' | 'yellow';
export type ItemShape = 'square' | 'circle' | 'triangle' | 'star';

export type FlexItem = {
  id: string;
  color: ItemColor;
  shape: ItemShape;
};

export type RuleType = 'color-red' | 'color-blue' | 'shape-square' | 'shape-circle';

export type FlexRound = {
  rule: RuleType;
  items: FlexItem[];
  correctItemId: string;
  startedAt: number;
  isRuleSwitchRound: boolean; // kural yeni değiştiyse true
};

export type FlexResult = {
  roundIndex: number;
  correct: boolean;
  isPerseveration: boolean; // kural değişiminden sonraki ilk 2 round'da hata
  isTimeout: boolean;
  reactionTimeMs: number;
};

export type FlexConfig = {
  totalRounds: number;       // 15
  roundsPerPhase: number;    // 5
  roundTimeoutMs: number;    // 8000
  perseverationWindow: number; // kural değişiminden sonra kaç round'a kadar perseverasyon sayılır (2)
};
