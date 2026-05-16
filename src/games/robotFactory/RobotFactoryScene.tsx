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
  tryPlaceSyllable,
  getConfigForDifficulty,
} from './logic';
import {
  RobotRound,
  RobotPlaceResult,
  RobotDifficulty,
  SyllableItem,
} from './types';

type Props = {
  difficulty: RobotDifficulty;
  onRoundComplete: (result: RobotPlaceResult, roundFinished: boolean) => void;
  onAllRoundsComplete: () => void;
  currentRoundIndex: number;
  totalRounds: number;
};

export function RobotFactoryScene({
  difficulty,
  onRoundComplete,
  onAllRoundsComplete,
  currentRoundIndex,
  totalRounds,
}: Props) {
  const config = getConfigForDifficulty(difficulty);

  const [round, setRound] = useState<RobotRound>(() => generateRound(config));
  const [selectedSyllableId, setSelectedSyllableId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [wrongSlotHint, setWrongSlotHint] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setRound(generateRound(config));
    setSelectedSyllableId(null);
    setFeedback('idle');
    setWrongSlotHint(null);
    setShowCelebration(false);
  }, [currentRoundIndex, difficulty]);

  function handleSyllablePress(syllable: SyllableItem) {
    if (feedback !== 'idle' || syllable.placed) return;
    // Toggle: aynı heceye tekrar basarsa seçimi iptal
    if (selectedSyllableId === syllable.id) {
      setSelectedSyllableId(null);
    } else {
      setSelectedSyllableId(syllable.id);
    }
  }

  function handleSlotPress(slotIndex: number) {
    if (feedback !== 'idle') return;
    if (!selectedSyllableId) {
      // Hece seçmeden slot'a basıldı — ipucu olarak slotu parlat
      return;
    }
    if (round.slots[slotIndex].filledWith) return; // dolu slot

    const selectedSyl = round.pool.find((s) => s.id === selectedSyllableId);
    if (!selectedSyl) return;

    const result = tryPlaceSyllable(round, selectedSyllableId, slotIndex);

    const placeResult: RobotPlaceResult = {
      syllableId: selectedSyllableId,
      syllable: selectedSyl.syllable,
      slotIndex,
      correct: result.correct,
      reactionTimeMs: result.reactionTimeMs,
    };

    if (result.correct) {
      setFeedback('correct');
      setRound(result.newRound);
      setSelectedSyllableId(null);

      setTimeout(() => {
        setFeedback('idle');
        onRoundComplete(placeResult, result.roundComplete);

        if (result.roundComplete) {
          setShowCelebration(true);
          setTimeout(() => {
            setShowCelebration(false);
            if (currentRoundIndex + 1 >= totalRounds) {
              onAllRoundsComplete();
            }
          }, 1500);
        }
      }, 400);
    } else {
      setFeedback('wrong');
      setWrongSlotHint(slotIndex);
      setSelectedSyllableId(null);

      setTimeout(() => {
        setFeedback('idle');
        setWrongSlotHint(null);
        onRoundComplete(placeResult, false);
      }, 800);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.promptContainer}>
        <Text style={styles.promptLabel}>Robotu birleştir:</Text>
        <Text style={styles.targetWord}>{round.targetWord}</Text>
      </View>

      {/* Robot Gövdesi + Slotlar */}
      <View style={styles.robotArea}>
        <Text style={styles.robotEmoji}>{showCelebration ? '🤖✨' : '🤖'}</Text>

        <View style={styles.slotsContainer}>
          {round.slots.map((slot, idx) => (
            <SlotBox
              key={idx}
              slot={slot}
              isWrongHint={wrongSlotHint === idx}
              isClickable={selectedSyllableId !== null && !slot.filledWith}
              onPress={() => handleSlotPress(idx)}
            />
          ))}
        </View>
      </View>

      {/* Hece Havuzu */}
      <View style={styles.poolContainer}>
        <Text style={styles.poolLabel}>Heceler:</Text>
        <View style={styles.poolGrid}>
          {round.pool.map((syl) => (
            <SyllableButton
              key={syl.id}
              syllable={syl}
              selected={selectedSyllableId === syl.id}
              onPress={() => handleSyllablePress(syl)}
              disabled={feedback !== 'idle'}
            />
          ))}
        </View>
      </View>

      {feedback === 'correct' && !showCelebration && (
        <View style={[styles.feedbackBadge, styles.feedbackCorrect]}>
          <Text style={styles.feedbackText}>Vrrrt! ⚙️</Text>
        </View>
      )}
      {feedback === 'wrong' && (
        <View style={[styles.feedbackBadge, styles.feedbackWrong]}>
          <Text style={styles.feedbackText}>Tekrar dene! 💡</Text>
        </View>
      )}
      {showCelebration && (
        <View style={[styles.feedbackBadge, styles.celebrationBadge]}>
          <Text style={styles.celebrationText}>🎉 {round.targetWord}! 🎉</Text>
        </View>
      )}
    </View>
  );
}

