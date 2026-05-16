import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

import {
  generateRound,
  evaluateTap,
  getConfigForDifficulty,
  DIFFICULTY_PRESETS,
} from './logic';
import { FrogJumpRound, FrogJumpTapResult, FrogJumpDifficulty } from './types';

type Props = {
  difficulty: FrogJumpDifficulty;
  onRoundComplete: (result: FrogJumpTapResult, roundFinished: boolean) => void;
  onAllRoundsComplete: () => void;
  currentRoundIndex: number;
  totalRounds: number;
};

export function FrogJumpScene({
  difficulty,
  onRoundComplete,
  onAllRoundsComplete,
  currentRoundIndex,
  totalRounds,
}: Props) {
  const config = getConfigForDifficulty(difficulty);
  const fontSize = DIFFICULTY_PRESETS[difficulty].fontSize;

  const [round, setRound] = useState<FrogJumpRound>(() => generateRound(config));
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [hintNumber, setHintNumber] = useState<number | null>(null);

  useEffect(() => {
    setRound(generateRound(config));
    setFeedback('idle');
    setHintNumber(null);
  }, [currentRoundIndex, difficulty]);

  function handleTap(tappedNumber: number) {
    if (feedback !== 'idle') return;

    const result = evaluateTap(round, tappedNumber);
    const expectedNumber = round.targetSequence[round.currentTargetIndex];

    const tapResult: FrogJumpTapResult = {
      tappedNumber,
      expectedNumber,
      correct: result.correct,
      reactionTimeMs: result.reactionTimeMs,
    };

    if (result.correct) {
      setFeedback('correct');
      // Round içinde ilerle
      setRound((prev) => ({
        ...prev,
        currentTargetIndex: result.nextTargetIndex,
      }));

      setTimeout(() => {
        setFeedback('idle');
        onRoundComplete(tapResult, result.roundComplete);

        if (result.roundComplete && currentRoundIndex + 1 >= totalRounds) {
          onAllRoundsComplete();
        }
      }, 500);
    } else {
      setFeedback('wrong');
      setHintNumber(expectedNumber); // İpucu: doğru sayıyı parlat

      setTimeout(() => {
        setFeedback('idle');
        setHintNumber(null);
        onRoundComplete(tapResult, false);
      }, 1200);
    }
  }

  const currentTarget = round.targetSequence[round.currentTargetIndex];

  return (
    <View style={styles.container}>
      <View style={styles.promptContainer}>
        <Text style={styles.promptLabel}>Şimdi sıra:</Text>
        <Text style={styles.promptNumber}>{currentTarget ?? '🎉'}</Text>
        <Text style={styles.progressText}>
          {round.currentTargetIndex} / {round.targetSequence.length}
        </Text>
      </View>

      <View style={styles.river}>
        <Text style={styles.waterTop}>🌊  🌊  🌊  🌊</Text>

        <View style={styles.padsGrid}>
          {round.pads.map((pad) => (
            <LilyPadButton
              key={`${currentRoundIndex}-${pad.number}`}
              number={pad.number}
              fontSize={fontSize}
              disabled={feedback !== 'idle'}
              isHint={hintNumber === pad.number}
              onPress={() => handleTap(pad.number)}
            />
          ))}
        </View>

        <Text style={styles.waterBottom}>🌊  🌊  🌊  🌊</Text>
      </View>

      <View style={styles.frogContainer}>
        <Text style={styles.frog}>🐸</Text>
      </View>

      {feedback === 'correct' && (
        <View style={[styles.feedbackBadge, styles.feedbackCorrect]}>
          <Text style={styles.feedbackText}>Vırak! 🎵</Text>
        </View>
      )}
      {feedback === 'wrong' && (
        <View style={[styles.feedbackBadge, styles.feedbackWrong]}>
          <Text style={styles.feedbackText}>Tekrar bak! 💡</Text>
        </View>
      )}
    </View>
  );
}

type LilyPadProps = {
  number: number;
  fontSize: number;
  disabled: boolean;
  isHint: boolean;
  onPress: () => void;
};

function LilyPadButton({ number, fontSize, disabled, isHint, onPress }: LilyPadProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (isHint) {
      // İpucu: hafifçe parlat
      glow.value = withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 400 }),
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 400 })
      );
      scale.value = withSequence(
        withSpring(1.1, { damping: 8 }),
        withTiming(1, { duration: 300 })
      );
    }
  }, [isHint]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: 0.3 + glow.value * 0.7,
    shadowRadius: 8 + glow.value * 16,
  }));

  return (
    <Animated.View style={[styles.lilyPad, animatedStyle, isHint && styles.lilyPadHint]}>
      <TouchableOpacity
        style={styles.padTouch}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}>
        <Text style={styles.lilyEmoji}>🍀</Text>
        <Text style={[styles.padNumber, { fontSize }]}>{number}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0a1929',
    paddingVertical: 24,
  },
  promptContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  promptLabel: {
    fontSize: 20,
    color: '#a0a0c0',
    marginBottom: 4,
  },
  promptNumber: {
    fontSize: 96,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: '#22c55e',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  progressText: {
    fontSize: 16,
    color: '#a0a0c0',
    marginTop: 4,
  },
  river: {
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  waterTop: {
    fontSize: 24,
    color: '#3b82f6',
    marginBottom: 8,
  },
  waterBottom: {
    fontSize: 24,
    color: '#3b82f6',
    marginTop: 8,
  },
  padsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    maxWidth: 720,
  },
  lilyPad: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  lilyPadHint: {
    backgroundColor: '#facc15',
  },
  padTouch: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lilyEmoji: {
    position: 'absolute',
    fontSize: 88,
    opacity: 0.4,
  },
  padNumber: {
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  frogContainer: {
    marginBottom: 16,
  },
  frog: {
    fontSize: 64,
  },
  feedbackBadge: {
    position: 'absolute',
    bottom: 120,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  feedbackCorrect: {
    backgroundColor: '#22c55e',
  },
  feedbackWrong: {
    backgroundColor: '#facc15',
  },
  feedbackText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
