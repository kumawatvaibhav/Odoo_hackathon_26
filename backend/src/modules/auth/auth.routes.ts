// =============================================================================
// Auth Routes
// =============================================================================

import { Router } from "express";
import {
  signupHandler,
  loginHandler,
  signoutHandler,
  meHandler,
  refreshHandler,
} from "./auth.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validateSignup, validateLogin } from "../../middleware/validate.middleware.js";
import { loginLimiter, signupLimiter } from "../../middleware/rateLimiter.middleware.js";

const router = Router();

// Public routes
router.post("/signup", signupLimiter, validateSignup, signupHandler);
router.post("/login", loginLimiter, validateLogin, loginHandler);
router.post("/refresh", refreshHandler);

// Protected routes
router.post("/signout", requireAuth, signoutHandler);
router.get("/me", requireAuth, meHandler);

export default router;
