import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/format';
import { useProducts } from '@/lib/products';
import type { SaleLineInput } from '@/types';

interface Line {
  productId: number | null;
  quantity: string;
}

interface Props {
  onSave: (lines: SaleLineInput[]) => Promise<void>;
}

/** Multi-line sale entry: pick a product per line, set quantity, see running total. */
export function SaleForm({ onSave }: Props) {
  const theme = useTheme();
  const { products } = useProducts();
  const [lines, setLines] = useState<Line[]>([{ productId: null, quantity: '1' }]);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setLine = (index: number, patch: Partial<Line>) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const unitPrice = (index: number): number | null => {
    const line = lines[index];
    if (line.productId == null) return null;
    const product = products.find((p) => p.id === line.productId);
    return product ? product.price : null;
  };

  const parseQty = (index: number): number => {
    const q = parseInt(lines[index].quantity, 10);
    return Number.isInteger(q) && q > 0 ? q : 0;
  };

  const total = lines.reduce((sum, _, i) => {
    const price = unitPrice(i);
    return price == null ? sum : sum + price * parseQty(i);
  }, 0);

  const linesValid = lines.every(
    (l) => l.productId != null && parseInt(l.quantity, 10) > 0
  );

  const handleSave = async () => {
    if (!linesValid || submitting) return;
    setSubmitting(true);
    try {
      await onSave(
        lines.map((line, index) => ({
          productId: line.productId as number,
          quantity: parseQty(index) || 1,
        }))
      );
    } finally {
      setSubmitting(false);
    }
  };

  const removeLine = (index: number) => {
    setLines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const selectedProduct = (index: number) =>
    lines[index].productId == null
      ? null
      : products.find((p) => p.id === lines[index].productId) ?? null;

  return (
    <View style={styles.container}>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        Add one line per product being sold.
      </ThemedText>

      {lines.map((line, index) => {
        const product = selectedProduct(index);
        const price = unitPrice(index);
        const stock = product?.stock ?? null;
        const qty = parseQty(index);
        const overStock = product != null && stock != null && qty > stock;
        return (
          <View
            key={index}
            style={[styles.line, { backgroundColor: theme.backgroundElement }]}
          >
            <Pressable
              style={[styles.picker, { borderColor: theme.border }]}
              onPress={() => setPickerIndex(index)}
            >
              <ThemedText style={{ color: product ? theme.text : theme.textSecondary }}>
                {product ? product.name : 'Choose product…'}
              </ThemedText>
              {product ? (
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {formatCurrency(price ?? 0)}
                  {stock != null && ` · ${stock} in stock`}
                </ThemedText>
              ) : null}
            </Pressable>

            <View style={styles.lineRow}>
              <TextInput
                style={[
                  styles.qtyInput,
                  { borderColor: overStock ? theme.danger : theme.border, color: theme.text },
                ]}
                value={line.quantity}
                onChangeText={(text) => setLine(index, { quantity: text.replace(/[^0-9]/g, '') })}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor={theme.textSecondary}
              />
              {overStock ? (
                <ThemedText type="small" style={{ color: theme.danger }}>
                  only {stock} left
                </ThemedText>
              ) : null}
              <Pressable onPress={() => removeLine(index)} style={styles.removeBtn}>
                <ThemedText style={{ color: theme.danger }}>✕</ThemedText>
              </Pressable>
            </View>
          </View>
        );
      })}

      <Pressable
        onPress={() => setLines((prev) => [...prev, { productId: null, quantity: '1' }])}
        style={[styles.addLine, { borderColor: theme.tint }]}
      >
        <ThemedText type="smallBold" style={{ color: theme.tint }}>
          + Add line
        </ThemedText>
      </Pressable>

      <View style={[styles.totalRow, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="smallBold" style={{ color: theme.textSecondary }}>
          Total
        </ThemedText>
        <ThemedText type="subtitle" style={{ color: theme.text }}>
          {formatCurrency(total)}
        </ThemedText>
      </View>

      <Pressable
        onPress={handleSave}
        disabled={!linesValid || submitting}
        style={[
          styles.save,
          { backgroundColor: theme.tint },
          (!linesValid || submitting) && { opacity: 0.4 },
        ]}
      >
        <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
          {submitting ? 'Saving…' : `Record sale · ${formatCurrency(total)}`}
        </ThemedText>
      </Pressable>

      <Modal
        visible={pickerIndex !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerIndex(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPickerIndex(null)} />
        <View style={[styles.modal, { backgroundColor: theme.background }]}>
          <ThemedText type="subtitle" style={styles.modalTitle}>
            Choose product
          </ThemedText>
          <FlatList
            data={products}
            keyExtractor={(p) => String(p.id)}
            contentContainerStyle={{ paddingBottom: Spacing.four }}
            ListEmptyComponent={
              <EmptyState
                emoji="📦"
                title="No products yet"
                message="Add a product first, then come back to record a sale."
              />
            }
            renderItem={({ item }) => (
              <Pressable
                style={[styles.modalItem, { borderBottomColor: theme.border }]}
                onPress={() => {
                  setLine(pickerIndex as number, { productId: item.id });
                  setPickerIndex(null);
                }}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText>{item.name}</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {item.category} · {item.stock} in stock
                  </ThemedText>
                </View>
                <ThemedText type="smallBold">{formatCurrency(item.price)}</ThemedText>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  line: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  picker: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.half,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  qtyInput: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    fontSize: 16,
    minWidth: 56,
    textAlign: 'center',
  },
  removeBtn: {
    padding: Spacing.two,
    marginLeft: 'auto',
  },
  addLine: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Spacing.two,
    alignItems: 'center',
    paddingVertical: Spacing.two + Spacing.half,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  save: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modal: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingTop: Spacing.four,
    maxHeight: '70%',
  },
  modalTitle: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.two,
  },
});