import type { SQLiteDatabase } from 'expo-sqlite';

import type { Product } from '@/types';
import { listLowStock } from '@/lib/products';

export interface DashboardSummary {
  /** Total sales amount for the device's current day. */
  todaySales: number;
  /** Sum of price × stock across all products. */
  inventoryValue: number;
  /** Number of products at or below their low-stock threshold. */
  lowStockCount: number;
  /** The low-stock products, lowest stock first. */
  lowStockProducts: Product[];
}

/** One call returning everything the Dashboard screen renders. */
export async function getDashboardSummary(db: SQLiteDatabase): Promise<DashboardSummary> {
  const today = await db.getFirstAsync<{ t: number }>(
    "SELECT COALESCE(SUM(total_amount), 0) AS t FROM sales WHERE date(created_at) = date('now','localtime')"
  );
  const inventory = await db.getFirstAsync<{ v: number }>(
    'SELECT COALESCE(SUM(price * stock), 0) AS v FROM products'
  );
  const row = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) AS c FROM products WHERE stock <= low_stock_threshold'
  );
  const lowStockProducts = await listLowStock(db);

  return {
    todaySales: today?.t ?? 0,
    inventoryValue: inventory?.v ?? 0,
    lowStockCount: row?.c ?? 0,
    lowStockProducts,
  };
}