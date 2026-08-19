import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ProductForm } from '@/components/ProductForm';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { adjustStock, deleteProduct, updateProduct, useProduct } from '@/lib/products';
import type { ProductInput } from '@/types';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const theme = useTheme();
  const db = useSQLiteContext();
  const { product, refetch } = useProduct(productId);
  const [adjusting, setAdjusting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleUpdate = async (input: ProductInput) => {
    try {
      await updateProduct(db, productId, input);
      router.back();
    } catch {
      Alert.alert('Could not save', 'Something went wrong while updating the product.');
    }
  };

  const handleAdjust = async (delta: number) => {
    if (!product || adjusting) return;
    setAdjusting(true);
    try {
      await adjustStock(db, productId, delta, delta > 0 ? 'Manual restock' : 'Manual removal');
      await refetch();
    } catch (error) {
      Alert.alert('Stock not changed', error instanceof Error ? error.message : 'Could not adjust stock.');
    } finally {
      setAdjusting(false);
    }
  };

  const handleDelete = () => {
    if (!product) return;
    Alert.alert('Delete product?', `"${product.name}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(db, productId);
            router.back();
          } catch {
            Alert.alert(
              'Cannot delete',
              'This product has sales history, so it cannot be deleted.'
            );
          }
        },
      },
    ]);
  };

  if (!product) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <ActivityIndicator style={{ marginTop: Spacing.six }} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.stockCard, { backgroundColor: theme.backgroundElement }]}>
          <View style={{ flex: 1 }}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Current stock
            </ThemedText>
            <ThemedText type="subtitle">{product.stock}</ThemedText>
          </View>
          <View style={styles.stockButtons}>
            <Pressable
              onPress={() => handleAdjust(-1)}
              disabled={adjusting || product.stock === 0}
              style={[styles.stockBtn, { backgroundColor: theme.tint, opacity: product.stock === 0 ? 0.4 : 1 }]}
            >
              <ThemedText type="smallBold" style={styles.stockBtnText}>−1</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => handleAdjust(1)}
              disabled={adjusting}
              style={[styles.stockBtn, { backgroundColor: theme.tint }]}
            >
              <ThemedText type="smallBold" style={styles.stockBtnText}>+1</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => handleAdjust(10)}
              disabled={adjusting}
              style={[styles.stockBtn, { backgroundColor: theme.tintSoft }]}
            >
              <ThemedText type="smallBold" style={{ color: theme.tint }}>+10</ThemedText>
            </Pressable>
          </View>
        </View>

        <ProductForm initial={product} submitLabel="Save changes" onSubmit={handleUpdate} />

        <Pressable
          onPress={handleDelete}
          style={[styles.deleteBtn, { borderColor: theme.danger }]}
        >
          <ThemedText type="smallBold" style={{ color: theme.danger }}>
            Delete product
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  stockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  stockButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  stockBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  stockBtnText: {
    color: '#ffffff',
  },
  deleteBtn: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
});