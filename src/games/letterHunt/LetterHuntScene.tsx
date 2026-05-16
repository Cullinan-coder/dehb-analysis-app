import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// Skia import'ları kaldırıldı — web'de PictureRecorder hatası veriyor.
// Native tablet testinde (Sprint 2) geri eklenecek.
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

import { generateRound, evaluateTap, DEFAULT_CONFIG, getConfigForDifficulty, DIFFICULTY_PRESETS } from './logic';
import { useGameStore } from '../../stores/gameStore';
import { LetterHuntRound, LetterTapResult } from './types';

type Props = {
  onRoundComplete: (result: LetterTapResult) => void;
  onAllRoundsComplete: () => void;
  currentRoundIndex: number;
};

export function LetterHuntScene({ onRoundComplete, onAllRoundsComplete, currentRoundIndex }: Props) {
  const letterHuntDifficulty = useGameStore((s) => s.letterHuntDifficulty);
  const config = getConfigForDifficulty(letterHuntDifficulty);
  const fontSize = DIFFICULTY_PRESETS[letterHuntDifficulty].fontSize;

  const [round, setRound] = useState<LetterHuntRound>(() => generateRound(config));
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  useEffect(() => {
    setRound(generateRound(config));
    setFeedback('idle');
  }, [currentRoundIndex, letterHuntDifficulty]);

  function handleTap(letter: string) {
    if (feedback !== 'idle') return;

    const result = evaluateTap(round, letter);
    setFeedback(result.correct ? 'correct' : 'wrong');

    const tapResult: LetterTapResult = {
      tappedLetter: letter,
      targetLetter: round.target,
      correct: result.correct,
      reactionTimeMs: result.reactionTimeMs,
    };

    setTimeout(() => {
      onRoundComplete(tapResult);

      if (currentRoundIndex + 1 >= DEFAULT_CONFIG.totalRounds) {
        onAllRoundsComplete();
      }
    }, 800);
  }

  const bgColor = feedback === 'correct' ? '#0a3b1f' : feedback === 'wrong' ? '#3b0a0a' : '#1a1a2e';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
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
            feedbackState={feedback}
            isTarget={choice.isTarget}
            fontSize={fontSize}
          />
        ))}
      </View>

      {feedback === 'correct' && (
        <View style={[styles.feedbackBadge, styles.feedbackCorrect]}>
          <Text style={styles.feedbackText}>✓ Harika!</Text>
        </View>
      )}
      {feedback === 'wrong' && (
        <View style={[styles.feedbackBadge, styles.feedbackWrong]}>
          <Text style={styles.feedbackText}>Tekrar dene!</Text>
        </View>
      )}
    </View>
  );
}

type LetterButtonProps = {
  letter: string;
  disabled: boolean;
  onPress: () => void;
  feedbackState: 'idle' | 'correct' | 'wrong';
  isTarget: boolean;
  fontSize: number;
};

function LetterButton({ letter, disabled, onPress, feedbackState, isTarget, fontSize }: LetterButtonProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (feedbackState === 'correct' && isTarget) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 8 }),
        withTiming(1, { duration: 300 })
      );
    }
  }, [feedbackState]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[styles.letterButton, disabled && styles.letterButtonDisabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}>
        <Text style={[styles.letterText, { fontSize: fontSize * 0.5 }]}>{letter}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  promptContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  promptLabel: {
    fontSize: 24,
    color: '#a0a0c0',
    marginBottom: 8,
  },
  promptLetter: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: '#4630EB',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    maxWidth: 600,
  },
  letterButton: {
    width: 90,
    height: 90,
    backgroundColor: '#4630EB',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4630EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  letterButtonDisabled: {
    opacity: 0.6,
  },
  letterText: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  feedbackBadge: {
    position: 'absolute',
    bottom: 100,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  feedbackCorrect: {
    backgroundColor: '#22c55e',
  },
  feedbackWrong: {
    backgroundColor: '#ef4444',
  },
  feedbackText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
