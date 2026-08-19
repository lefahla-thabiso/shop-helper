import { router, Stack } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export default function ProductsLayout() {
  const theme = useTheme();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Products',
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/products/new')}
              hitSlop={12}
              accessibilityLabel="Add product"
            >
              <Text style={{ fontSize: 28, color: theme.tint, lineHeight: 30 }}>＋</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="new" options={{ title: 'New product' }} />
      <Stack.Screen name="[id]" options={{ title: 'Product' }} />
    </Stack>
  );
}