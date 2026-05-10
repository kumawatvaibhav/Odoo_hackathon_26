// =============================================================================
// Trip Notes Routes
// =============================================================================

import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as ctrl from "./notes.controller.js";

const router = Router();

router.get("/:tripId", requireAuth, ctrl.getNotes);
router.post("/:tripId", requireAuth, ctrl.addNote);
router.put("/:noteId", requireAuth, ctrl.updateNote);
router.delete("/:noteId", requireAuth, ctrl.deleteNote);
router.patch("/:noteId/pin", requireAuth, ctrl.togglePin);

export default router;
