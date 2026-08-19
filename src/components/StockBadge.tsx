import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  stock: number;
  threshold: number;
}

/** Pill showing stock status; turns into a low-stock warning at/below threshold. */
export function StockBadge({ stock, threshold }: Props) {
  const theme = useTheme();
  const low = stock <= threshold;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: low ? theme.tintSoft : theme.backgroundElement },
      ]}
    >
      <ThemedText
        type="small"
        style={{ color: low ? theme.danger : theme.textSecondary }}
      >
        {low ? `Low · ${stock} left` : `In stock · ${stock}`}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
});