// =============================================================================
// Auth Controller — Route Handlers
// =============================================================================

import type { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { AppError } from "../../utils/errors.js";
import type { SignupBody, LoginBody } from "./auth.types.js";

// Cookie options for refresh token
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: "/",
};

// ─── POST /api/auth/signup ──────────────────────────────────────────
export const signupHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body as SignupBody;
    const { user, tokens } = await authService.signup(body);

    // Set refresh token as httpOnly cookie
    res.cookie("refresh_token", tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    sendSuccess(res, 201, {
      message: "Account created successfully",
      data: {
        user,
        access_token: tokens.accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ───────────────────────────────────────────
export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body as LoginBody;
    const { user, tokens } = await authService.login(body);

    // Set refresh token as httpOnly cookie
    res.cookie("refresh_token", tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    sendSuccess(res, 200, {
      message: "Login successful",
      data: {
        user,
        access_token: tokens.accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/signout ─────────────────────────────────────────
export const signoutHandler = async (
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  // Clear the refresh token cookie
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
  });

  sendSuccess(res, 200, {
    message: "Signed out successfully",
  });
};

// ─── GET /api/auth/me ───────────────────────────────────────────────
export const meHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // userId is set by auth middleware
    const userId = (req as any).userId as string;
    const user = await authService.getUserById(userId);

    if (!user) {
      sendError(res, 404, { message: "User not found" });
      return;
    }

    sendSuccess(res, 200, { data: { user } });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/refresh ────────────────────────────────────────
export const refreshHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refresh_token as string | undefined;

    if (!refreshToken) {
      sendError(res, 401, { message: "No refresh token provided" });
      return;
    }

    // Verify the refresh token
    const payload = authService.verifyRefreshToken(refreshToken);

    // Issue new access token
    const tokens = authService.generateTokens({
      userId: payload.userId,
      email: payload.email,
      isAdmin: payload.isAdmin,
    });

    // Rotate refresh token cookie
    res.cookie("refresh_token", tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    sendSuccess(res, 200, {
      message: "Token refreshed",
      data: { access_token: tokens.accessToken },
    });
  } catch (err) {
    // If refresh token is invalid/expired, clear the cookie
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
    });
    sendError(res, 401, { message: "Invalid or expired refresh token" });
  }
};

// ─── Global error handler middleware ────────────────────────────────
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, { message: err.message });
    return;
  }

  console.error("❌ Unhandled error:", err);
  sendError(res, 500, { message: "Internal server error" });
};
