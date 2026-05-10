// =============================================================================
// Trips Controller — Route Handlers
// =============================================================================

import type { Request, Response, NextFunction } from "express";
import * as tripsService from "./trips.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

// ─── GET /api/cities ─────────────────────────────────────────────────────────
export const getCitiesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const search = (req.query.search as string) || "";
    const limit = parseInt((req.query.limit as string) || "12", 10);

    const cities = search
      ? await tripsService.searchCities(search, limit)
      : await tripsService.getPopularCities(limit);

    sendSuccess(res, 200, { data: { cities, count: cities.length } });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/trips ──────────────────────────────────────────────────────────
export const createTripHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerId = (req as any).userId as string;
    const { title, description, start_date, end_date, total_budget, currency } =
      req.body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      sendError(res, 400, { message: "Trip title is required" });
      return;
    }

    const trip = await tripsService.createTrip(ownerId, {
      title: title.trim(),
      description,
      start_date,
      end_date,
      total_budget,
      currency,
    });

    sendSuccess(res, 201, {
      message: "Trip created successfully",
      data: { trip },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/trips ───────────────────────────────────────────────────────────
export const getUserTripsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerId = (req as any).userId as string;
    const trips = await tripsService.getUserTrips(ownerId);
    sendSuccess(res, 200, { data: { trips, count: trips.length } });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/trips/:tripId ───────────────────────────────────────────────────
export const getTripHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerId = (req as any).userId as string;
    const { tripId } = req.params;
    const trip = await tripsService.getTripById(tripId, ownerId);

    if (!trip) {
      sendError(res, 404, { message: "Trip not found" });
      return;
    }

    sendSuccess(res, 200, { data: { trip } });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/trips/:tripId/stops ────────────────────────────────────────────
export const addStopHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerId = (req as any).userId as string;
    const { tripId } = req.params;
    const { city_id, arrival_date, departure_date, notes, budget, order_index } =
      req.body;

    if (!city_id) {
      sendError(res, 400, { message: "city_id is required" });
      return;
    }

    const stop = await tripsService.addTripStop(tripId, ownerId, {
      city_id,
      arrival_date,
      departure_date,
      notes,
      budget,
      order_index,
    });

    sendSuccess(res, 201, {
      message: "Stop added successfully",
      data: { stop },
    });
  } catch (err: any) {
    if (err.message?.includes("access denied")) {
      sendError(res, 403, { message: err.message });
    } else {
      next(err);
    }
  }
};

// ─── PATCH /api/trips/:tripId/stops/:stopId ───────────────────────────────────
export const updateStopHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerId = (req as any).userId as string;
    const { tripId, stopId } = req.params;
    const { arrival_date, departure_date, notes, budget, order_index } = req.body;

    const stop = await tripsService.updateTripStop(stopId, tripId, ownerId, {
      arrival_date,
      departure_date,
      notes,
      budget,
      order_index,
    });

    sendSuccess(res, 200, { data: { stop } });
  } catch (err: any) {
    if (err.message?.includes("access denied")) {
      sendError(res, 403, { message: err.message });
    } else {
      next(err);
    }
  }
};

// ─── DELETE /api/trips/:tripId/stops/:stopId ──────────────────────────────────
export const deleteStopHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerId = (req as any).userId as string;
    const { tripId, stopId } = req.params;

    await tripsService.deleteTripStop(stopId, tripId, ownerId);
    sendSuccess(res, 200, { message: "Stop removed" });
  } catch (err: any) {
    if (err.message?.includes("access denied")) {
      sendError(res, 403, { message: err.message });
    } else {
      next(err);
    }
  }
};

// ─── GET /api/trips/:tripId/stops/:stopId/activities ──────────────────────────
export const getActivitiesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { stopId } = req.params;
    const activities = await tripsService.getStopActivities(stopId);
    sendSuccess(res, 200, { data: { activities } });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/trips/:tripId/stops/:stopId/activities ─────────────────────────
export const addActivityHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { stopId } = req.params;
    const { day_number, title, description, expense, order_index } = req.body;

    if (day_number == null || day_number < 1) {
      sendError(res, 400, { message: "day_number >= 1 is required" });
      return;
    }

    const activity = await tripsService.addActivity(stopId, {
      day_number,
      title: title || "",
      description,
      expense,
      order_index,
    });

    sendSuccess(res, 201, { data: { activity } });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/trips/:tripId/stops/:stopId/activities/:activityId ────────────
export const updateActivityHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { activityId } = req.params;
    const { title, description, expense, day_number, order_index } = req.body;

    const activity = await tripsService.updateActivity(activityId, {
      title,
      description,
      expense,
      day_number,
      order_index,
    });

    sendSuccess(res, 200, { data: { activity } });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/trips/:tripId/stops/:stopId/activities/:activityId ───────────
export const deleteActivityHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { activityId } = req.params;
    await tripsService.deleteActivity(activityId);
    sendSuccess(res, 200, { message: "Activity removed" });
  } catch (err) {
    next(err);
  }
};
