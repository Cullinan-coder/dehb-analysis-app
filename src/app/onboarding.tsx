import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useGameStore } from '../stores/gameStore';
import { createChild } from '../services/child';

export default function OnboardingScreen() {
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [loading, setLoading] = useState(false);
  const { setChild } = useGameStore();

  const handleStart = async () => {
    if (!childName || !childAge) return;

    setLoading(true);
    const child = await createChild(parseInt(childAge));

    if (child) {
      setChild(child.id, parseInt(childAge));
      router.replace('/');
    } else {
      alert('Bağlantı sorunu, tekrar dene.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👋</Text>
      <Text style={styles.title}>Merhaba!</Text>
      <Text style={styles.subtitle}>Seni tanıyalım</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Adın ne?</Text>
        <TextInput
          style={styles.input}
          placeholder="Adını yaz..."
          placeholderTextColor="#666"
          value={childName}
          onChangeText={setChildName}
        />

        <Text style={styles.label}>Kaç yaşındasın?</Text>
        <View style={styles.ageRow}>
          {[6, 7, 8, 9, 10, 11, 12].map((age) => (
            <TouchableOpacity
              key={age}
              style={[
                styles.ageButton,
                childAge === String(age) && styles.ageButtonSelected,
              ]}
              onPress={() => setChildAge(String(age))}
            >
              <Text style={[
                styles.ageText,
                childAge === String(age) && styles.ageTextSelected,
              ]}>
                {age}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.startButton, (!childName || !childAge) && styles.startButtonDisabled]}
          onPress={handleStart}
          disabled={!childName || !childAge || loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.startButtonText}>Maceraya Başla! 🚀</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#a0a0c0',
    marginBottom: 48,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: 18,
    color: '#a0a0c0',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#4630EB',
  },
  ageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 48,
  },
  ageButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#16213e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2d2d44',
  },
  ageButtonSelected: {
    backgroundColor: '#4630EB',
    borderColor: '#4630EB',
  },
  ageText: {
    fontSize: 20,
    color: '#a0a0c0',
    fontWeight: 'bold',
  },
  ageTextSelected: {
    color: '#ffffff',
  },
  startButton: {
    backgroundColor: '#4630EB',
    borderRadius: 30,
    padding: 20,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#2d2d44',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
