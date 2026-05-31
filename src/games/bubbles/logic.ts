import { BubblesConfig, Bubble } from './types';
import { GAME_CONFIG } from '../../config/demoMode';

const TURKISH_VOWELS = ['A', 'E', 'I', 'İ', 'O', 'Ö', 'U', 'Ü'];
const TURKISH_CONSONANTS = ['B', 'C', 'Ç', 'D', 'F', 'G', 'Ğ', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'Ş', 'T', 'V', 'Y', 'Z'];

export const DEFAULT_CONFIG: BubblesConfig = {
  durationMs: GAME_CONFIG.bubbles.durationMs,
  spawnIntervalMs: 1100,
  bubbleLifetimeMs: 3500,
  vowelProbability: 0.4,
};

export function isVowel(letter: string): boolean {
  return TURKISH_VOWELS.includes(letter.toUpperCase());
}

export function spawnBubble(config: BubblesConfig = DEFAULT_CONFIG): Bubble {
  const useVowel = Math.random() < config.vowelProbability;
  const pool = useVowel ? TURKISH_VOWELS : TURKISH_CONSONANTS;
  const letter = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    letter,
    isVowel: useVowel,
    spawnedAt: Date.now(),
  };
}

/**
 * Performans = (correctHits + correctRejects) / totalBubbles × 100
 */
export function calculatePerformance(
  correctHits: number,
  correctRejects: number,
  totalBubbles: number
): number {
  if (totalBubbles === 0) return 0;
  return ((correctHits + correctRejects) / totalBubbles) * 100;
}
