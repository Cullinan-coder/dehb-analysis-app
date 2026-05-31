/**
 * Demo modu: sunum süresine sığacak şekilde kısaltılmış oyun süreleri.
 *
 * Etkinleştirmek için .env dosyasına ekle:
 *   EXPO_PUBLIC_DEMO_MODE=true
 *
 * Production build'lerinde default false. Skor formülü demo modda DEĞİŞMEZ —
 * sadece round sayısı / süre kısalır.
 */
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

export const GAME_CONFIG = {
  letterHunt: {
    totalRounds: DEMO_MODE ? 3 : 10,
    roundTimeoutMs: DEMO_MODE ? 5000 : 10000,
  },
  bubbles: {
    durationMs: DEMO_MODE ? 10000 : 45000,
  },
  robotFactory: {
    totalWords: DEMO_MODE ? 3 : 10,
    roundTimeoutMs: DEMO_MODE ? 12000 : 20000,
  },
  rhythm: {
    totalBeats: DEMO_MODE ? 6 : 20,
    beatIntervalMs: 1200,
  },
  flexibility: {
    roundsPerPhase: DEMO_MODE ? 2 : 5,
    totalRounds: DEMO_MODE ? 6 : 15,
    roundTimeoutMs: DEMO_MODE ? 5000 : 8000,
  },
} as const;
