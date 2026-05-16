export type Bubble = {
  id: string;
  letter: string;
  isVowel: boolean;
  // ekran konumu: 0 (alt) -> 1 (üst)
  spawnedAt: number;
};

export type BubbleTapResult =
  | { type: 'correct_hit'; letter: string; reactionTimeMs: number }
  | { type: 'commission'; letter: string; reactionTimeMs: number } // sessize dokundu
  | { type: 'correct_reject'; letter: string }                       // sessize dokunmadı, geçti
  | { type: 'omission'; letter: string };                            // sesliyi kaçırdı

export type BubblesConfig = {
  durationMs: number;       // toplam oyun süresi
  spawnIntervalMs: number;  // baloncuk üretim aralığı
  bubbleLifetimeMs: number; // baloncuğun ekranda kalma süresi
  vowelProbability: number; // 0-1 arası sesli üretim olasılığı
};
