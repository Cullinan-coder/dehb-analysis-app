import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '../../stores/gameStore';
import { RhythmScene } from '../../games/rhythm/RhythmScene';
import { BeatResult } from '../../games/rhythm/types';
import { calculatePerformance } from '../../games/rhythm/logic';
import { upsertGameScore } from '../../services/childScores';

type Phase = 'intro' | 'playing' | 'complete';

export default function RhythmScreen() {
  const { childId, childAge, scoreRowId, setScoreRowId, markGameCompleted } = useGameStore();
  const [phase, setPhase] = useState<Phase>('intro');
  const resultsRef = useRef<BeatResult[]>([]);
  const [displayAvg, setDisplayAvg] = useState(0);

  useEffect(() => {
    if (!childId) router.replace('/onboarding');
  }, [childId]);

  function handleStart() {
    resultsRef.current = [];
    setPhase('playing');
  }

  function handleBeatResult(result: BeatResult) {
    resultsRef.current.push(result);
  }

  async function handleGameComplete() {
    const performance = calculatePerformance(resultsRef.current);
    setDisplayAvg(Math.round(performance));
    setPhase('complete');
    if (childId && childAge !== null) {
      const result = await upsertGameScore({
        scoreRowId, childId, age: childAge,
        gameRoute: 'rhythm',
        performance,
      });
      if (result.scoreRowId) setScoreRowId(result.scoreRowId);
      markGameCompleted('game4');
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
          <Text style={styles.introEmoji}>🥁</Text>
          <Text style={styles.introTitle}>Ritim Ustası</Text>
          <Text style={styles.introDesc}>Yanıp sönen daireye ritimle dokun. Tam zamanında olmaya çalış!</Text>
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
          <Text style={styles.completeScore}>Ritim ortalaman: {displayAvg}/100</Text>
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
        <Text style={styles.progress}>Görev: Ritmi yakala</Text>
        <TouchableOpacity onPress={handleExit}>
          <Text style={styles.exitBtn}>× Çık</Text>
        </TouchableOpacity>
      </View>
      <RhythmScene onBeatResult={handleBeatResult} onGameComplete={handleGameComplete} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  intro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  introEmoji: { fontSize: 96 },
  introTitle: { fontSize: 32, fontWeight: 'bold', color: '#ffffff' },
  introDesc: { fontSize: 18, color: '#a0a0c0', textAlign: 'center', paddingHorizontal: 24, lineHeight: 26 },
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
