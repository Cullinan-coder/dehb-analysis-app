import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '../stores/gameStore';
import { createChild } from '../services/child';

export default function OnboardingScreen() {
  const setChild = useGameStore((s) => s.setChild);
  const reset = useGameStore((s) => s.reset);

  const [childName, setChildName] = useState('');
  const [age, setAge] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  async function handleSubmit() {
    const trimmedChildName = childName.trim();
    const trimmedParentName = parentName.trim();
    const trimmedEmail = parentEmail.trim();
    const ageNum = parseInt(age, 10);

    if (!trimmedChildName) {
      Alert.alert('Eksik bilgi', 'Lütfen çocuğun adını girin.');
      return;
    }
    if (isNaN(ageNum) || ageNum < 4 || ageNum > 18) {
      Alert.alert('Geçersiz yaş', 'Lütfen 4 ile 18 arasında bir yaş girin.');
      return;
    }
    if (!trimmedParentName) {
      Alert.alert('Eksik bilgi', 'Lütfen veli adını girin.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      Alert.alert('Geçersiz e-posta', 'Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    setSubmitting(true);

    reset();
    const child = await createChild({
      childName: trimmedChildName,
      age: ageNum,
      parentName: trimmedParentName,
      parentEmail: trimmedEmail,
    });

    setSubmitting(false);

    if (!child) {
      Alert.alert('Hata', 'Kayıt oluşturulamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.');
      return;
    }

    setChild(child.id, child.age);
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.emoji}>🌟</Text>
            <Text style={styles.title}>Hoş Geldiniz!</Text>
            <Text style={styles.subtitle}>
              Veli denetiminde bir DEHB analiz oturumu başlatmak için lütfen bilgileri doldurun.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Çocuk Bilgileri</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Çocuğun Adı</Text>
              <TextInput
                style={styles.input}
                value={childName}
                onChangeText={setChildName}
                placeholder="Örn: Ahmet"
                placeholderTextColor="#6b7280"
                autoCapitalize="words"
                editable={!submitting}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Yaşı</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
                placeholder="4-18 arası"
                placeholderTextColor="#6b7280"
                keyboardType="number-pad"
                maxLength={2}
                editable={!submitting}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Veli Bilgileri</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Veli Adı</Text>
              <TextInput
                style={styles.input}
                value={parentName}
                onChangeText={setParentName}
                placeholder="Örn: Ayşe Yılmaz"
                placeholderTextColor="#6b7280"
                autoCapitalize="words"
                editable={!submitting}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Veli E-posta</Text>
              <TextInput
                style={styles.input}
                value={parentEmail}
                onChangeText={setParentEmail}
                placeholder="rapor@email.com"
                placeholderTextColor="#6b7280"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!submitting}
              />
              <Text style={styles.hint}>
                Rapor bu e-posta adresine gönderilecektir. Şifre veya hesap oluşturulmaz.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Simülasyonu Başlat</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  flex: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 48 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  emoji: { fontSize: 72, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#a0a0c0', textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },
  section: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    gap: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4630EB',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  input: {
    backgroundColor: '#0f1626',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  hint: { fontSize: 12, color: '#a0a0c0', marginTop: 4, lineHeight: 16 },
  button: {
    backgroundColor: '#4630EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#ffffff', fontSize: 17, fontWeight: '700' },
});
