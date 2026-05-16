import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { generateRound, DEFAULT_CONFIG } from './logic';
import { LetterHuntRound, LetterTapResult } from './types';

type Props = {
  onRoundComplete: (result: LetterTapResult) => void;
  onAllRoundsComplete: () => void;
  currentRoundIndex: number;
};

export function LetterHuntScene({ onRoundComplete, onAllRoundsComplete, currentRoundIndex }: Props) {
  const [round, setRound] = useState<LetterHuntRound>(() => generateRound(DEFAULT_CONFIG));
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong' | 'timeout'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setRound(generateRound(DEFAULT_CONFIG));
    setFeedback('idle');
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, DEFAULT_CONFIG.roundTimeoutMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (advanceRef.current) clearTimeout(advanceRef.current);
    };
  }, [currentRoundIndex]);

  function advance(result: LetterTapResult) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const delay = result.correct ? 400 : 800;
    advanceRef.current = setTimeout(() => {
      onRoundComplete(result);
      if (currentRoundIndex + 1 >= DEFAULT_CONFIG.totalRounds) {
        onAllRoundsComplete();
      }
    }, delay);
  }

  function handleTap(letter: string) {
    if (feedback !== 'idle') return;
    const correct = letter === round.target;
    setFeedback(correct ? 'correct' : 'wrong');
    advance({
      tappedLetter: letter,
      targetLetter: round.target,
      correct,
      reactionTimeMs: Date.now() - round.startedAt,
      isTimeout: false,
    });
  }

  function handleTimeout() {
    if (feedback !== 'idle') return;
    setFeedback('timeout');
    advance({
      tappedLetter: null,
      targetLetter: round.target,
      correct: false,
      reactionTimeMs: DEFAULT_CONFIG.roundTimeoutMs,
      isTimeout: true,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.promptContainer}>
        <Text style={styles.promptLabel}>Bul:</Text>
        <Text style={styles.promptLetter}>{round.target}</Text>
      </View>

      <View style={styles.grid}>
        {round.choices.map((choice, idx) => (
          <LetterButton
            key={`${currentRoundIndex}-${idx}`}
            letter={choice.letter}
            disabled={feedback !== 'idle'}
            onPress={() => handleTap(choice.letter)}
            highlight={feedback === 'correct' && choice.isTarget}
          />
        ))}
      </View>

      {feedback === 'correct' && (
        <View style={[styles.badge, styles.badgeCorrect]}>
          <Text style={styles.badgeText}>✓ Harika!</Text>
        </View>
      )}
      {feedback === 'wrong' && (
        <View style={[styles.badge, styles.badgeWrong]}>
          <Text style={styles.badgeText}>💪 Tekrar dene</Text>
        </View>
      )}
      {feedback === 'timeout' && (
        <View style={[styles.badge, styles.badgeTimeout]}>
          <Text style={styles.badgeText}>⏰ Süre doldu</Text>
        </View>
      )}
    </View>
  );
}

function LetterButton({ letter, disabled, onPress, highlight }: { letter: string; disabled: boolean; onPress: () => void; highlight: boolean }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (highlight) {
      scale.value = withSequence(withSpring(1.3, { damping: 8 }), withTiming(1, { duration: 300 }));
    }
  }, [highlight]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity style={[styles.letterButton, disabled && styles.letterButtonDisabled]} onPress={onPress} disabled={disabled} activeOpacity={0.7}>
        <Text style={styles.letterText}>{letter}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: '#1a1a2e' },
  promptContainer: { alignItems: 'center', marginBottom: 48 },
  promptLabel: { fontSize: 18, color: '#a0a0c0', marginBottom: 8 },
  promptLetter: { fontSize: 96, fontWeight: 'bold', color: '#ffffff', textShadowColor: '#4630EB', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20, maxWidth: 600 },
  letterButton: { width: 90, height: 90, backgroundColor: '#4630EB', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  letterButtonDisabled: { opacity: 0.6 },
  letterText: { fontSize: 44, fontWeight: 'bold', color: '#ffffff' },
  badge: { position: 'absolute', bottom: 100, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30 },
  badgeCorrect: { backgroundColor: '#22c55e' },
  badgeWrong: { backgroundColor: '#ef4444' },
  badgeTimeout: { backgroundColor: '#6b7280' },
  badgeText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
});
