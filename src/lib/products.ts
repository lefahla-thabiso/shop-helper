import { useCallback, useState } from 'react';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

import type { Product, ProductInput } from '@/types';

export async function listProducts(db: SQLiteDatabase): Promise<Product[]> {
  return db.getAllAsync<Product>('SELECT * FROM products ORDER BY name COLLATE NOCASE');
}

export async function getProduct(db: SQLiteDatabase, id: number): Promise<Product | null> {
  return db.getFirstAsync<Product>('SELECT * FROM products WHERE id = ?', id);
}

export async function insertProduct(db: SQLiteDatabase, input: ProductInput): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO products (name, category, price, stock, low_stock_threshold)
     VALUES (?, ?, ?, ?, ?)`,
    input.name,
    input.category,
    input.price,
    input.stock,
    input.low_stock_threshold ?? 5
  );
  return result.lastInsertRowId;
}

export async function updateProduct(
  db: SQLiteDatabase,
  id: number,
  input: ProductInput
): Promise<void> {
  await db.runAsync(
    `UPDATE products
     SET name = ?, category = ?, price = ?, stock = ?, low_stock_threshold = ?,
         updated_at = datetime('now')
     WHERE id = ?`,
    input.name,
    input.category,
    input.price,
    input.stock,
    input.low_stock_threshold ?? 5,
    id
  );
}

/**
 * Deletes a product. Throws if the product has sale history (FK constraint).
 * The caller should translate the failure into a friendly alert.
 */
export async function deleteProduct(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM products WHERE id = ?', id);
}

/** Adjusts stock by `delta` (negative = out). Throws if the result would go below 0. */
export async function adjustStock(
  db: SQLiteDatabase,
  productId: number,
  delta: number,
  reason = ''
): Promise<void> {
  const row = await db.getFirstAsync<{ stock: number }>(
    'SELECT stock FROM products WHERE id = ?',
    productId
  );
  if (!row) throw new Error('Product not found');
  const next = row.stock + delta;
  if (next < 0) throw new Error('Stock cannot go below zero');
  await db.runAsync(
    "UPDATE products SET stock = ?, updated_at = datetime('now') WHERE id = ?",
    next,
    productId
  );
  if (delta !== 0) {
    await db.runAsync(
      'INSERT INTO stock_movements (product_id, delta, reason) VALUES (?, ?, ?)',
      productId,
      delta,
      reason
    );
  }
}

/** Returns products at or below their low-stock threshold, lowest stock first. */
export async function listLowStock(db: SQLiteDatabase): Promise<Product[]> {
  return db.getAllAsync<Product>(
    'SELECT * FROM products WHERE stock <= low_stock_threshold ORDER BY stock ASC'
  );
}

export function useProducts() {
  const db = useSQLiteContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const rows = await listProducts(db);
    setProducts(rows);
    setLoading(false);
  }, [db]);

  return { products, loading, refetch };
}

export function useProduct(id: number) {
  const db = useSQLiteContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const row = await getProduct(db, id);
    setProduct(row);
    setLoading(false);
  }, [db, id]);

  return { product, loading, refetch };
}