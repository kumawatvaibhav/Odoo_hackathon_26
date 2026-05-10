// =============================================================================
// Expenses Routes
// =============================================================================

import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as ctrl from "./expenses.controller.js";

const router = Router();

router.get("/:tripId", requireAuth, ctrl.getExpenses);
router.post("/:tripId", requireAuth, ctrl.addExpense);
router.delete("/:expenseId", requireAuth, ctrl.deleteExpense);
router.patch("/:expenseId/paid", requireAuth, ctrl.markPaid);

export default router;