type SyllableButtonProps = {
  syllable: SyllableItem;
  selected: boolean;
  onPress: () => void;
  disabled: boolean;
};

function SyllableButton({ syllable, selected, onPress, disabled }: SyllableButtonProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (selected) {
      scale.value = withSpring(1.15, { damping: 10 });
    } else {
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (syllable.placed) {
    return (
      <View style={[styles.syllableButton, styles.syllablePlaced]}>
        <Text style={styles.syllablePlacedText}>{syllable.syllable}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.syllableButton,
          selected && styles.syllableSelected,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}>
        <Text style={styles.syllableText}>{syllable.syllable}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

type SlotProps = {
  slot: { index: number; expectedSyllable: string; filledWith: string | null };
  isWrongHint: boolean;
  isClickable: boolean;
  onPress: () => void;
};

function SlotBox({ slot, isWrongHint, isClickable, onPress }: SlotProps) {
  const glow = useSharedValue(0);

  useEffect(() => {
    if (isWrongHint) {
      glow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 200 }),
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 200 })
      );
    }
  }, [isWrongHint]);

  const animatedStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.3 + glow.value * 0.6,
    shadowRadius: 8 + glow.value * 12,
  }));

  return (
    <Animated.View style={[
      styles.slot,
      slot.filledWith && styles.slotFilled,
      isClickable && !slot.filledWith && styles.slotClickable,
      animatedStyle,
    ]}>
      <TouchableOpacity
        style={styles.slotTouch}
        onPress={onPress}
        disabled={!isClickable || !!slot.filledWith}
        activeOpacity={0.7}>
        <Text style={styles.slotText}>
          {slot.filledWith ?? '?'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promptContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  promptLabel: {
    fontSize: 18,
    color: '#a0a0c0',
    marginBottom: 4,
  },
  targetWord: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 4,
    textShadowColor: '#4630EB',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  robotArea: {
    alignItems: 'center',
  },
  robotEmoji: {
    fontSize: 96,
    marginBottom: 16,
  },
  slotsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  slot: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#16213e',
    borderWidth: 3,
    borderColor: '#4630EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#facc15',
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  slotFilled: {
    backgroundColor: '#22c55e',
    borderStyle: 'solid',
    borderColor: '#22c55e',
  },
  slotClickable: {
    borderColor: '#facc15',
  },
  slotTouch: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  poolContainer: {
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  poolLabel: {
    fontSize: 16,
    color: '#a0a0c0',
    marginBottom: 12,
  },
  poolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    maxWidth: 600,
  },
  syllableButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#4630EB',
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  syllableSelected: {
    backgroundColor: '#facc15',
  },
  syllablePlaced: {
    backgroundColor: '#2d2d44',
    opacity: 0.4,
  },
  syllableText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  syllablePlacedText: {
    fontSize: 24,
    color: '#666',
    textDecorationLine: 'line-through',
  },
  feedbackBadge: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
  },
  feedbackCorrect: {
    backgroundColor: '#22c55e',
  },
  feedbackWrong: {
    backgroundColor: '#facc15',
  },
  celebrationBadge: {
    backgroundColor: '#facc15',
    paddingHorizontal: 48,
    paddingVertical: 20,
  },
  feedbackText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  celebrationText: {
    color: '#000000',
    fontSize: 28,
    fontWeight: 'bold',
  },
});
