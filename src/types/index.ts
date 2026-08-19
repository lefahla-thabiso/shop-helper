/** Row shape of the `products` table. */
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

/** Input for creating/updating a product (id is not user-provided). */
export interface ProductInput {
  name: string;
  category: string;
  price: number;
  stock: number;
  low_stock_threshold?: number;
}

/** Row shape of the `sales` table. */
export interface Sale {
  id: number;
  total_amount: number;
  created_at: string;
}

/** Row shape of the `sale_items` table. */
export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  line_total: number;
}

/** A sale line item with the product's name joined in (for the sales log). */
export interface SaleItemWithName extends SaleItem {
  product_name: string;
}

/** One line of a sale being recorded: which product and how many units. */
export interface SaleLineInput {
  productId: number;
  quantity: number;
}

/** A sale joined with its line items, as shown in the sales log. */
export interface SaleWithItems extends Sale {
  items: SaleItemWithName[];
}