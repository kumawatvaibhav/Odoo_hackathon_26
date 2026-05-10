// =============================================================================
// Trips Routes
// =============================================================================

import { Router } from "express";
import {
  getCitiesHandler,
  createTripHandler,
  getUserTripsHandler,
  getTripHandler,
  addStopHandler,
  updateStopHandler,
  deleteStopHandler,
  getActivitiesHandler,
  addActivityHandler,
  updateActivityHandler,
  deleteActivityHandler,
} from "./trips.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

// ─── Cities (public) ────────────────────────────────────────────────────────
router.get("/cities", getCitiesHandler);

// ─── Trips (protected) ──────────────────────────────────────────────────────
router.post("/", requireAuth, createTripHandler);
router.get("/", requireAuth, getUserTripsHandler);
router.get("/:tripId", requireAuth, getTripHandler);

// ─── Trip Stops / Itinerary Sections ────────────────────────────────────────
router.post("/:tripId/stops", requireAuth, addStopHandler);
router.patch("/:tripId/stops/:stopId", requireAuth, updateStopHandler);
router.delete("/:tripId/stops/:stopId", requireAuth, deleteStopHandler);

// ─── Activities ─────────────────────────────────────────────────────────────
router.get("/:tripId/stops/:stopId/activities", requireAuth, getActivitiesHandler);
router.post("/:tripId/stops/:stopId/activities", requireAuth, addActivityHandler);
router.patch("/:tripId/stops/:stopId/activities/:activityId", requireAuth, updateActivityHandler);
router.delete("/:tripId/stops/:stopId/activities/:activityId", requireAuth, deleteActivityHandler);

export default router;
