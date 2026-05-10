// =============================================================================
// Auth Middleware — JWT Verification Guard
// =============================================================================

import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../modules/auth/auth.service.js";
import { sendError } from "../utils/response.js";

/**
 * Extracts the Bearer token from the Authorization header,
 * verifies it, and attaches `userId`, `email`, `isAdmin` to `req`.
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, 401, { message: "Access token required" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    sendError(res, 401, { message: "Access token required" });
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    // Attach user info to request
    (req as any).userId = payload.userId;
    (req as any).email = payload.email;
    (req as any).isAdmin = payload.isAdmin;

    next();
  } catch {
    sendError(res, 401, { message: "Invalid or expired access token" });
  }
};

/**
 * Optional: only for admin-level routes.
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!(req as any).isAdmin) {
    sendError(res, 403, { message: "Admin access required" });
    return;
  }
  next();
};
