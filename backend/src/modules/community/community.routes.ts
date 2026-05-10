// =============================================================================
// Community Routes
// =============================================================================

import { Router } from "express";
import {
  listPostsHandler,
  getPostHandler,
  createPostHandler,
  likePostHandler,
} from "./community.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", listPostsHandler);
router.get("/:id", getPostHandler);

// Protected routes (require login)
router.post("/", requireAuth, createPostHandler);
router.post("/:id/like", requireAuth, likePostHandler);

export default router;
