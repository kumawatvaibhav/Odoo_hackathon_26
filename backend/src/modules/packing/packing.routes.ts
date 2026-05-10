// =============================================================================
// Packing Routes
// =============================================================================

import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as ctrl from "./packing.controller.js";

const router = Router();

router.get("/:tripId", requireAuth, ctrl.getItems);
router.post("/:tripId", requireAuth, ctrl.addItem);
router.patch("/:itemId/toggle", requireAuth, ctrl.toggleItem);
router.delete("/:itemId", requireAuth, ctrl.deleteItem);
router.post("/:tripId/reset", requireAuth, ctrl.resetAll);

export default router;
