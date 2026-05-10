// =============================================================================
// Expenses Service — Database Queries
// =============================================================================

import { query } from "../../config/database.js";

export interface ExpenseRow {
  id: string;
  trip_id: string;
  user_id: string;
  category: string;
  title: string;
  description: string | null;
  amount: string;
  quantity: number;
  currency: string;
  expense_date: string;
  receipt_url: string | null;
  is_paid: boolean;
  created_at: string;
}

export interface BudgetSummary {
  total_budget: number | null;
  total_spent: number;
  currency: string;
}

export async function getExpensesForTrip(tripId: string, userId: string): Promise<ExpenseRow[]> {
  const result = await query(
    `SELECT id, trip_id, user_id, category, title, description,
            amount, quantity, currency, expense_date, receipt_url, is_paid, created_at
     FROM expenses
     WHERE trip_id = $1 AND user_id = $2 AND deleted_at IS NULL
     ORDER BY expense_date, created_at`,
    [tripId, userId]
  );
  return result.rows;
}

export async function getTripBudgetSummary(tripId: string): Promise<BudgetSummary> {
  const result = await query(
    `SELECT
       t.total_budget,
       t.currency,
       COALESCE(SUM(e.amount * e.quantity), 0) AS total_spent
     FROM trips t
     LEFT JOIN expenses e ON e.trip_id = t.id AND e.deleted_at IS NULL
     WHERE t.id = $1
     GROUP BY t.id, t.total_budget, t.currency`,
    [tripId]
  );
  if (result.rows.length === 0) {
    return { total_budget: null, total_spent: 0, currency: "USD" };
  }
  const row = result.rows[0];
  return {
    total_budget: row.total_budget ? parseFloat(row.total_budget) : null,
    total_spent: parseFloat(row.total_spent),
    currency: row.currency,
  };
}

export async function addExpense(
  tripId: string,
  userId: string,
  data: { category: string; title: string; description?: string; amount: number; quantity?: number; currency?: string; expense_date?: string }
): Promise<ExpenseRow> {
  const result = await query(
    `INSERT INTO expenses (trip_id, user_id, category, title, description, amount, quantity, currency, expense_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, trip_id, user_id, category, title, description, amount, quantity, currency, expense_date, receipt_url, is_paid, created_at`,
    [
      tripId, userId, data.category, data.title, data.description || null,
      data.amount, data.quantity || 1, data.currency || "USD",
      data.expense_date || new Date().toISOString().split("T")[0],
    ]
  );
  return result.rows[0];
}

export async function deleteExpense(expenseId: string, userId: string): Promise<boolean> {
  const result = await query(
    `UPDATE expenses SET deleted_at = now() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [expenseId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function markPaid(expenseId: string, userId: string): Promise<ExpenseRow | null> {
  const result = await query(
    `UPDATE expenses SET is_paid = true, updated_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING id, trip_id, user_id, category, title, description, amount, quantity, currency, expense_date, receipt_url, is_paid, created_at`,
    [expenseId, userId]
  );
  return result.rows[0] || null;
}
