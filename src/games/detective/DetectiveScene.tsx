import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutChangeEvent, Platform } from 'react-native';
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
import { DetectiveRound, DetectiveTapResult, DetectiveDifficulty, LetterItem } from './types';

type Props = {
  difficulty: DetectiveDifficulty;
  onRoundComplete: (result: DetectiveTapResult, roundFinished: boolean) => void;
  onAllRoundsComplete: () => void;
  currentRoundIndex: number;
  totalRounds: number;
};

export function DetectiveScene({
  difficulty,
  onRoundComplete,
  onAllRoundsComplete,
  currentRoundIndex,
  totalRounds,
}: Props) {
  const config = getConfigForDifficulty(difficulty);
  const flashlightRadius = DIFFICULTY_PRESETS[difficulty].flashlightRadius;

  const [round, setRound] = useState<DetectiveRound>(() => generateRound(config));
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [pointerActive, setPointerActive] = useState(false);

  useEffect(() => {
    setRound(generateRound(config));
    setFeedback('idle');
    setPointerActive(false);
  }, [currentRoundIndex, difficulty]);

  function onContainerLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });
  }

  function handlePointerMove(e: any) {
    // React Native Web pointer events
    if (Platform.OS === 'web') {
      const rect = e.currentTarget.getBoundingClientRect?.();
      if (rect) {
        setPointerPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        setPointerActive(true);
      }
    }
  }

  function handleTouchMove(e: any) {
    // Native touch
    const touch = e.nativeEvent.touches?.[0];
    if (touch) {
      setPointerPos({ x: touch.locationX, y: touch.locationY });
      setPointerActive(true);
    }
  }

  function handleTap(item: LetterItem) {
    if (feedback !== 'idle' || item.found) return;

    const result = evaluateTap(round, item.id);
    const tapResult: DetectiveTapResult = {
      tappedLetter: item.letter,
      targetLetter: round.targetLetter,
      correct: result.correct,
      reactionTimeMs: result.reactionTimeMs,
    };

    if (result.correct) {
      setFeedback('correct');
      setRound(result.newRound);

      setTimeout(() => {
        setFeedback('idle');
        onRoundComplete(tapResult, result.roundComplete);

        if (result.roundComplete && currentRoundIndex + 1 >= totalRounds) {
          onAllRoundsComplete();
        }
      }, 400);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback('idle');
        onRoundComplete(tapResult, false);
      }, 600);
    }
  }

  // Bir öğenin parmaktan uzaklığına göre opacity hesapla
  function getItemOpacity(item: LetterItem): number {
    if (!pointerActive || containerSize.width === 0) return 0.05; // karanlık
    const itemX = item.x * containerSize.width;
    const itemY = item.y * containerSize.height;
    const dx = itemX - pointerPos.x;
    const dy = itemY - pointerPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < flashlightRadius * 0.5) return 1; // tam aydınlık
    if (dist < flashlightRadius) {
      // yumuşak geçiş
      return 1 - (dist - flashlightRadius * 0.5) / (flashlightRadius * 0.5);
    }
    return 0.05; // karanlık
  }

  return (
    <View style={styles.container}>
      <View style={styles.promptContainer}>
        <Text style={styles.promptLabel}>Bul:</Text>
        <Text style={styles.promptLetter}>{round.targetLetter}</Text>
        <Text style={styles.progressText}>
          Bulunan: {round.foundCount} / {round.totalTargets}
        </Text>
      </View>

      <View
        style={styles.darkArea}
        onLayout={onContainerLayout}
        // Web pointer move
        {...(Platform.OS === 'web'
          ? ({ onPointerMove: handlePointerMove, onPointerLeave: () => setPointerActive(false) } as any)
          : { onTouchMove: handleTouchMove, onTouchEnd: () => setPointerActive(false) })}
      >
        {/* Fener efekti — radial gradient mask */}
        {pointerActive && (
          <View
            style={[
              styles.flashlight,
              {
                left: pointerPos.x - flashlightRadius,
                top: pointerPos.y - flashlightRadius,
                width: flashlightRadius * 2,
                height: flashlightRadius * 2,
                borderRadius: flashlightRadius,
              },
            ]}
            pointerEvents="none"
          />
        )}

        {/* Harfler */}
        {round.items.map((item) => {
          if (item.found) return null;
          const opacity = getItemOpacity(item);
          const left = item.x * containerSize.width - 22;
          const top = item.y * containerSize.height - 22;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.letterItem,
                { left, top, opacity: Math.max(opacity, 0.05) },
              ]}
              onPress={() => handleTap(item)}
              disabled={feedback !== 'idle'}
              activeOpacity={0.6}>
              <Text style={styles.letterText}>{item.letter}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {feedback === 'correct' && (
        <View style={[styles.feedbackBadge, styles.feedbackCorrect]}>
          <Text style={styles.feedbackText}>Yakaladın! ✨</Text>
        </View>
      )}
      {feedback === 'wrong' && (
        <View style={[styles.feedbackBadge, styles.feedbackWrong]}>
          <Text style={styles.feedbackText}>Bu o değil!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 16,
  },
  promptContainer: {
    alignItems: 'center',
    marginBottom: 12,
    zIndex: 10,
  },
  promptLabel: {
    fontSize: 18,
    color: '#a0a0c0',
    marginBottom: 4,
  },
  promptLetter: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#facc15',
    textShadowColor: '#fbbf24',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  progressText: {
    fontSize: 16,
    color: '#a0a0c0',
    marginTop: 4,
  },
  darkArea: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    overflow: 'hidden',
    position: 'relative',
    cursor: 'none' as any,
  },
  flashlight: {
    position: 'absolute',
    backgroundColor: 'transparent',
    shadowColor: '#fef3c7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 80,
    elevation: 20,
    // Web: box-shadow ile fener efekti
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 0 80px 40px rgba(254, 243, 199, 0.4), inset 0 0 60px rgba(254, 243, 199, 0.2)',
          backgroundColor: 'rgba(254, 243, 199, 0.08)',
        } as any)
      : {}),
  },
  letterItem: {
    position: 'absolute',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
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
