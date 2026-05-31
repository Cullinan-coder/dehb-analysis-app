import { View, Text } from 'react-native';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { DEMO_MODE } from '../config/demoMode';

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="dev-test" />
        </Stack>
      </ThemeProvider>
      {DEMO_MODE && (
        <View style={{ position: 'absolute', top: 8, right: 8, zIndex: 9999 }} pointerEvents="none">
          <Text style={{ color: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(0,0,0,0.3)', fontSize: 12, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
            DEMO
          </Text>
        </View>
      )}
    </View>
  );
}
