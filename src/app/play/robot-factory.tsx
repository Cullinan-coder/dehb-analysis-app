import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '../../stores/gameStore';
import { RobotFactoryScene } from '../../games/robotFactory/RobotFactoryScene';
import { WordResult } from '../../games/robotFactory/types';
import { calculatePerformance, DEFAULT_CONFIG } from '../../games/robotFactory/logic';
import { upsertGameScore } from '../../services/childScores';

type Phase = 'intro' | 'playing' | 'complete';

export default function RobotFactoryScreen() {
  const { childId, childAge, scoreRowId, setScoreRowId, markGameCompleted } = useGameStore();
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!childId) router.replace('/onboarding');
  }, [childId]);

  function handleStart() {
    setCurrentRoundIndex(0);
    setCompletedCount(0);
    setPhase('playing');
  }

  function handleWordComplete(result: WordResult) {
    if (result.completed) setCompletedCount((c) => c + 1);
    setCurrentRoundIndex((i) => i + 1);
  }

  async function handleAllRoundsComplete() {
    setPhase('complete');
    if (childId && childAge !== null) {
      const performance = calculatePerformance(completedCount, DEFAULT_CONFIG.totalRounds);
      const result = await upsertGameScore({
        scoreRowId, childId, age: childAge,
        gameRoute: 'robot-factory',
        performance,
      });
      if (result.scoreRowId) setScoreRowId(result.scoreRowId);
      markGameCompleted('game3');
    }
  }

  function handleExit() {
    Alert.alert('Oyundan çıkılsın mı?', 'İlerlemen kaydedilmez.', [
      { text: 'Devam et', style: 'cancel' },
      { text: 'Evet, çık', style: 'destructive', onPress: () => router.replace('/') },
    ]);
  }

  if (phase === 'intro') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.intro}>
          <Text style={styles.introEmoji}>🤖</Text>
          <Text style={styles.introTitle}>Hece Birleştirme</Text>
          <Text style={styles.introDesc}>Kelimeyi oluşturmak için heceleri doğru sırayla seç!</Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Başla</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'complete') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.complete}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>Tebrikler!</Text>
          <Text style={styles.completeScore}>Tamamlanan: {completedCount}/{DEFAULT_CONFIG.totalRounds}</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => router.replace('/')}>
            <Text style={styles.startButtonText}>Ana ekrana dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.progress}>Görev: {currentRoundIndex + 1}/{DEFAULT_CONFIG.totalRounds}</Text>
        <TouchableOpacity onPress={handleExit}>
          <Text style={styles.exitBtn}>× Çık</Text>
        </TouchableOpacity>
      </View>
      <RobotFactoryScene
        onWordComplete={handleWordComplete}
        onAllRoundsComplete={handleAllRoundsComplete}
        currentRoundIndex={currentRoundIndex}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  intro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  introEmoji: { fontSize: 96 },
  introTitle: { fontSize: 32, fontWeight: 'bold', color: '#ffffff' },
  introDesc: { fontSize: 18, color: '#a0a0c0', textAlign: 'center', paddingHorizontal: 24 },
  startButton: { backgroundColor: '#4630EB', paddingHorizontal: 48, paddingVertical: 18, borderRadius: 16, marginTop: 24 },
  startButtonText: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  backButton: { marginTop: 12, padding: 12 },
  backButtonText: { color: '#a0a0c0', fontSize: 16 },
  complete: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  completeEmoji: { fontSize: 120 },
  completeTitle: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' },
  completeScore: { fontSize: 28, color: '#22c55e', fontWeight: '600', marginBottom: 24 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#16213e' },
  progress: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  exitBtn: { color: '#a0a0c0', fontSize: 16, fontWeight: '600' },
});
