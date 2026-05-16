import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import { DEFAULT_CONFIG, scoreDelta } from './logic';
import { BeatResult } from './types';

type Props = {
  onBeatResult: (result: BeatResult) => void;
  onGameComplete: () => void;
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CIRCLE_SIZE = 220;
const SAFE_MARGIN = 40;
const COUNTER_RESERVED_TOP = 80;
const BOTTOM_RESERVED = 140;

export function RhythmScene({ onBeatResult, onGameComplete }: Props) {
  const [beatIndex, setBeatIndex] = useState(0);
  const [flash, setFlash] = useState<'idle' | 'perfect' | 'good' | 'ok' | 'miss'>('idle');
  const beatTimestampRef = useRef<number>(0);
  const beatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tappedThisBeatRef = useRef<boolean>(false);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);
  const circleX = useSharedValue(SCREEN_W / 2 - CIRCLE_SIZE / 2);
  const circleY = useSharedValue(SCREEN_H / 2 - CIRCLE_SIZE / 2);

  useEffect(() => {
    triggerBeat(0);
    let count = 1;
    beatTimerRef.current = setInterval(() => {
      if (count >= DEFAULT_CONFIG.totalBeats) {
        evaluatePreviousBeat();
        if (beatTimerRef.current) clearInterval(beatTimerRef.current);
        onGameComplete();
        return;
      }
      evaluatePreviousBeat();
      triggerBeat(count);
      count++;
    }, DEFAULT_CONFIG.beatIntervalMs);

    return () => {
      if (beatTimerRef.current) clearInterval(beatTimerRef.current);
    };
  }, []);

  function triggerBeat(idx: number) {
    setBeatIndex(idx);
    beatTimestampRef.current = Date.now();
    tappedThisBeatRef.current = false;
    const maxX = SCREEN_W - CIRCLE_SIZE - SAFE_MARGIN;
    const maxY = SCREEN_H - CIRCLE_SIZE - BOTTOM_RESERVED;
    const minX = SAFE_MARGIN;
    const minY = COUNTER_RESERVED_TOP;
    circleX.value = Math.random() * (maxX - minX) + minX;
    circleY.value = Math.random() * (maxY - minY) + minY;
    pulseScale.value = withSequence(withTiming(1.25, { duration: 100 }), withTiming(1, { duration: 200 }));
    pulseOpacity.value = withSequence(withTiming(1, { duration: 100 }), withTiming(0.4, { duration: 800 }));
  }

  function evaluatePreviousBeat() {
    if (!tappedThisBeatRef.current) {
      const result: BeatResult = { beatIndex, tapDelta: null, score: 0 };
      onBeatResult(result);
      setFlash('miss');
      setTimeout(() => setFlash('idle'), 300);
    }
  }

  function handleTap() {
    if (tappedThisBeatRef.current) return;
    tappedThisBeatRef.current = true;
    const delta = Date.now() - beatTimestampRef.current;
    const score = scoreDelta(delta, DEFAULT_CONFIG);
    const result: BeatResult = { beatIndex, tapDelta: delta, score };
    onBeatResult(result);

    if (score === 100) setFlash('perfect');
    else if (score === 75) setFlash('good');
    else if (score === 50) setFlash('ok');
    else setFlash('miss');
    setTimeout(() => setFlash('idle'), 300);
  }

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: circleX.value },
      { translateY: circleY.value },
      { scale: pulseScale.value },
    ],
    opacity: pulseOpacity.value,
  }));

  const flashLabel =
    flash === 'perfect' ? 'Mükemmel!' :
    flash === 'good' ? 'İyi!' :
    flash === 'ok' ? 'Olur' :
    flash === 'miss' ? 'Kaçtı' : '';
  const flashColor =
    flash === 'perfect' ? '#22c55e' :
    flash === 'good' ? '#84cc16' :
    flash === 'ok' ? '#eab308' :
    flash === 'miss' ? '#ef4444' : 'transparent';

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>Vuruş: {Math.min(beatIndex + 1, DEFAULT_CONFIG.totalBeats)}/{DEFAULT_CONFIG.totalBeats}</Text>

      <TouchableOpacity style={styles.tapArea} onPress={handleTap} activeOpacity={1}>
        <Animated.View style={[styles.pulseCircle, pulseStyle]} />
        <Text style={styles.instruction}>Yanıp sönen daireye ritimle dokun!</Text>
      </TouchableOpacity>

      {flashLabel ? (
        <View style={[styles.flashBadge, { backgroundColor: flashColor }]}>
          <Text style={styles.flashText}>{flashLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' },
  counter: { position: 'absolute', top: 32, fontSize: 20, fontWeight: 'bold', color: '#a0a0c0' },
  tapArea: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  pulseCircle: { position: 'absolute', top: 0, left: 0, width: 220, height: 220, borderRadius: 110, backgroundColor: '#4630EB', shadowColor: '#4630EB', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 30, elevation: 20 },
  instruction: { position: 'absolute', bottom: 80, fontSize: 16, color: '#a0a0c0', textAlign: 'center', paddingHorizontal: 32 },
  flashBadge: { position: 'absolute', bottom: 32, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24 },
  flashText: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
});
