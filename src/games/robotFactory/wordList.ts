// Türkçe 2 heceli basit kelimeler — DEHB'li çocuklar için
// Format: { word: 'KEDİ', syllables: ['KE', 'Dİ'] }

export type WordEntry = {
  word: string;
  syllables: string[]; // 2 hece
};

export const EASY_WORDS: WordEntry[] = [
  { word: 'KEDİ',  syllables: ['KE', 'Dİ'] },
  { word: 'MASA',  syllables: ['MA', 'SA'] },
  { word: 'KAPI',  syllables: ['KA', 'PI'] },
  { word: 'ELMA',  syllables: ['EL', 'MA'] },
  { word: 'BABA',  syllables: ['BA', 'BA'] },
  { word: 'ANNE',  syllables: ['AN', 'NE'] },
  { word: 'TOPU',  syllables: ['TO', 'PU'] },
  { word: 'GÜLÜ',  syllables: ['GÜ', 'LÜ'] },
];

export const MEDIUM_WORDS: WordEntry[] = [
  { word: 'BALIK',  syllables: ['BA', 'LIK'] },
  { word: 'KALEM', syllables: ['KA', 'LEM'] },
  { word: 'KEMER', syllables: ['KE', 'MER'] },
  { word: 'KARPUZ', syllables: ['KAR', 'PUZ'] },
  { word: 'YILDIZ', syllables: ['YIL', 'DIZ'] },
  { word: 'PASTA', syllables: ['PAS', 'TA'] },
];

export const HARD_WORDS: WordEntry[] = [
  { word: 'BULUT', syllables: ['BU', 'LUT'] },
  { word: 'KÖPEK', syllables: ['KÖ', 'PEK'] },
  { word: 'SAATÇİ', syllables: ['SA', 'ATÇİ'] },
  { word: 'BAHÇE', syllables: ['BAH', 'ÇE'] },
  { word: 'ÇİÇEK', syllables: ['Çİ', 'ÇEK'] },
];

// Distractor hece havuzu — her kelime için yanlış seçenek olarak kullanılır
export const DISTRACTOR_SYLLABLES = [
  'LA', 'TI', 'DE', 'BU', 'RA', 'NE', 'KO', 'TA', 'Sİ', 'GA',
  'MO', 'PI', 'TU', 'YE', 'CE', 'SU', 'NA', 'LE', 'TÖ', 'ZE',
];
