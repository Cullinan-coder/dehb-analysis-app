import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '../../stores/gameStore';
import { usePreExit } from '../../hooks/usePreExit';
import { DetectiveScene } from '../../games/detective/DetectiveScene';
import { DetectiveTapResult, DetectiveDifficulty } from '../../games/detective/types';
import { getDifficultyForAge } from '../../games/detective/logic';
import {
  createSession,
  endSession as endSessionDB,
  saveBehavioralEvent,
} from '../../services/session';
import { upsertGameScore } from '../../services/childScores';
import { formatDuration } from '../../utils/formatDuration';

export default function DetectiveScreen() {
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
    adaptiveReason,
    showBreakModal,
    setShowBreakModal,
    clearAdaptiveDecision,
    scoreRowId,
    setScoreRowId,
  } = useGameStore();

  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [dbSessionId, setDbSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [lastDurationMs, setLastDurationMs] = useState<number>(0);

  const [difficulty, setDifficulty] = useState<DetectiveDifficulty>(() =>
    getDifficultyForAge(childAge ?? 8)
  );

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
    setDifficulty(getDifficultyForAge(childAge ?? 8));
    recordTouch();

    if (childId) {
      const dbSession = await createSession(childId);
      if (dbSession) {
        setDbSessionId(dbSession.id);
        console.log('[Detective Session] Başlatıldı:', dbSession.id);
      }
    }
  }

  async function handleRoundComplete(result: DetectiveTapResult, roundFinished: boolean) {
    recordTouch();
    if (result.correct) {
      setCorrectCount((c) => c + 1);
    } else {
      recordError();
    }

    if (dbSessionId) {
      await saveBehavioralEvent(dbSessionId, 'detective_tap', {
        tapped: result.tappedLetter,
        target: result.targetLetter,
        correct: result.correct,
        reaction_time_ms: result.reactionTimeMs,
        round_index: currentRoundIndex,
      });
    }

    if (roundFinished) {
      completeTask();
      setCurrentRoundIndex((idx) => idx + 1);
    }
  }

  async function handleAllRoundsComplete() {
    const durationMs = Date.now() - sessionStartTime;
    setLastDurationMs(durationMs);
    setShowCompletionScreen(true);
    if (dbSessionId) {
      await endSessionDB(dbSessionId, focusScore, durationMs);
      setDbSessionId(null);
    }

    // Write weighted score to child_scores
    if (childId && childAge !== null) {
      const result = await upsertGameScore({
        scoreRowId,
        childId,
        age: childAge,
        gameRoute: 'detective',
        correctCount,
      });
      if (result.scoreRowId) {
        setScoreRowId(result.scoreRowId);
      }
    }
  }

  async function handleBreak() {
    incrementBreak();
    const durationMs = Date.now() - sessionStartTime;
    if (dbSessionId) {
      await endSessionDB(dbSessionId, focusScore, durationMs);
      setDbSessionId(null);
    }
    endSession();
    router.replace('/');
  }

  if (!sessionStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.startContainer}>
          <Text style={styles.startEmoji}>🔦</Text>
          <Text style={styles.title}>Dedektif Feneri</Text>
          <Text style={styles.subtitle}>
            Karanlıkta saklanan harfleri fenerinle bul!
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
            <Text style={styles.startButtonText}>Oynamaya Başla</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backLink} onPress={() => router.replace('/')}>
            <Text style={styles.backLinkText}>← Ana Menü</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showCompletionScreen) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.startContainer}>
          <Text style={styles.startEmoji}>🎉</Text>
          <Text style={styles.title}>Dava Çözüldü!</Text>
          <Text style={styles.subtitle}>
            {correctCount} harfi keşfettin!
          </Text>
          <Text style={styles.durationText}>⏱️ Süre: {formatDuration(lastDurationMs)}</Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
            <Text style={styles.startButtonText}>Tekrar Oyna</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.breakButton} onPress={handleBreak}>
            <Text style={styles.breakButtonText}>☕ Mola Ver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gameContainer}>
        <View style={styles.topBar}>
          <Stat label="Odak" value={String(focusScore)} />
          <Stat label="Görev" value={`${completedTasks}/${totalTasks}`} />
          <Stat label="Mola" value={String(breakCount)} />
        </View>

        <View style={styles.gameArea}>
          <DetectiveScene
            difficulty={difficulty}
            currentRoundIndex={currentRoundIndex}
            totalRounds={totalTasks}
            onRoundComplete={handleRoundComplete}
            onAllRoundsComplete={handleAllRoundsComplete}
          />
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.breakButton} onPress={handleBreak}>
            <Text style={styles.breakButtonText}>☕ Mola Ver</Text>
          </TouchableOpacity>
        </View>

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
  container: { flex: 1, backgroundColor: '#000000' },
  startContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  startEmoji: { fontSize: 96, marginBottom: 16 },
  title: { fontSize: 44, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 18, color: '#a0a0c0', textAlign: 'center', marginBottom: 16, paddingHorizontal: 24 },
  durationText: { fontSize: 18, color: '#facc15', textAlign: 'center', marginBottom: 32 },
  startButton: { backgroundColor: '#facc15', paddingHorizontal: 48, paddingVertical: 20, borderRadius: 30 },
  startButtonText: { color: '#000000', fontSize: 24, fontWeight: 'bold' },
  backLink: { marginTop: 24, paddingVertical: 8 },
  backLinkText: { color: '#a0a0c0', fontSize: 14, textDecorationLine: 'underline' },
  gameContainer: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, backgroundColor: '#16213e' },
  statBox: { alignItems: 'center' },
  statLabel: { color: '#a0a0c0', fontSize: 14 },
  statValue: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  gameArea: { flex: 1 },
  bottomBar: { padding: 16, alignItems: 'center' },
  breakButton: { backgroundColor: '#2d2d44', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 20, marginTop: 16 },
  breakButtonText: { color: '#a0a0c0', fontSize: 18 },
  modalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalCard: { backgroundColor: '#16213e', borderRadius: 24, padding: 32, alignItems: 'center', maxWidth: 480, width: '90%' },
  modalEmoji: { fontSize: 64, marginBottom: 16 },
  modalTitle: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 12, textAlign: 'center' },
  modalReason: { fontSize: 16, color: '#a0a0c0', textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalPrimaryBtn: { backgroundColor: '#4630EB', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20 },
  modalPrimaryText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  modalSecondaryBtn: { backgroundColor: '#2d2d44', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20 },
  modalSecondaryText: { color: '#a0a0c0', fontSize: 16 },
});
