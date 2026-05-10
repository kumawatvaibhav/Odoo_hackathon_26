// =============================================================================
// Expenses Controller — Route Handlers
// =============================================================================

import type { Request, Response, NextFunction } from "express";
import * as svc from "./expenses.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export const getExpenses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const tripId = req.params.tripId as string;
    const [expenses, summary] = await Promise.all([
      svc.getExpensesForTrip(tripId, userId),
      svc.getTripBudgetSummary(tripId),
    ]);
    sendSuccess(res, 200, { data: { expenses, summary } });
  } catch (err) { next(err); }
};

export const addExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const tripId = req.params.tripId as string;
    const { category, title, description, amount, quantity, currency, expense_date } = req.body;
    if (!title || !amount || !category) {
      sendError(res, 400, { message: "title, amount, and category are required" });
      return;
    }
    const expense = await svc.addExpense(tripId, userId, {
      category, title, description, amount: parseFloat(amount), quantity, currency, expense_date,
    });
    sendSuccess(res, 201, { data: { expense } });
  } catch (err) { next(err); }
};

export const deleteExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const expenseId = req.params.expenseId as string;
    const ok = await svc.deleteExpense(expenseId, userId);
    if (!ok) { sendError(res, 404, { message: "Expense not found" }); return; }
    sendSuccess(res, 200, { message: "Expense deleted" });
  } catch (err) { next(err); }
};

export const markPaid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const expenseId = req.params.expenseId as string;
    const expense = await svc.markPaid(expenseId, userId);
    if (!expense) { sendError(res, 404, { message: "Expense not found" }); return; }
    sendSuccess(res, 200, { data: { expense } });
  } catch (err) { next(err); }
};
