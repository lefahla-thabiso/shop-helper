import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { StockBadge } from '@/components/StockBadge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/format';
import { getDashboardSummary, type DashboardSummary } from '@/lib/stats';

export default function DashboardScreen() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const load = useCallback(async () => {
    setSummary(await getDashboardSummary(db));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={summary?.lowStockProducts ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}
        ListHeaderComponent={
          <View style={{ gap: Spacing.three }}>
            <View style={styles.statsRow}>
              <StatCard label="Today's sales" value={formatCurrency(summary?.todaySales ?? 0)} />
              <StatCard label="Inventory value" value={formatCurrency(summary?.inventoryValue ?? 0)} />
            </View>
            <View style={styles.statsRow}>
              <StatCard label="Low stock items" value={String(summary?.lowStockCount ?? 0)} />
              <View style={{ flex: 1 }} />
            </View>
            <ThemedText type="smallBold" style={{ color: theme.textSecondary }}>
              Low stock alerts
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          summary?.lowStockProducts.length === 0 ? (
            <EmptyState
              emoji="✅"
              title="All stocked up"
              message="No products are below their low-stock threshold."
            />
          ) : undefined
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
  statsRow: {
    flexDirection: 'row',
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