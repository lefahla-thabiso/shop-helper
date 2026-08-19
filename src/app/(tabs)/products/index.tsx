import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { StockBadge } from '@/components/StockBadge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/format';
import { useProducts } from '@/lib/products';

export default function ProductsScreen() {
  const theme = useTheme();
  const { products, refetch } = useProducts();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <EmptyState
            emoji="📦"
            title="No products yet"
            message="Tap + to add your first product."
          />
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, { backgroundColor: theme.backgroundElement }]}
            onPress={() => router.push(`/products/${item.id}`)}
          >
            <View style={{ flex: 1 }}>
              <ThemedText>{item.name}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {item.category} · {formatCurrency(item.price)}
              </ThemedText>
            </View>
            <StockBadge stock={item.stock} threshold={item.low_stock_threshold} />
          </Pressable>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
});