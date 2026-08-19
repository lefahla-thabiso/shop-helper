import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SQLiteProvider } from 'expo-sqlite';
import { useColorScheme } from 'react-native';

import { DB_NAME, initDb } from '@/lib/db';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SQLiteProvider databaseName={DB_NAME} onInit={initDb}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </SQLiteProvider>
  );
}