import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Product, ProductInput } from '@/types';

const CATEGORIES = ['General', 'Groceries', 'Bakery', 'Beverages', 'Stationery', 'Other'];

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, error, children }: FieldProps) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" style={{ color: error ? theme.danger : theme.textSecondary }}>
        {label}
      </ThemedText>
      {children}
      {error ? (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

interface Props {
  initial?: Product;
  submitLabel: string;
  onSubmit: (input: ProductInput) => Promise<void>;
}

/** Shared add/edit product form. parent handles navigation and error alerts. */
export function ProductForm({ initial, submitLabel, onSubmit }: Props) {
  const theme = useTheme();
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'General');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [stock, setStock] = useState(initial ? String(initial.stock) : '');
  const [threshold, setThreshold] = useState(
    initial ? String(initial.low_stock_threshold) : '5'
  );
  const [submitting, setSubmitting] = useState(false);

  const parsedPrice = price.trim() === '' ? NaN : parseFloat(price);
  const parsedStock = stock.trim() === '' ? NaN : parseInt(stock, 10);
  const parsedThreshold = threshold.trim() === '' ? NaN : parseInt(threshold, 10);

  const errors = {
    name: name.trim() ? undefined : 'Product name is required',
    price:
      Number.isFinite(parsedPrice) && parsedPrice >= 0
        ? undefined
        : 'Enter a valid price (0 or more)',
    stock:
      Number.isInteger(parsedStock) && parsedStock >= 0
        ? undefined
        : 'Enter whole units (0 or more)',
    threshold:
      Number.isInteger(parsedThreshold) && parsedThreshold >= 0
        ? undefined
        : 'Enter whole units (0 or more)',
  };

  const valid = !errors.name && !errors.price && !errors.stock && !errors.threshold;

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        category: category.trim() || 'General',
        price: parsedPrice,
        stock: parsedStock,
        low_stock_threshold: parsedThreshold,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = [
    styles.input,
    { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
  ];

  return (
    <View style={styles.container}>
      <Field label="Name" error={errors.name}>
        <TextInput
          style={inputStyle}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Bread loaf"
          placeholderTextColor={theme.textSecondary}
        />
      </Field>

      <Field label="Category">
        <View style={styles.chipRow}>
          {CATEGORIES.map((c) => {
            const selected = c === category;
            return (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? theme.tint : theme.backgroundElement,
                    borderColor: selected ? theme.tint : theme.border,
                  },
                ]}
              >
                <ThemedText type="small" style={{ color: selected ? '#ffffff' : theme.textSecondary }}>
                  {c}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          style={inputStyle}
          value={category}
          onChangeText={setCategory}
          placeholder="Or type your own"
          placeholderTextColor={theme.textSecondary}
        />
      </Field>

      <Field label={`Price (M)`} error={errors.price}>
        <TextInput
          style={inputStyle}
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={theme.textSecondary}
        />
      </Field>

      <View style={styles.row}>
        <View style={styles.rowField}>
          <Field label="Stock" error={errors.stock}>
            <TextInput
              style={inputStyle}
              value={stock}
              onChangeText={setStock}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
            />
          </Field>
        </View>
        <View style={styles.rowField}>
          <Field label="Low-stock at" error={errors.threshold}>
            <TextInput
              style={inputStyle}
              value={threshold}
              onChangeText={setThreshold}
              keyboardType="number-pad"
              placeholder="5"
              placeholderTextColor={theme.textSecondary}
            />
          </Field>
        </View>
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={!valid || submitting}
        style={[
          styles.submit,
          { backgroundColor: theme.tint },
          (!valid || submitting) && { opacity: 0.4 },
        ]}
      >
        <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
          {submitting ? 'Saving…' : submitLabel}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.half,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 999,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  rowField: {
    flex: 1,
  },
  submit: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    marginTop: Spacing.one,
  },
});