export type WordEntry = {
  word: string;       // tam kelime
  syllables: string[]; // doğru sırada heceler
};

export const WORD_LIST: WordEntry[] = [
  { word: 'ELMA',  syllables: ['EL', 'MA'] },
  { word: 'KEDİ',  syllables: ['KE', 'Dİ'] },
  { word: 'BABA',  syllables: ['BA', 'BA'] },
  { word: 'ANNE',  syllables: ['AN', 'NE'] },
  { word: 'OKUL',  syllables: ['O',  'KUL'] },
  { word: 'MASA',  syllables: ['MA', 'SA'] },
  { word: 'KALEM', syllables: ['KA', 'LEM'] },
  { word: 'KİTAP', syllables: ['Kİ', 'TAP'] },
  { word: 'ARABA', syllables: ['A',  'RA', 'BA'] },
  { word: 'BALON', syllables: ['BA', 'LON'] },
  { word: 'KAPI',  syllables: ['KA', 'PI'] },
  { word: 'EVİM',  syllables: ['E',  'VİM'] },
];
