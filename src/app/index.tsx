import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '../stores/gameStore';
import { getChildScores } from '../services/childScores';

type GameSlot = 'game1' | 'game2' | 'game3' | 'game4' | 'game5';

type GameCard = {
  id: string;
  slot: GameSlot;
  emoji: string;
  title: string;
  description: string;
  route: '/play/letter-hunt' | '/play/bubbles' | '/play/robot-factory' | '/play/rhythm' | '/play/flexibility';
};

const GAMES: GameCard[] = [
  { id: 'letter-hunt',   slot: 'game1', emoji: '🔤', title: 'Harf Avı',           description: 'Doğru harfi bul!',          route: '/play/letter-hunt' },
  { id: 'bubbles',       slot: 'game2', emoji: '🫧', title: 'Harf Baloncukları',  description: 'Sadece sesli harfleri patlat!', route: '/play/bubbles' },
  { id: 'robot-factory', slot: 'game3', emoji: '🤖', title: 'Hece Birleştirme',   description: 'Kelimeyi hecelerle yap!',   route: '/play/robot-factory' },
  { id: 'rhythm',        slot: 'game4', emoji: '🥁', title: 'Ritim Ustası',       description: 'Ritmi yakala!',              route: '/play/rhythm' },
  { id: 'flexibility',   slot: 'game5', emoji: '🔄', title: 'Kural Değiştirici',  description: 'Değişen kurallara uy!',     route: '/play/flexibility' },
];

export default function HomeScreen() {
  const childId = useGameStore((s) => s.childId);
  const completedGames = useGameStore((s) => s.completedGames);
  const setCompletedGames = useGameStore((s) => s.setCompletedGames);
  const setScoreRowId = useGameStore((s) => s.setScoreRowId);
  const reset = useGameStore((s) => s.reset);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childId) {
      router.replace('/onboarding');
      return;
    }

    // Supabase'den ilerleme oku
    (async () => {
      setLoading(true);
      const row = await getChildScores(childId);
      if (row) {
        setScoreRowId(row.id);
        setCompletedGames({
          game1: row.game1 !== null,
          game2: row.game2 !== null,
          game3: row.game3 !== null,
          game4: row.game4 !== null,
          game5: row.game5 !== null,
        });
      } else {
        // Henüz hiç oyun oynanmamış
        setScoreRowId(null);
        setCompletedGames({
          game1: false, game2: false, game3: false, game4: false, game5: false,
        });
      }
      setLoading(false);
    })();
  }, [childId]);

  // Sıradaki aktif oyun: ilk false olan slot
  const nextActiveSlot: GameSlot | null = (() => {
    const slots: GameSlot[] = ['game1', 'game2', 'game3', 'game4', 'game5'];
    for (const s of slots) {
      if (!completedGames[s]) return s;
    }
    return null; // hepsi tamamlandı
  })();

  const allCompleted = nextActiveSlot === null;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4630EB" />
          <Text style={styles.loaderText}>İlerleme yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (allCompleted) {
    const handleRestart = () => {
      reset();
      router.replace('/onboarding');
    };
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.completedEmoji}>🏆</Text>
            <Text style={styles.greeting}>Tebrikler!</Text>
            <Text style={styles.subtitle}>Tüm oyunları tamamladın. Simülasyon sona erdi!</Text>
          </View>
          <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
            <Text style={styles.restartButtonText}>🔄 Yeni Simülasyon Başlat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.devLink} onPress={() => router.push('/dev-test')}>
            <Text style={styles.devLinkText}>🔧 Geliştirme Test Ekranı</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Merhaba! 👋</Text>
          <Text style={styles.subtitle}>Sıradaki oyununu oyna!</Text>
        </View>

        <View style={styles.grid}>
          {GAMES.map((game) => {
            const isCompleted = completedGames[game.slot];
            const isActive = nextActiveSlot === game.slot;
            const isLocked = !isCompleted && !isActive;

            const onPress = () => {
              if (isActive) router.push(game.route);
            };

            return (
              <TouchableOpacity
                key={game.id}
                style={[
                  styles.card,
                  isLocked && styles.cardLocked,
                  isCompleted && styles.cardCompleted,
                ]}
                onPress={onPress}
                disabled={!isActive}
                activeOpacity={isActive ? 0.7 : 1}>
                <Text style={styles.cardEmoji}>{game.emoji}</Text>
                <Text style={styles.cardTitle}>{game.title}</Text>
                <Text style={styles.cardDescription}>{game.description}</Text>
                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>✓ Tamamlandı</Text>
                  </View>
                )}
                {isLocked && (
                  <View style={styles.lockedBadge}>
                    <Text style={styles.lockedBadgeText}>🔒 Kilitli</Text>
                  </View>
                )}
                {isActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>▶ Sırada</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.devLink} onPress={() => router.push('/dev-test')}>
          <Text style={styles.devLinkText}>🔧 Geliştirme Test Ekranı</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  scroll: { padding: 24, paddingBottom: 48 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loaderText: { color: '#a0a0c0', fontSize: 16 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  completedEmoji: { fontSize: 96, marginBottom: 16 },
  greeting: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#a0a0c0', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 24,
    padding: 24,
    width: 220,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4630EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
  },
  cardLocked: { opacity: 0.4 },
  cardCompleted: { opacity: 0.6, borderWidth: 2, borderColor: '#22c55e' },
  cardEmoji: { fontSize: 64, marginBottom: 12 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 6, textAlign: 'center' },
  cardDescription: { fontSize: 14, color: '#a0a0c0', textAlign: 'center' },
  completedBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: '#22c55e',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  completedBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  lockedBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: '#2d2d44',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  lockedBadgeText: { color: '#a0a0c0', fontSize: 11, fontWeight: 'bold' },
  activeBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: '#4630EB',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  activeBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  devLink: { marginTop: 32, alignSelf: 'center', paddingVertical: 8 },
  devLinkText: { color: '#a0a0c0', fontSize: 14, textDecorationLine: 'underline' },
  restartButton: {
    backgroundColor: '#4630EB',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignSelf: 'center',
    marginTop: 24,
    elevation: 4,
    shadowColor: '#4630EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  restartButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
