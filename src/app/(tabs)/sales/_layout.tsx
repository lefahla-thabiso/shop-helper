import { router, Stack } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export default function SalesLayout() {
  const theme = useTheme();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Sales',
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/sales/new')}
              hitSlop={12}
              accessibilityLabel="Record sale"
            >
              <Text style={{ fontSize: 28, color: theme.tint, lineHeight: 30 }}>＋</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="new" options={{ title: 'Record sale' }} />
    </Stack>
  );
}