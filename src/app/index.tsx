import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '../stores/gameStore';

type GameCard = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  route: '/play/letter-hunt' | '/play/frog-jump' | '/play/detective' | '/play/bubbles' | '/play/robot-factory';
  available: boolean;
};

const GAMES: GameCard[] = [
  {
    id: 'letter-hunt',
    emoji: '🔤',
    title: 'Harf Avı',
    description: 'Doğru harfi bul!',
    route: '/play/letter-hunt',
    available: true,
  },
  {
    id: 'frog-jump',
    emoji: '🐸',
    title: 'Kurbağa Zıp Zıp',
    description: 'Sayıları sırayla bul!',
    route: '/play/frog-jump',
    available: true,
  },
  {
    id: 'detective',
    emoji: '🔦',
    title: 'Dedektif Feneri',
    description: 'Karanlıkta harfleri ara!',
    route: '/play/detective',
    available: true,
  },
  {
    id: 'bubbles',
    emoji: '🫧',
    title: 'Harf Baloncukları',
    description: 'Doğru baloncuğu patlat!',
    route: '/play/bubbles',
    available: true,
  },
  {
    id: 'robot-factory',
    emoji: '🤖',
    title: 'Robot Fabrikası',
    description: 'Kelimeleri birleştir!',
    route: '/play/robot-factory',
    available: true,
  },
];

export default function HomeScreen() {
  const childId = useGameStore((s) => s.childId);
  const childAge = useGameStore((s) => s.childAge);

  useEffect(() => {
    if (!childId) {
      router.replace('/onboarding');
    }
  }, [childId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Merhaba! 👋</Text>
          <Text style={styles.subtitle}>Hangi oyunu oynamak istersin?</Text>
        </View>

        <View style={styles.grid}>
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.card, !game.available && styles.cardDisabled]}
              onPress={() => game.available && router.push(game.route)}
              activeOpacity={game.available ? 0.7 : 1}>
              <Text style={styles.cardEmoji}>{game.emoji}</Text>
              <Text style={styles.cardTitle}>{game.title}</Text>
              <Text style={styles.cardDescription}>{game.description}</Text>
              {!game.available && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Yakında</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
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
  header: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  greeting: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#a0a0c0' },
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
  cardDisabled: { opacity: 0.5 },
  cardEmoji: { fontSize: 64, marginBottom: 12 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 6, textAlign: 'center' },
  cardDescription: { fontSize: 14, color: '#a0a0c0', textAlign: 'center' },
  comingSoonBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4630EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  devLink: { marginTop: 32, alignSelf: 'center', paddingVertical: 8 },
  devLinkText: { color: '#a0a0c0', fontSize: 14, textDecorationLine: 'underline' },
});
