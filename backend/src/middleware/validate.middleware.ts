// =============================================================================
// Validation Middleware — Request Body Validation
// =============================================================================

import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/**
 * Validate signup request body.
 */
export const validateSignup = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { first_name, last_name, email, password } = req.body;
  const errors: Record<string, string> = {};

  if (!first_name || typeof first_name !== "string" || first_name.trim().length === 0) {
    errors.first_name = "First name is required";
  } else if (first_name.trim().length > 100) {
    errors.first_name = "First name must be 100 characters or less";
  }

  if (!last_name || typeof last_name !== "string" || last_name.trim().length === 0) {
    errors.last_name = "Last name is required";
  } else if (last_name.trim().length > 100) {
    errors.last_name = "Last name must be 100 characters or less";
  }

  if (!email || typeof email !== "string") {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Invalid email format";
  }

  if (!password || typeof password !== "string") {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (password.length > 128) {
    errors.password = "Password must be 128 characters or less";
  }

  if (Object.keys(errors).length > 0) {
    sendError(res, 400, {
      message: "Validation failed",
      errors,
    });
    return;
  }

  // Sanitize: trim whitespace
  req.body.first_name = first_name.trim();
  req.body.last_name = last_name.trim();
  req.body.email = email.trim().toLowerCase();

  next();
};

/**
 * Validate login request body.
 */
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;
  const errors: Record<string, string> = {};

  if (!email || typeof email !== "string") {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Invalid email format";
  }

  if (!password || typeof password !== "string") {
    errors.password = "Password is required";
  }

  if (Object.keys(errors).length > 0) {
    sendError(res, 400, {
      message: "Validation failed",
      errors,
    });
    return;
  }

  req.body.email = email.trim().toLowerCase();

  next();
};
