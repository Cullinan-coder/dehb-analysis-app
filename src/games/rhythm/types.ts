export type BeatResult = {
  beatIndex: number;
  tapDelta: number | null; // ms cinsinden sapma (null = hiç dokunmadı)
  score: 0 | 50 | 75 | 100;
};

export type RhythmConfig = {
  totalBeats: number;
  beatIntervalMs: number;
  perfectThresholdMs: number;
  goodThresholdMs: number;
  okThresholdMs: number;
};
