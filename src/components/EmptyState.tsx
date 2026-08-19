import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  emoji: string;
  title: string;
  message?: string;
}

/** Friendly placeholder for empty lists. */
export function EmptyState({ emoji, title, message }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      {message ? (
        <ThemedText style={{ color: theme.textSecondary, textAlign: 'center' }}>
          {message}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.six,
    gap: Spacing.two,
    flex: 1,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    textAlign: 'center',
  },
});