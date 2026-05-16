import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { testSupabaseConnection } from '../services/supabase';

type TestResult = {
  name: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
};

export default function DevTestScreen() {
  const [supabaseResult, setSupabaseResult] = useState<TestResult>({
    name: 'Supabase',
    status: 'idle',
  });

  async function runSupabaseTest() {
    setSupabaseResult({ name: 'Supabase', status: 'loading' });
    const result = await testSupabaseConnection();
    if (result.ok) {
      setSupabaseResult({
        name: 'Supabase',
        status: 'success',
        message: `Bağlantı başarılı. children tablosunda ${result.rowCount} kayıt var.`,
      });
    } else {
      setSupabaseResult({
        name: 'Supabase',
        status: 'error',
        message: result.error,
      });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>🔧 Geliştirme Test Ekranı</Text>
        <Text style={styles.subtitle}>
          Bağlantı doğrulama. Bu ekran sadece geliştirme aşamasında kullanılır.
        </Text>

        <TestCard result={supabaseResult} onPress={runSupabaseTest} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TestCard({ result, onPress }: { result: TestResult; onPress: () => void }) {
  const statusColor = {
    idle: '#a0a0c0',
    loading: '#4630EB',
    success: '#22c55e',
    error: '#ef4444',
  }[result.status];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{result.name}</Text>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>

      {result.status === 'loading' && <ActivityIndicator color="#4630EB" style={styles.loader} />}

      {result.message && (
        <Text style={[styles.message, { color: statusColor }]}>{result.message}</Text>
      )}

      <TouchableOpacity
        style={[styles.button, result.status === 'loading' && styles.buttonDisabled]}
        onPress={onPress}
        disabled={result.status === 'loading'}>
        <Text style={styles.buttonText}>
          {result.status === 'idle' ? 'Testi Çalıştır' : 'Tekrar Dene'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  scroll: { padding: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#a0a0c0', marginBottom: 24 },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  loader: { marginVertical: 8 },
  message: { fontSize: 14, lineHeight: 20 },
  button: {
    backgroundColor: '#4630EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
