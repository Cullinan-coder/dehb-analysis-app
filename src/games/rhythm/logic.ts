import { RhythmConfig, BeatResult } from './types';

export const DEFAULT_CONFIG: RhythmConfig = {
  totalBeats: 20,
  beatIntervalMs: 1400,
  perfectThresholdMs: 150,
  goodThresholdMs: 300,
  okThresholdMs: 500,
};

export function scoreDelta(deltaMs: number | null, config: RhythmConfig = DEFAULT_CONFIG): 0 | 50 | 75 | 100 {
  if (deltaMs === null) return 0;
  const abs = Math.abs(deltaMs);
  if (abs <= config.perfectThresholdMs) return 100;
  if (abs <= config.goodThresholdMs) return 75;
  if (abs <= config.okThresholdMs) return 50;
  return 0;
}

export function calculatePerformance(results: BeatResult[]): number {
  if (results.length === 0) return 0;
  const sum = results.reduce((acc, r) => acc + r.score, 0);
  return sum / results.length;
}
