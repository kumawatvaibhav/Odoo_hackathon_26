// =============================================================================
// Trip Notes Controller
// =============================================================================

import type { Request, Response, NextFunction } from "express";
import * as svc from "./notes.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export const getNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const tripId = req.params.tripId as string;
    const notes = await svc.getNotesForTrip(tripId, userId);
    sendSuccess(res, 200, { data: { notes } });
  } catch (err) { next(err); }
};

export const addNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const tripId = req.params.tripId as string;
    const { title, content, trip_stop_id } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      sendError(res, 400, { message: "Note content is required" });
      return;
    }
    const note = await svc.addNote(tripId, userId, { title, content: content.trim(), trip_stop_id });
    sendSuccess(res, 201, { data: { note } });
  } catch (err) { next(err); }
};

export const updateNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const noteId = req.params.noteId as string;
    const { title, content } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      sendError(res, 400, { message: "Note content is required" });
      return;
    }
    const note = await svc.updateNote(noteId, userId, { title, content: content.trim() });
    if (!note) { sendError(res, 404, { message: "Note not found" }); return; }
    sendSuccess(res, 200, { data: { note } });
  } catch (err) { next(err); }
};

export const deleteNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const noteId = req.params.noteId as string;
    const ok = await svc.deleteNote(noteId, userId);
    if (!ok) { sendError(res, 404, { message: "Note not found" }); return; }
    sendSuccess(res, 200, { message: "Note deleted" });
  } catch (err) { next(err); }
};

export const togglePin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const noteId = req.params.noteId as string;
    const note = await svc.togglePin(noteId, userId);
    if (!note) { sendError(res, 404, { message: "Note not found" }); return; }
    sendSuccess(res, 200, { data: { note } });
  } catch (err) { next(err); }
};
