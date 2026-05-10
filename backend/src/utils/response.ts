// =============================================================================
// Standardized API Response Helpers
// =============================================================================

import type { Response } from "express";

interface SuccessPayload<T> {
  message?: string;
  data?: T;
}

interface ErrorPayload {
  message: string;
  errors?: Record<string, string>;
}

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  payload: SuccessPayload<T>
): void => {
  res.status(statusCode).json({
    success: true,
    message: payload.message,
    data: payload.data,
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  payload: ErrorPayload
): void => {
  res.status(statusCode).json({
    success: false,
    message: payload.message,
    errors: payload.errors,
  });
};
