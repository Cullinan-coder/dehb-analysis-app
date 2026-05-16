import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { generateRound, pickRoundWords, DEFAULT_CONFIG } from './logic';
import { RobotFactoryRound, WordResult } from './types';
import { WordEntry } from './wordList';

type Props = {
  onWordComplete: (result: WordResult) => void;
  onAllRoundsComplete: () => void;
  currentRoundIndex: number;
};

export function RobotFactoryScene({ onWordComplete, onAllRoundsComplete, currentRoundIndex }: Props) {
  const wordsRef = useRef<WordEntry[]>(pickRoundWords(DEFAULT_CONFIG.totalRounds));
  const [round, setRound] = useState<RobotFactoryRound>(() => generateRound(wordsRef.current[0], DEFAULT_CONFIG));
  const [builtSyllables, setBuiltSyllables] = useState<string[]>([]);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong' | 'timeout' | 'complete'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongFlashRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const entry = wordsRef.current[currentRoundIndex];
    if (!entry) return;
    setRound(generateRound(entry, DEFAULT_CONFIG));
    setBuiltSyllables([]);
    setWrongTaps(0);
    setFeedback('idle');
    timeoutRef.current = setTimeout(() => handleTimeout(), DEFAULT_CONFIG.roundTimeoutMs);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (advanceRef.current) clearTimeout(advanceRef.current);
      if (wrongFlashRef.current) clearTimeout(wrongFlashRef.current);
    };
  }, [currentRoundIndex]);

  function advance(result: WordResult, delayMs: number) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    advanceRef.current = setTimeout(() => {
      onWordComplete(result);
      if (currentRoundIndex + 1 >= DEFAULT_CONFIG.totalRounds) {
        onAllRoundsComplete();
      }
    }, delayMs);
  }

  function handleSyllableTap(syllable: string) {
    if (feedback === 'complete' || feedback === 'timeout') return;

    const nextIndex = builtSyllables.length;
    const expected = round.correctSyllables[nextIndex];

    if (syllable === expected) {
      const newBuilt = [...builtSyllables, syllable];
      setBuiltSyllables(newBuilt);

      if (newBuilt.length === round.correctSyllables.length) {
        setFeedback('complete');
        advance(
          {
            word: round.word,
            completed: true,
            wrongTaps,
            isTimeout: false,
            reactionTimeMs: Date.now() - round.startedAt,
          },
          400
        );
      }
    } else {
      setWrongTaps((w) => w + 1);
      setFeedback('wrong');
      if (wrongFlashRef.current) clearTimeout(wrongFlashRef.current);
      wrongFlashRef.current = setTimeout(() => setFeedback('idle'), 400);
    }
  }

  function handleTimeout() {
    if (feedback === 'complete') return;
    setFeedback('timeout');
    advance(
      {
        word: round.word,
        completed: builtSyllables.length === round.correctSyllables.length,
        wrongTaps,
        isTimeout: true,
        reactionTimeMs: DEFAULT_CONFIG.roundTimeoutMs,
      },
      800
    );
  }

  const flashColor =
    feedback === 'wrong' ? '#3b0a0a' :
    feedback === 'complete' ? '#0a3b1f' :
    feedback === 'timeout' ? '#1f1f2e' :
    '#1a1a2e';

  return (
    <View style={[styles.container, { backgroundColor: flashColor }]}>
      <View style={styles.header}>
        <Text style={styles.targetLabel}>Yap:</Text>
        <Text style={styles.targetWord}>{round.word}</Text>
      </View>

      <View style={styles.buildArea}>
        {round.correctSyllables.map((_, idx) => {
          const filled = builtSyllables[idx];
          return (
            <View key={idx} style={[styles.slot, filled ? styles.slotFilled : styles.slotEmpty]}>
              <Text style={styles.slotText}>{filled ?? '_'}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.choicesGrid}>
        {round.choices.map((syllable, idx) => {
          const isUsed = builtSyllables.filter((s) => s === syllable).length >=
                         round.correctSyllables.filter((s) => s === syllable).length;
          return (
            <TouchableOpacity
              key={`${currentRoundIndex}-${idx}`}
              style={[styles.choiceButton, isUsed && styles.choiceButtonUsed]}
              onPress={() => handleSyllableTap(syllable)}
              disabled={isUsed || feedback === 'complete' || feedback === 'timeout'}
              activeOpacity={0.7}>
              <Text style={styles.choiceText}>{syllable}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {feedback === 'complete' && (
        <View style={[styles.badge, styles.badgeCorrect]}><Text style={styles.badgeText}>✓ Süper!</Text></View>
      )}
      {feedback === 'timeout' && (
        <View style={[styles.badge, styles.badgeTimeout]}><Text style={styles.badgeText}>⏰ Süre doldu</Text></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 32 },
  header: { alignItems: 'center', marginBottom: 32 },
  targetLabel: { fontSize: 18, color: '#a0a0c0', marginBottom: 8 },
  targetWord: { fontSize: 64, fontWeight: 'bold', color: '#ffffff', letterSpacing: 4 },
  buildArea: { flexDirection: 'row', gap: 12, marginBottom: 48 },
  slot: { minWidth: 80, height: 80, borderRadius: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, borderWidth: 2 },
  slotEmpty: { borderColor: '#4630EB', borderStyle: 'dashed', backgroundColor: 'transparent' },
  slotFilled: { borderColor: '#22c55e', backgroundColor: '#0f2818' },
  slotText: { fontSize: 32, fontWeight: 'bold', color: '#ffffff' },
  choicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, maxWidth: 600 },
  choiceButton: { paddingHorizontal: 22, paddingVertical: 18, backgroundColor: '#4630EB', borderRadius: 16, minWidth: 90, alignItems: 'center' },
  choiceButtonUsed: { backgroundColor: '#2d2d44', opacity: 0.4 },
  choiceText: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  badge: { position: 'absolute', bottom: 60, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30 },
  badgeCorrect: { backgroundColor: '#22c55e' },
  badgeTimeout: { backgroundColor: '#6b7280' },
  badgeText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
});
