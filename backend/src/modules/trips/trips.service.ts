// =============================================================================
// Trips Service — Business Logic
// =============================================================================

import { query, getClient } from "../../config/database.js";
import type { CreateTripBody, CreateTripStopBody, UpdateTripStopBody } from "./trips.types.js";

// ─── Cities ─────────────────────────────────────────────────────────────────

/** Search cities by name (typeahead / suggestion grid) */
export const searchCities = async (search: string, limit = 12) => {
  const result = await query(
    `SELECT id, name, country, country_code, region,
            popularity_score, cost_index, tags, images, description
     FROM cities
     WHERE is_active = TRUE
       AND (
         $1 = '%%' OR
         name ILIKE $1 OR country ILIKE $1
       )
     ORDER BY popularity_score DESC
     LIMIT $2`,
    [`%${search}%`, limit]
  );
  return result.rows;
};

/** Popular cities for suggestion grid (no filter) */
export const getPopularCities = async (limit = 9) => {
  const result = await query(
    `SELECT id, name, country, country_code, region,
            popularity_score, cost_index, tags, images, description
     FROM cities
     WHERE is_active = TRUE
     ORDER BY popularity_score DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

// ─── Trips ────────────────────────────────────────────────────────────────────

/** Create a new trip for the authenticated user */
export const createTrip = async (ownerId: string, body: CreateTripBody) => {
  const result = await query(
    `INSERT INTO trips (owner_id, title, description, start_date, end_date, total_budget, currency)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, title, description, start_date, end_date,
               total_budget, currency, trip_status, created_at`,
    [
      ownerId,
      body.title,
      body.description ?? null,
      body.start_date ?? null,
      body.end_date ?? null,
      body.total_budget ?? null,
      body.currency ?? "USD",
    ]
  );
  return result.rows[0];
};

/** Get all trips owned by a user */
export const getUserTrips = async (ownerId: string) => {
  const result = await query(
    `SELECT t.id, t.title, t.description, t.start_date, t.end_date,
            t.total_budget, t.currency, t.trip_status, t.created_at,
            COUNT(ts.id)::int AS stop_count
     FROM trips t
     LEFT JOIN trip_stops ts ON ts.trip_id = t.id
     WHERE t.owner_id = $1 AND t.deleted_at IS NULL
     GROUP BY t.id
     ORDER BY t.created_at DESC`,
    [ownerId]
  );
  return result.rows;
};

/** Get a single trip with its stops and city info */
export const getTripById = async (tripId: string, ownerId: string) => {
  const tripResult = await query(
    `SELECT id, title, description, start_date, end_date,
            total_budget, currency, trip_status, created_at
     FROM trips
     WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL`,
    [tripId, ownerId]
  );

  if (!tripResult.rows[0]) return null;

  const stopsResult = await query(
    `SELECT ts.id, ts.order_index, ts.arrival_date, ts.departure_date,
            ts.notes, ts.budget,
            c.id AS city_id, c.name AS city_name, c.country,
            c.images, c.tags, c.cost_index
     FROM trip_stops ts
     JOIN cities c ON c.id = ts.city_id
     WHERE ts.trip_id = $1
     ORDER BY ts.order_index ASC`,
    [tripId]
  );

  return { ...tripResult.rows[0], stops: stopsResult.rows };
};

// ─── Trip Stops (Itinerary sections) ─────────────────────────────────────────

/** Add a stop/section to a trip */
export const addTripStop = async (
  tripId: string,
  ownerId: string,
  body: CreateTripStopBody
) => {
  // Verify trip ownership
  const trip = await query(
    `SELECT id FROM trips WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL`,
    [tripId, ownerId]
  );
  if (!trip.rows[0]) throw new Error("Trip not found or access denied");

  // Get the next order index
  const maxOrder = await query(
    `SELECT COALESCE(MAX(order_index), -1) AS max_idx FROM trip_stops WHERE trip_id = $1`,
    [tripId]
  );
  const orderIndex = body.order_index ?? (maxOrder.rows[0].max_idx + 1);

  const result = await query(
    `INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, notes, budget, order_index)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, trip_id, city_id, arrival_date, departure_date, notes, budget, order_index`,
    [
      tripId,
      body.city_id,
      body.arrival_date ?? null,
      body.departure_date ?? null,
      body.notes ?? null,
      body.budget ?? null,
      orderIndex,
    ]
  );

  // Fetch city info to return enriched stop
  const cityResult = await query(
    `SELECT id, name, country, images, tags FROM cities WHERE id = $1`,
    [body.city_id]
  );

  return { ...result.rows[0], city: cityResult.rows[0] };
};

/** Update a trip stop */
export const updateTripStop = async (
  stopId: string,
  tripId: string,
  ownerId: string,
  body: UpdateTripStopBody
) => {
  // Verify trip ownership
  const trip = await query(
    `SELECT id FROM trips WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL`,
    [tripId, ownerId]
  );
  if (!trip.rows[0]) throw new Error("Trip not found or access denied");

  const result = await query(
    `UPDATE trip_stops
     SET arrival_date   = COALESCE($1, arrival_date),
         departure_date = COALESCE($2, departure_date),
         notes          = COALESCE($3, notes),
         budget         = COALESCE($4, budget),
         order_index    = COALESCE($5, order_index),
         updated_at     = now()
     WHERE id = $6 AND trip_id = $7
     RETURNING *`,
    [
      body.arrival_date ?? null,
      body.departure_date ?? null,
      body.notes ?? null,
      body.budget ?? null,
      body.order_index ?? null,
      stopId,
      tripId,
    ]
  );
  return result.rows[0];
};

/** Delete a trip stop */
export const deleteTripStop = async (
  stopId: string,
  tripId: string,
  ownerId: string
) => {
  // Verify trip ownership
  const trip = await query(
    `SELECT id FROM trips WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL`,
    [tripId, ownerId]
  );
  if (!trip.rows[0]) throw new Error("Trip not found or access denied");

  await query(
    `DELETE FROM trip_stops WHERE id = $1 AND trip_id = $2`,
    [stopId, tripId]
  );
};

// ─── Activities (day-by-day itinerary items) ─────────────────────────────────

/** Get all activities for a trip stop, grouped by day */
export const getStopActivities = async (stopId: string) => {
  const result = await query(
    `SELECT id, stop_id, day_number, order_index, title, description, expense,
            created_at, updated_at
     FROM trip_activities
     WHERE stop_id = $1
     ORDER BY day_number ASC, order_index ASC`,
    [stopId]
  );
  return result.rows;
};

/** Add an activity to a trip stop */
export const addActivity = async (
  stopId: string,
  body: import("./trips.types.js").CreateActivityBody
) => {
  // Get the next order index for the day
  const maxOrder = await query(
    `SELECT COALESCE(MAX(order_index), -1) AS max_idx
     FROM trip_activities WHERE stop_id = $1 AND day_number = $2`,
    [stopId, body.day_number]
  );
  const orderIndex = body.order_index ?? (maxOrder.rows[0].max_idx + 1);

  const result = await query(
    `INSERT INTO trip_activities (stop_id, day_number, order_index, title, description, expense)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      stopId,
      body.day_number,
      orderIndex,
      body.title || "",
      body.description ?? null,
      body.expense ?? 0,
    ]
  );
  return result.rows[0];
};

/** Update an activity */
export const updateActivity = async (
  activityId: string,
  body: import("./trips.types.js").UpdateActivityBody
) => {
  const result = await query(
    `UPDATE trip_activities
     SET title       = COALESCE($1, title),
         description = COALESCE($2, description),
         expense     = COALESCE($3, expense),
         day_number  = COALESCE($4, day_number),
         order_index = COALESCE($5, order_index),
         updated_at  = now()
     WHERE id = $6
     RETURNING *`,
    [
      body.title ?? null,
      body.description ?? null,
      body.expense ?? null,
      body.day_number ?? null,
      body.order_index ?? null,
      activityId,
    ]
  );
  return result.rows[0];
};

/** Delete an activity */
export const deleteActivity = async (activityId: string) => {
  await query(`DELETE FROM trip_activities WHERE id = $1`, [activityId]);
};
