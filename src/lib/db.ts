import type { SQLiteDatabase } from 'expo-sqlite';

export const DB_NAME = 'shop-helper.db';

const DDL = `
  CREATE TABLE IF NOT EXISTS products (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    name                TEXT    NOT NULL,
    category            TEXT    NOT NULL DEFAULT 'General',
    price               REAL    NOT NULL DEFAULT 0 CHECK (price >= 0),
    stock               INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
    created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sales (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    total_amount REAL NOT NULL CHECK (total_amount >= 0),
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sale_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id    INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity   INTEGER NOT NULL CHECK (quantity > 0),
    unit_price REAL    NOT NULL CHECK (unit_price >= 0),
    line_total REAL    NOT NULL CHECK (line_total >= 0)
  );

  CREATE TABLE IF NOT EXISTS stock_movements (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id),
    delta      INTEGER NOT NULL,
    reason     TEXT    NOT NULL DEFAULT '',
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_sales_created_at   ON sales(created_at);
  CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
  CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
`;

const SEED_PRODUCTS: Array<[string, string, number, number]> = [
  ['Bread loaf', 'Bakery', 12.5, 15],
  ['Maize meal 5kg', 'Groceries', 85.0, 12],
  ['Cooking oil 750ml', 'Groceries', 48.0, 8],
  ['Notebook A5', 'Stationery', 18.5, 20],
  ['Pen (blue)', 'Stationery', 3.5, 30],
];

/**
 * Runs once per connection when SQLiteProvider mounts.
 * PRAGMAs do not persist across connections, so they must be set here.
 */
export async function initDb(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    ${DDL}
  `);

  const row = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) AS c FROM products'
  );
  if (row && row.c === 0) {
    for (const [name, category, price, stock] of SEED_PRODUCTS) {
      await db.runAsync(
        'INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)',
        name,
        category,
        price,
        stock
      );
    }
  }
}