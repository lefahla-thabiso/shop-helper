import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';

import { SaleForm } from '@/components/SaleForm';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { recordSale } from '@/lib/sales';
import type { SaleLineInput } from '@/types';

export default function NewSaleScreen() {
  const db = useSQLiteContext();

  const handleSave = async (lines: SaleLineInput[]) => {
    try {
      const saleId = await recordSale(db, lines);
      Alert.alert('Sale recorded', `Sale #${saleId} saved. Stock has been updated.`);
      router.back();
    } catch (error) {
      Alert.alert(
        'Could not record sale',
        error instanceof Error ? error.message : 'Something went wrong.'
      );
    }
  };

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.three }}>
      <SaleForm onSave={handleSave} />
    </ThemedView>
  );
}