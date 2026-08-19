import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { useSales } from '@/lib/sales';

export default function SalesLogScreen() {
  const theme = useTheme();
  const { sales, refetch } = useSales();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={sales}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <EmptyState
            emoji="🧾"
            title="No sales yet"
            message="Record your first sale with the + button."
          />
        }
        renderItem={({ item }) => {
          const expanded = expandedId === item.id;
          return (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <Pressable
                style={styles.cardHeader}
                onPress={() => setExpandedId(expanded ? null : item.id)}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {formatDateTime(item.created_at)}
                  </ThemedText>
                  <ThemedText type="smallBold" style={{ color: theme.text }}>
                    {item.items.length} item{item.items.length === 1 ? '' : 's'}
                  </ThemedText>
                </View>
                <ThemedText type="subtitle" style={{ color: theme.text }}>
                  {formatCurrency(item.total_amount)}
                </ThemedText>
              </Pressable>
              {expanded ? (
                <View style={[styles.lineItems, { borderTopColor: theme.border }]}>
                  {item.items.map((line) => (
                    <View key={line.id} style={styles.lineRow}>
                      <ThemedText type="small">
                        {line.quantity}× {line.product_name}
                      </ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        {formatCurrency(line.line_total)}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        }}
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
  card: {
    borderRadius: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  lineItems: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});