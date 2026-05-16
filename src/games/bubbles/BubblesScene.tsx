import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

import {
  createRound,
  spawnBubble,
  getConfigForDifficulty,
  DIFFICULTY_PRESETS,
  ROUND_TARGETS,
} from './logic';
import {
  BubblesRound,
  BubbleTapResult,
  BubblesDifficulty,
  Bubble,
} from './types';

type Props = {
  difficulty: BubblesDifficulty;
  onRoundComplete: (result: BubbleTapResult, roundFinished: boolean) => void;
  onAllRoundsComplete: () => void;
  currentRoundIndex: number;
  totalRounds: number;
};

export function BubblesScene({
  difficulty,
  onRoundComplete,
  onAllRoundsComplete,
  currentRoundIndex,
  totalRounds,
}: Props) {
  const config = getConfigForDifficulty(difficulty);
  const settings = DIFFICULTY_PRESETS[difficulty];

  const [round, setRound] = useState<BubblesRound>(() => createRound(currentRoundIndex, config));
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [containerSize, setContainerSize] = useState({ width: 0, height: 600 });

  const spawnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Round değişince yeniden başlat
  useEffect(() => {
    setRound(createRound(currentRoundIndex, config));
    setBubbles([]);
    setFeedback('idle');
  }, [currentRoundIndex, difficulty]);

  // Baloncuk üretimi
  useEffect(() => {
    spawnIntervalRef.current = setInterval(() => {
      const newBubble = spawnBubble(round.target);
      setBubbles((prev) => [...prev, newBubble]);
    }, settings.spawnIntervalMs);

    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    };
  }, [round.target, settings.spawnIntervalMs]);

  function onContainerLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });
  }

  function removeBubble(id: string) {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  }

  function handleBubbleTap(bubble: Bubble) {
    if (feedback !== 'idle') return;

    const tapResult: BubbleTapResult = {
      tappedLetter: bubble.letter,
      isTarget: bubble.isTarget,
      reactionTimeMs: Date.now() - bubble.spawnedAt,
    };

    removeBubble(bubble.id);

    if (bubble.isTarget) {
      setFeedback('correct');
      const newPopped = round.poppedTargets + 1;
      setRound((prev) => ({ ...prev, poppedTargets: newPopped }));

      const roundComplete = newPopped >= round.totalTargetsNeeded;

      setTimeout(() => {
        setFeedback('idle');
        onRoundComplete(tapResult, roundComplete);

        if (roundComplete && currentRoundIndex + 1 >= totalRounds) {
          onAllRoundsComplete();
        }
      }, 300);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback('idle');
        onRoundComplete(tapResult, false);
      }, 500);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.promptContainer}>
        <Text style={styles.promptLabel}>{round.target.description}</Text>
        <Text style={styles.progressText}>
          Patlatılan: {round.poppedTargets} / {round.totalTargetsNeeded}
        </Text>
      </View>

      <View style={styles.playArea} onLayout={onContainerLayout}>
        {bubbles.map((bubble) => (
          <BubbleItem
            key={bubble.id}
            bubble={bubble}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
            riseDurationMs={settings.riseDurationMs}
            onPress={() => handleBubbleTap(bubble)}
            onExpire={() => removeBubble(bubble.id)}
            disabled={feedback !== 'idle'}
          />
        ))}
      </View>

      {feedback === 'correct' && (
        <View style={[styles.feedbackBadge, styles.feedbackCorrect]}>
          <Text style={styles.feedbackText}>🎊 Patlattın!</Text>
        </View>
      )}
      {feedback === 'wrong' && (
        <View style={[styles.feedbackBadge, styles.feedbackWrong]}>
          <Text style={styles.feedbackText}>O değil!</Text>
        </View>
      )}
    </View>
  );
}

type BubbleItemProps = {
  bubble: Bubble;
  containerWidth: number;
  containerHeight: number;
  riseDurationMs: number;
  onPress: () => void;
  onExpire: () => void;
  disabled: boolean;
};

function BubbleItem({
  bubble,
  containerWidth,
  containerHeight,
  riseDurationMs,
  onPress,
  onExpire,
  disabled,
}: BubbleItemProps) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Aşağıdan yukarı çık
    translateY.value = withTiming(
      -(containerHeight + 100),
      { duration: riseDurationMs, easing: Easing.linear },
      (finished) => {
        if (finished) {
          runOnJS(onExpire)();
        }
      }
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const left = Math.max(20, Math.min(containerWidth - 70, bubble.startX * containerWidth - 35));

  return (
    <Animated.View
      style={[
        styles.bubbleContainer,
        { left, bottom: -70 },
        animatedStyle,
      ]}>
      <TouchableOpacity
        style={[styles.bubble, bubble.isTarget && styles.bubbleTarget]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}>
        <Text style={styles.bubbleEmoji}>🫧</Text>
        <Text style={styles.bubbleLetter}>{bubble.letter}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1929',
  },
  promptContainer: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  promptLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  progressText: {
    fontSize: 16,
    color: '#a0a0c0',
  },
  playArea: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  bubbleContainer: {
    position: 'absolute',
  },
  bubble: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleTarget: {
    // Tüm baloncuklar görsel olarak aynı — oyuncu harfe bakacak
  },
  bubbleEmoji: {
    position: 'absolute',
    fontSize: 70,
    opacity: 0.85,
  },
  bubbleLetter: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  feedbackBadge: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    zIndex: 20,
  },
  feedbackCorrect: {
    backgroundColor: '#22c55e',
  },
  feedbackWrong: {
    backgroundColor: '#ef4444',
  },
  feedbackText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
