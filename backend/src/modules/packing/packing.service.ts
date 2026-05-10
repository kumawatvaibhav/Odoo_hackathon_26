// =============================================================================
// Packing Service — Database Queries
// =============================================================================

import { query } from "../../config/database.js";

export interface PackingItem {
  id: string;
  trip_id: string;
  user_id: string;
  name: string;
  category: string | null;
  quantity: number;
  is_packed: boolean;
  created_at: string;
}

export async function getItemsForTrip(tripId: string, userId: string): Promise<PackingItem[]> {
  const result = await query(
    `SELECT id, trip_id, user_id, name, category, quantity, is_packed, created_at
     FROM packing_items
     WHERE trip_id = $1 AND user_id = $2
     ORDER BY category NULLS LAST, created_at`,
    [tripId, userId]
  );
  return result.rows;
}

export async function addItem(
  tripId: string,
  userId: string,
  data: { name: string; category?: string; quantity?: number }
): Promise<PackingItem> {
  const result = await query(
    `INSERT INTO packing_items (trip_id, user_id, name, category, quantity)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, trip_id, user_id, name, category, quantity, is_packed, created_at`,
    [tripId, userId, data.name, data.category || null, data.quantity || 1]
  );
  return result.rows[0];
}

export async function toggleItem(itemId: string, userId: string): Promise<PackingItem | null> {
  const result = await query(
    `UPDATE packing_items
     SET is_packed = NOT is_packed, updated_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING id, trip_id, user_id, name, category, quantity, is_packed, created_at`,
    [itemId, userId]
  );
  return result.rows[0] || null;
}

export async function deleteItem(itemId: string, userId: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM packing_items WHERE id = $1 AND user_id = $2`,
    [itemId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function resetAll(tripId: string, userId: string): Promise<number> {
  const result = await query(
    `UPDATE packing_items SET is_packed = false, updated_at = now()
     WHERE trip_id = $1 AND user_id = $2`,
    [tripId, userId]
  );
  return result.rowCount ?? 0;
}
