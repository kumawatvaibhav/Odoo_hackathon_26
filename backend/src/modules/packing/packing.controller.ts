// =============================================================================
// Packing Controller — Route Handlers
// =============================================================================

import type { Request, Response, NextFunction } from "express";
import * as svc from "./packing.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export const getItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const tripId = req.params.tripId as string;
    const items = await svc.getItemsForTrip(tripId, userId);
    sendSuccess(res, 200, { data: { items } });
  } catch (err) { next(err); }
};

export const addItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const tripId = req.params.tripId as string;
    const { name, category, quantity } = req.body;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      sendError(res, 400, { message: "Item name is required" });
      return;
    }
    const item = await svc.addItem(tripId, userId, { name: name.trim(), category, quantity });
    sendSuccess(res, 201, { data: { item } });
  } catch (err) { next(err); }
};

export const toggleItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const itemId = req.params.itemId as string;
    const item = await svc.toggleItem(itemId, userId);
    if (!item) { sendError(res, 404, { message: "Item not found" }); return; }
    sendSuccess(res, 200, { data: { item } });
  } catch (err) { next(err); }
};

export const deleteItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const itemId = req.params.itemId as string;
    const ok = await svc.deleteItem(itemId, userId);
    if (!ok) { sendError(res, 404, { message: "Item not found" }); return; }
    sendSuccess(res, 200, { message: "Item deleted" });
  } catch (err) { next(err); }
};

export const resetAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const tripId = req.params.tripId as string;
    const count = await svc.resetAll(tripId, userId);
    sendSuccess(res, 200, { message: `Reset ${count} items`, data: { resetCount: count } });
  } catch (err) { next(err); }
};
