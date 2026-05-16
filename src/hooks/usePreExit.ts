import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { getAdaptiveDecision } from '../services/gemini';

const PRE_EXIT_THRESHOLD = 0.7;
const COOLDOWN_MS = 30000; // 30 saniye içinde tekrar Gemini'ye sorma

export function usePreExit(
  childAge: number,
  sessionStartTime: number
) {
  const {
    sessionStarted,
    updatePreExitScore,
    focusScore,
    letterHuntDifficulty,
    setAdaptiveDecision,
    setShowBreakModal,
    setLetterHuntDifficulty,
  } = useGameStore();

  const touchCount = useRef(0);
  const errorCount = useRef(0);
  const pauseCount = useRef(0);
  const lastTouchTime = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Gemini çağrı kontrolü
  const isGeminiCalling = useRef(false);
  const lastDecisionTime = useRef(0);

  const recordTouch = () => {
    touchCount.current += 1;
    lastTouchTime.current = Date.now();
  };

  const recordError = () => {
    errorCount.current += 1;
  };

  useEffect(() => {
    if (!sessionStarted) return;

    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      const timeSinceLastTouch = (now - lastTouchTime.current) / 1000;

      if (timeSinceLastTouch > 5) {
        pauseCount.current += 1;
      }

      const touchScore = Math.max(0, 1 - touchCount.current / 10);
      const errorScore = Math.min(1, errorCount.current / 5);
      const pauseScore = Math.min(1, pauseCount.current / 3);

      const preExitScore = (touchScore + errorScore + pauseScore) / 3;
      const errorRateRaw = touchCount.current > 0
        ? errorCount.current / touchCount.current
        : 0;

      updatePreExitScore(preExitScore);

      // Eşik aşıldı mı?
      if (preExitScore >= PRE_EXIT_THRESHOLD) {
        // Cooldown ve çakışma kontrolü
        const timeSinceLastDecision = now - lastDecisionTime.current;

        if (isGeminiCalling.current) {
          console.log('[PreExit] Gemini zaten çağrılıyor, atlanıyor');
        } else if (timeSinceLastDecision < COOLDOWN_MS) {
          console.log(
            '[PreExit] Cooldown aktif, kalan:',
            ((COOLDOWN_MS - timeSinceLastDecision) / 1000).toFixed(0),
            'saniye'
          );
        } else {
          isGeminiCalling.current = true;
          console.log('[PreExit] Skor:', preExitScore.toFixed(2), '→ Gemini çağrılıyor');

          try {
            const sessionDurationSeconds = Math.floor(
              (now - sessionStartTime) / 1000
            );

            const result = await getAdaptiveDecision({
              childAge,
              sessionDurationSeconds,
              focusScore,
              errorRate: errorRateRaw,
              pauseFrequency: pauseCount.current,
              currentDifficulty: letterHuntDifficulty,
            });

            if (result.ok && result.decision) {
              console.log(
                '[PreExit] Karar:',
                result.decision.action,
                '-',
                result.decision.reason
              );

              lastDecisionTime.current = Date.now();
              setAdaptiveDecision(result.decision.action, result.decision.reason);

              // Aksiyona göre tepki ver
              if (result.decision.action === 'gorev_kucult') {
                // Zorluğu düşür
                if (letterHuntDifficulty === 'hard') {
                  setLetterHuntDifficulty('medium');
                } else if (letterHuntDifficulty === 'medium') {
                  setLetterHuntDifficulty('easy');
                }
              } else if (result.decision.action === 'mola_oner') {
                setShowBreakModal(true);
              }
              // mod_degistir: Sprint 5'te uygulanacak, şimdilik log
            } else {
              console.warn('[PreExit] Gemini hatası:', result.error);
            }
          } catch (err) {
            console.error('[PreExit] Beklenmeyen hata:', err);
          } finally {
            isGeminiCalling.current = false;
          }
        }
      }

      // Sayaçları sıfırla
      touchCount.current = 0;
      errorCount.current = 0;
      // pauseCount sıfırlanmıyor — birikimli kalsın
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionStarted]);

  return { recordTouch, recordError };
}
