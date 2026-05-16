import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import { spawnBubble, DEFAULT_CONFIG, isVowel } from './logic';
import { Bubble, BubbleTapResult } from './types';

type Props = {
  onBubbleResult: (result: BubbleTapResult) => void;
  onGameComplete: () => void;
};

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export function BubblesScene({ onBubbleResult, onGameComplete }: Props) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [timeLeft, setTimeLeft] = useState(Math.floor(DEFAULT_CONFIG.durationMs / 1000));
  const tappedRef = useRef<Set<string>>(new Set());
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Spawner
    spawnTimerRef.current = setInterval(() => {
      const newBubble = spawnBubble(DEFAULT_CONFIG);
      setBubbles((prev) => [...prev, newBubble]);
    }, DEFAULT_CONFIG.spawnIntervalMs);

    // Countdown
    countdownRef.current = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);

    // Oyun sonu
    endTimerRef.current = setTimeout(() => {
      handleGameEnd();
    }, DEFAULT_CONFIG.durationMs);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (endTimerRef.current) clearTimeout(endTimerRef.current);
    };
  }, []);

  function handleGameEnd() {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    // Ekranda kalan baloncukları omisyon/correct_reject olarak işle
    setBubbles((current) => {
      current.forEach((b) => {
        if (!tappedRef.current.has(b.id)) {
          if (b.isVowel) {
            onBubbleResult({ type: 'omission', letter: b.letter });
          } else {
            onBubbleResult({ type: 'correct_reject', letter: b.letter });
          }
        }
      });
      return [];
    });
    onGameComplete();
  }

  function handleBubbleTap(bubble: Bubble) {
    if (tappedRef.current.has(bubble.id)) return;
    tappedRef.current.add(bubble.id);
    const reactionTimeMs = Date.now() - bubble.spawnedAt;
    if (bubble.isVowel) {
      onBubbleResult({ type: 'correct_hit', letter: bubble.letter, reactionTimeMs });
    } else {
      onBubbleResult({ type: 'commission', letter: bubble.letter, reactionTimeMs });
    }
    setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
  }

  function handleBubbleExpire(bubble: Bubble) {
    if (tappedRef.current.has(bubble.id)) return;
    tappedRef.current.add(bubble.id);
    if (bubble.isVowel) {
      onBubbleResult({ type: 'omission', letter: bubble.letter });
    } else {
      onBubbleResult({ type: 'correct_reject', letter: bubble.letter });
    }
    setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
  }

  const timeColor = timeLeft <= 10 ? '#ef4444' : '#ffffff';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.rule}>🔊 SADECE SESLİ harfli baloncukları patlat!</Text>
        <Text style={[styles.timer, { color: timeColor }]}>{timeLeft}s</Text>
      </View>

      <View style={styles.gameArea}>
        {bubbles.map((bubble) => (
          <BubbleView
            key={bubble.id}
            bubble={bubble}
            onTap={() => handleBubbleTap(bubble)}
            onExpire={() => handleBubbleExpire(bubble)}
          />
        ))}
      </View>
    </View>
  );
}

function BubbleView({ bubble, onTap, onExpire }: { bubble: Bubble; onTap: () => void; onExpire: () => void }) {
  const startX = useRef(Math.random() * (SCREEN_WIDTH - 100) + 25).current;
  const y = useSharedValue(SCREEN_HEIGHT - 200);
  const expiredRef = useRef(false);

  useEffect(() => {
    y.value = withTiming(
      -100,
      { duration: DEFAULT_CONFIG.bubbleLifetimeMs, easing: Easing.linear },
      (finished) => {
        if (finished && !expiredRef.current) {
          expiredRef.current = true;
          runOnJS(onExpire)();
        }
      }
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View style={[styles.bubbleWrapper, { left: startX }, animatedStyle]}>
      <TouchableOpacity onPress={onTap} activeOpacity={0.6}>
        <View style={[styles.bubble, bubble.isVowel ? styles.bubbleVowel : styles.bubbleConsonant]}>
          <Text style={styles.bubbleText}>{bubble.letter}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, alignItems: 'center', gap: 8 },
  rule: { fontSize: 18, fontWeight: '700', color: '#ffffff', textAlign: 'center' },
  timer: { fontSize: 36, fontWeight: 'bold' },
  gameArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  bubbleWrapper: { position: 'absolute' },
  bubble: { width: 84, height: 84, borderRadius: 42, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  bubbleVowel: { backgroundColor: '#4630EB' },
  bubbleConsonant: { backgroundColor: '#7a4a4a' },
  bubbleText: { fontSize: 38, fontWeight: 'bold', color: '#ffffff' },
});
