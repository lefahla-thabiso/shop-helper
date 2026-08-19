import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';

import { ProductForm } from '@/components/ProductForm';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { insertProduct } from '@/lib/products';
import type { ProductInput } from '@/types';

export default function NewProductScreen() {
  const db = useSQLiteContext();

  const handleSubmit = async (input: ProductInput) => {
    try {
      await insertProduct(db, input);
      router.back();
    } catch {
      Alert.alert('Could not save', 'Something went wrong while saving the product.');
    }
  };

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.three }}>
      <ProductForm submitLabel="Add product" onSubmit={handleSubmit} />
    </ThemedView>
  );
}