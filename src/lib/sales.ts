import { useCallback, useState } from 'react';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

import type { Sale, SaleItemWithName, SaleLineInput, SaleWithItems } from '@/types';

/**
 * Records a sale atomically: validates stock for every line, inserts the sale,
 * inserts its line items, and decrements each product's stock. Any failure
 * (e.g. not enough stock) rolls the whole transaction back — no partial writes.
 */
export async function recordSale(
  db: SQLiteDatabase,
  lines: SaleLineInput[]
): Promise<number> {
  if (lines.length === 0) throw new Error('Sale has no items');

  let saleId = 0;

  await db.withExclusiveTransactionAsync(async (txn) => {
    const resolved: Array<{
      productId: number;
      quantity: number;
      unit_price: number;
      line_total: number;
    }> = [];
    let total = 0;

    for (const line of lines) {
      const product = await txn.getFirstAsync<{ price: number; stock: number }>(
        'SELECT price, stock FROM products WHERE id = ?',
        line.productId
      );
      if (!product) throw new Error('Product no longer exists');
      if (product.stock < line.quantity) {
        throw new Error(`Not enough stock for that item (only ${product.stock} left)`);
      }
      const unit_price = product.price;
      const line_total = unit_price * line.quantity;
      total += line_total;
      resolved.push({ productId: line.productId, quantity: line.quantity, unit_price, line_total });
    }

    const result = await txn.runAsync('INSERT INTO sales (total_amount) VALUES (?)', total);
    saleId = result.lastInsertRowId;

    for (const r of resolved) {
      await txn.runAsync(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?)`,
        saleId,
        r.productId,
        r.quantity,
        r.unit_price,
        r.line_total
      );
      await txn.runAsync(
        "UPDATE products SET stock = stock - ?, updated_at = datetime('now') WHERE id = ?",
        r.quantity,
        r.productId
      );
    }
  });

  return saleId;
}

/** Most recent sales, newest first, each with its line items attached. */
export async function listSales(
  db: SQLiteDatabase,
  limit = 50
): Promise<SaleWithItems[]> {
  const sales = await db.getAllAsync<Sale>(
    'SELECT * FROM sales ORDER BY id DESC LIMIT ?',
    limit
  );
  const items = await db.getAllAsync<SaleItemWithName>(
    `SELECT si.id, si.sale_id, si.product_id, si.quantity, si.unit_price, si.line_total,
            p.name AS product_name
     FROM sale_items si
     JOIN products p ON p.id = si.product_id
     WHERE si.sale_id IN (SELECT id FROM sales ORDER BY id DESC LIMIT ?)
     ORDER BY si.sale_id DESC, si.id ASC`,
    limit
  );

  const bySale = new Map<number, SaleItemWithName[]>();
  for (const item of items) {
    const list = bySale.get(item.sale_id) ?? [];
    list.push(item);
    bySale.set(item.sale_id, list);
  }

  return sales.map((sale) => ({ ...sale, items: bySale.get(sale.id) ?? [] }));
}

/** Total sales amount for the device's current day. */
export async function getTodaySalesTotal(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ t: number }>(
    "SELECT COALESCE(SUM(total_amount), 0) AS t FROM sales WHERE date(created_at) = date('now','localtime')"
  );
  return row?.t ?? 0;
}

export function useSales() {
  const db = useSQLiteContext();
  const [sales, setSales] = useState<SaleWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const rows = await listSales(db);
    setSales(rows);
    setLoading(false);
  }, [db]);

  return { sales, loading, refetch };
}