import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '../../stores/gameStore';
import { usePreExit } from '../../hooks/usePreExit';
import { LetterHuntScene } from '../../games/letterHunt/LetterHuntScene';
import { LetterTapResult } from '../../games/letterHunt/types';
import { createSession, endSession as endSessionDB, saveBehavioralEvent } from '../../services/session';
import { formatDuration } from '../../utils/formatDuration';

export default function LetterHuntScreen() {
  const {
    childId,
    childAge,
    sessionStarted,
    focusScore,
    completedTasks,
    totalTasks,
    breakCount,
    startSession,
    endSession,
    incrementBreak,
    completeTask,
    adaptiveAction,
    adaptiveReason,
    showBreakModal,
    setShowBreakModal,
    clearAdaptiveDecision,
    letterHuntDifficulty,
    setLetterHuntDifficulty,
  } = useGameStore();

  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [dbSessionId, setDbSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [lastDurationMs, setLastDurationMs] = useState<number>(0);

  useEffect(() => {
    if (!childId) {
      router.replace('/onboarding');
    }
  }, [childId]);

  const { recordTouch, recordError } = usePreExit(
    childAge ?? 8,
    sessionStartTime
  );

  async function handleStartSession() {
    const sessionId = Math.random().toString(36).substring(7);
    startSession(sessionId);
    setCurrentRoundIndex(0);
    setCorrectCount(0);
    setShowCompletionScreen(false);
    setSessionStartTime(Date.now());
    clearAdaptiveDecision();
    setShowBreakModal(false);
    setLetterHuntDifficulty('medium');
    recordTouch();

    // Supabase'e session kaydet
    if (childId) {
      const dbSession = await createSession(childId);
      if (dbSession) {
        setDbSessionId(dbSession.id);
        console.log('[Session] Başlatıldı:', dbSession.id);
      } else {
        console.warn('[Session] Supabase\'e kaydedilemedi, yerel devam ediyor');
      }
    }
  }

  async function handleRoundComplete(result: LetterTapResult) {
    recordTouch();
    if (result.correct) {
      setCorrectCount((c) => c + 1);
      completeTask();
    } else {
      recordError();
    }

    // Supabase'e behavioral event kaydet
    if (dbSessionId) {
      await saveBehavioralEvent(dbSessionId, 'letter_tap', {
        tapped: result.tappedLetter,
        target: result.targetLetter,
        correct: result.correct,
        reaction_time_ms: result.reactionTimeMs,
        round_index: currentRoundIndex,
      });
    }

    setCurrentRoundIndex((idx) => idx + 1);
  }

  // Adaptif karar geldiğinde Supabase'e logla
  useEffect(() => {
    if (adaptiveAction && dbSessionId) {
      saveBehavioralEvent(dbSessionId, 'pre_exit_intervention', {
        action: adaptiveAction,
        reason: adaptiveReason,
        difficulty_after: letterHuntDifficulty,
        timestamp: Date.now(),
      });
    }
  }, [adaptiveAction]);

  async function handleAllRoundsComplete() {
    const durationMs = Date.now() - sessionStartTime;
    setLastDurationMs(durationMs);
    setShowCompletionScreen(true);

    // Supabase'e session bitişini kaydet
    if (dbSessionId) {
      await endSessionDB(dbSessionId, focusScore, durationMs);
      setDbSessionId(null);
    }
  }

  async function handleBreak() {
    incrementBreak();
    const durationMs = Date.now() - sessionStartTime;

    // Supabase'e session bitişini kaydet
    if (dbSessionId) {
      await endSessionDB(dbSessionId, focusScore, durationMs);
      setDbSessionId(null);
    }

    endSession();
    setShowCompletionScreen(false);
    setCurrentRoundIndex(0);
    setCorrectCount(0);
    router.replace('/');
  }

  function handleBackToMenu() {
    router.replace('/');
  }

  // BAŞLANGIÇ EKRANI
  if (!sessionStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.startContainer}>
          <Text style={styles.startEmoji}>🌟</Text>
          <Text style={styles.title}>Maceraya Başla!</Text>
          <Text style={styles.subtitle}>Bugün hangi harfleri keşfedeceksin?</Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
            <Text style={styles.startButtonText}>Oynamaya Başla</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.devTestLink}
            onPress={handleBackToMenu}>
            <Text style={styles.devTestLinkText}>← Ana Menü</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // TAMAMLAMA EKRANI
  if (showCompletionScreen) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.startContainer}>
          <Text style={styles.startEmoji}>🎉</Text>
          <Text style={styles.title}>Tebrikler!</Text>
          <Text style={styles.subtitle}>
            {correctCount} / {totalTasks} doğru cevap verdin
          </Text>
          <Text style={styles.durationText}>⏱️ Süre: {formatDuration(lastDurationMs)}</Text>
          <TouchableOpacity style={styles.startButton} onPress={handleBackToMenu}>
            <Text style={styles.startButtonText}>Tekrar Oyna</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.breakButton} onPress={handleBreak}>
            <Text style={styles.breakButtonText}>☕ Mola Ver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // OYUN EKRANI
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gameContainer}>
        {/* Üst Bar */}
        <View style={styles.topBar}>
          <Stat label="Odak" value={String(focusScore)} />
          <Stat label="Görev" value={`${completedTasks}/${totalTasks}`} />
          <Stat label="Mola" value={String(breakCount)} />
        </View>

        {/* Oyun Sahnesi */}
        <View style={styles.gameArea}>
          <LetterHuntScene
            currentRoundIndex={currentRoundIndex}
            onRoundComplete={handleRoundComplete}
            onAllRoundsComplete={handleAllRoundsComplete}
          />
        </View>

        {/* Alt Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.breakButton} onPress={handleBreak}>
            <Text style={styles.breakButtonText}>☕ Mola Ver</Text>
          </TouchableOpacity>
        </View>

        {/* Mola Modal — Gemini önerdiğinde */}
        {showBreakModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalEmoji}>🌿</Text>
              <Text style={styles.modalTitle}>Mola zamanı!</Text>
              <Text style={styles.modalReason}>
                {adaptiveReason ?? 'Biraz nefes alalım, sonra devam ederiz.'}
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={() => {
                    setShowBreakModal(false);
                    handleBreak();
                  }}>
                  <Text style={styles.modalPrimaryText}>Mola Ver</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSecondaryBtn}
                  onPress={() => setShowBreakModal(false)}>
                  <Text style={styles.modalSecondaryText}>Devam Et</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  startEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    color: '#a0a0c0',
    textAlign: 'center',
    marginBottom: 16,
  },
  durationText: {
    fontSize: 18,
    color: '#facc15',
    textAlign: 'center',
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: '#4630EB',
    paddingHorizontal: 48,
    paddingVertical: 20,
    borderRadius: 30,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  devTestLink: {
    marginTop: 24,
    paddingVertical: 8,
  },
  devTestLinkText: {
    color: '#a0a0c0',
    fontSize: 14,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  gameContainer: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#16213e',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#a0a0c0',
    fontSize: 14,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
  },
  bottomBar: {
    padding: 16,
    alignItems: 'center',
  },
  breakButton: {
    backgroundColor: '#2d2d44',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  breakButtonText: {
    color: '#a0a0c0',
    fontSize: 18,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#16213e',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 480,
    width: '90%',
  },
  modalEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalReason: {
    fontSize: 16,
    color: '#a0a0c0',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalPrimaryBtn: {
    backgroundColor: '#4630EB',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
  },
  modalPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSecondaryBtn: {
    backgroundColor: '#2d2d44',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
  },
  modalSecondaryText: {
    color: '#a0a0c0',
    fontSize: 16,
  },
});
