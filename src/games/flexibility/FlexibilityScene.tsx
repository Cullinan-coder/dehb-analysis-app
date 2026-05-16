import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { generateRound, ruleLabel, DEFAULT_CONFIG, isInPerseverationWindow } from './logic';
import { FlexRound, FlexResult, FlexItem } from './types';

type Props = {
  onRoundComplete: (result: FlexResult) => void;
  onAllRoundsComplete: () => void;
  currentRoundIndex: number;
};

export function FlexibilityScene({ onRoundComplete, onAllRoundsComplete, currentRoundIndex }: Props) {
  const [round, setRound] = useState<FlexRound>(() => generateRound(currentRoundIndex, DEFAULT_CONFIG));
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong' | 'timeout'>('idle');
  const [showRuleBanner, setShowRuleBanner] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bannerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const newRound = generateRound(currentRoundIndex, DEFAULT_CONFIG);
    setRound(newRound);
    setFeedback('idle');

    if (newRound.isRuleSwitchRound) {
      setShowRuleBanner(true);
      bannerRef.current = setTimeout(() => {
        setShowRuleBanner(false);
        timeoutRef.current = setTimeout(() => handleTimeout(), DEFAULT_CONFIG.roundTimeoutMs);
      }, 1500);
    } else {
      timeoutRef.current = setTimeout(() => handleTimeout(), DEFAULT_CONFIG.roundTimeoutMs);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (advanceRef.current) clearTimeout(advanceRef.current);
      if (bannerRef.current) clearTimeout(bannerRef.current);
    };
  }, [currentRoundIndex]);

  function advance(result: FlexResult) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const delay = result.correct ? 400 : 800;
    advanceRef.current = setTimeout(() => {
      onRoundComplete(result);
      if (currentRoundIndex + 1 >= DEFAULT_CONFIG.totalRounds) {
        onAllRoundsComplete();
      }
    }, delay);
  }

  function handleItemTap(item: FlexItem) {
    if (feedback !== 'idle' || showRuleBanner) return;
    const correct = item.id === round.correctItemId;
    setFeedback(correct ? 'correct' : 'wrong');
    const inWindow = isInPerseverationWindow(currentRoundIndex, DEFAULT_CONFIG);
    advance({
      roundIndex: currentRoundIndex,
      correct,
      isPerseveration: !correct && inWindow,
      isTimeout: false,
      reactionTimeMs: Date.now() - round.startedAt,
    });
  }

  function handleTimeout() {
    if (feedback !== 'idle') return;
    setFeedback('timeout');
    const inWindow = isInPerseverationWindow(currentRoundIndex, DEFAULT_CONFIG);
    advance({
      roundIndex: currentRoundIndex,
      correct: false,
      isPerseveration: inWindow,
      isTimeout: true,
      reactionTimeMs: DEFAULT_CONFIG.roundTimeoutMs,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.rule}>{ruleLabel(round.rule)}</Text>
      </View>

      <View style={styles.grid}>
        {round.items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemButton}
            onPress={() => handleItemTap(item)}
            disabled={feedback !== 'idle' || showRuleBanner}
            activeOpacity={0.7}>
            <Shape color={item.color} shape={item.shape} />
          </TouchableOpacity>
        ))}
      </View>

      {showRuleBanner && (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🔄 KURAL DEĞİŞTİ!</Text>
          <Text style={styles.bannerRule}>{ruleLabel(round.rule)}</Text>
        </View>
      )}

      {feedback === 'correct' && <View style={[styles.badge, styles.badgeCorrect]}><Text style={styles.badgeText}>✓ Doğru!</Text></View>}
      {feedback === 'wrong' && <View style={[styles.badge, styles.badgeWrong]}><Text style={styles.badgeText}>💪 Tekrar dene</Text></View>}
      {feedback === 'timeout' && <View style={[styles.badge, styles.badgeTimeout]}><Text style={styles.badgeText}>⏰ Süre doldu</Text></View>}
    </View>
  );
}

function Shape({ color, shape }: { color: string; shape: string }) {
  const hex = color === 'red' ? '#ef4444' : color === 'blue' ? '#4630EB' : color === 'green' ? '#22c55e' : '#eab308';
  const size = 100;
  if (shape === 'square') {
    return <View style={{ width: size, height: size, backgroundColor: hex, borderRadius: 8 }} />;
  }
  if (shape === 'circle') {
    return <View style={{ width: size, height: size, backgroundColor: hex, borderRadius: size / 2 }} />;
  }
  if (shape === 'triangle') {
    return (
      <View style={{ width: 0, height: 0, borderLeftWidth: size / 2, borderRightWidth: size / 2, borderBottomWidth: size, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: hex }} />
    );
  }
  // star — basit 4 köşeli yıldız: iki kare üst üste 45° döndürerek
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size * 0.85, height: size * 0.85, backgroundColor: hex, borderRadius: 12 }} />
      <View style={{ position: 'absolute', width: size * 0.85, height: size * 0.85, backgroundColor: hex, borderRadius: 12, transform: [{ rotate: '45deg' }] }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', paddingTop: 40, paddingHorizontal: 24 },
  header: { marginBottom: 48 },
  rule: { fontSize: 26, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 24, maxWidth: 500 },
  itemButton: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center', backgroundColor: '#16213e', borderRadius: 20, elevation: 4 },
  banner: { position: 'absolute', top: 80, left: 24, right: 24, backgroundColor: '#4630EB', borderRadius: 20, padding: 24, alignItems: 'center', elevation: 10 },
  bannerTitle: { fontSize: 26, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  bannerRule: { fontSize: 22, fontWeight: '600', color: '#ffffff' },
  badge: { position: 'absolute', bottom: 60, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24 },
  badgeCorrect: { backgroundColor: '#22c55e' },
  badgeWrong: { backgroundColor: '#ef4444' },
  badgeTimeout: { backgroundColor: '#6b7280' },
  badgeText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
});
