// =============================================================================
// Admin Service — Dashboard Data from PostgreSQL
// =============================================================================

import { query } from "../../config/database.js";

// ─── Static admin credentials ───────────────────────────────────────
const ADMIN_EMAIL = "admin@odoo.com";
const ADMIN_PASSWORD = "Admin123";

export const verifyAdminCredentials = (email: string, password: string): boolean => {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
};

// ─── Users list ─────────────────────────────────────────────────────
export const getUsers = async (params: {
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}) => {
  const { search, sortBy = "created_at", sortOrder = "desc", page = 1, limit = 20 } = params;

  const conditions: string[] = ["deleted_at IS NULL"];
  const values: any[] = [];
  let idx = 1;

  if (search && search.trim()) {
    conditions.push(
      `(first_name ILIKE $${idx} OR last_name ILIKE $${idx} OR email ILIKE $${idx})`
    );
    values.push(`%${search.trim()}%`);
    idx++;
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  const allowedSort = ["created_at", "first_name", "last_name", "email"];
  const col = allowedSort.includes(sortBy) ? sortBy : "created_at";
  const order = sortOrder === "asc" ? "ASC" : "DESC";
  const offset = (page - 1) * limit;

  const countRes = await query(`SELECT COUNT(*) AS total FROM users ${where}`, values);
  const total = parseInt(countRes.rows[0].total, 10);

  const dataRes = await query(
    `SELECT id, first_name, last_name, email, phone_number, city, country,
            is_active, is_admin, created_at
     FROM users ${where}
     ORDER BY ${col} ${order}
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...values, limit, offset]
  );

  return { users: dataRes.rows, total, page, limit };
};

// ─── Popular cities ─────────────────────────────────────────────────
export const getPopularCities = async () => {
  const result = await query(
    `SELECT c.name, c.country, c.popularity_score,
            COUNT(ts.id) AS trip_count
     FROM cities c
     LEFT JOIN trip_stops ts ON ts.city_id = c.id
     GROUP BY c.id, c.name, c.country, c.popularity_score
     ORDER BY trip_count DESC, c.popularity_score DESC
     LIMIT 15`
  );
  return result.rows;
};

// ─── Popular activities ─────────────────────────────────────────────
export const getPopularActivities = async () => {
  const result = await query(
    `SELECT a.name, a.category, a.rating, a.review_count,
            COUNT(tsa.id) AS usage_count
     FROM activities a
     LEFT JOIN trip_stop_activities tsa ON tsa.activity_id = a.id
     GROUP BY a.id, a.name, a.category, a.rating, a.review_count
     ORDER BY usage_count DESC, a.rating DESC
     LIMIT 15`
  );
  return result.rows;
};

// ─── User trends & analytics ────────────────────────────────────────
export const getUserTrends = async () => {
  // Users registered per month (last 12 months)
  const registrations = await query(
    `SELECT
       TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
       COUNT(*) AS count
     FROM users
     WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '12 months'
     GROUP BY DATE_TRUNC('month', created_at)
     ORDER BY DATE_TRUNC('month', created_at)`
  );

  // Trips created per month
  const trips = await query(
    `SELECT
       TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
       COUNT(*) AS count
     FROM trips
     WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '12 months'
     GROUP BY DATE_TRUNC('month', created_at)
     ORDER BY DATE_TRUNC('month', created_at)`
  );

  // Summary stats
  const totalUsers = await query("SELECT COUNT(*) AS count FROM users WHERE deleted_at IS NULL");
  const totalTrips = await query("SELECT COUNT(*) AS count FROM trips WHERE deleted_at IS NULL");
  const totalPosts = await query(
    "SELECT COUNT(*) AS count FROM community_posts WHERE deleted_at IS NULL"
  );
  const totalCities = await query("SELECT COUNT(*) AS count FROM cities");

  return {
    registrations: registrations.rows,
    trips: trips.rows,
    summary: {
      total_users: parseInt(totalUsers.rows[0].count, 10),
      total_trips: parseInt(totalTrips.rows[0].count, 10),
      total_posts: parseInt(totalPosts.rows[0].count, 10),
      total_cities: parseInt(totalCities.rows[0].count, 10),
    },
  };
};

// ═════════════════════════════════════════════════════════════════════
// CRUD — Cities
// ═════════════════════════════════════════════════════════════════════

export const getAllCities = async () => {
  const r = await query(
    "SELECT id, name, country, country_code, region, latitude, longitude, popularity_score, is_active, created_at FROM cities ORDER BY name"
  );
  return r.rows;
};

export const addCity = async (data: {
  name: string; country: string; country_code: string;
  latitude: number; longitude: number; popularity_score?: number; region?: string; description?: string;
}) => {
  const r = await query(
    `INSERT INTO cities (name, country, country_code, latitude, longitude, popularity_score, region, description)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [data.name, data.country, data.country_code, data.latitude, data.longitude,
     data.popularity_score || 0, data.region || null, data.description || null]
  );
  return r.rows[0];
};

export const updateCity = async (id: string, data: Record<string, any>) => {
  const allowed = ["name","country","country_code","latitude","longitude","popularity_score","region","description","is_active"];
  const sets: string[] = []; const vals: any[] = []; let i = 1;
  for (const k of allowed) {
    if (data[k] !== undefined) { sets.push(`${k} = $${i}`); vals.push(data[k]); i++; }
  }
  if (sets.length === 0) return null;
  sets.push(`updated_at = NOW()`);
  vals.push(id);
  const r = await query(`UPDATE cities SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`, vals);
  return r.rows[0] || null;
};

export const deleteCity = async (id: string) => {
  await query("DELETE FROM cities WHERE id = $1", [id]);
};

// ═════════════════════════════════════════════════════════════════════
// CRUD — Activities
// ═════════════════════════════════════════════════════════════════════

export const getAllActivities = async () => {
  const r = await query(
    `SELECT a.id, a.name, a.description, a.category, a.city_id, a.estimated_cost, a.currency,
            a.duration_minutes, a.rating, a.review_count, a.is_active, a.created_at,
            c.name AS city_name, c.country AS city_country
     FROM activities a LEFT JOIN cities c ON c.id = a.city_id
     ORDER BY a.name`
  );
  return r.rows;
};

export const addActivity = async (data: {
  city_id: string; name: string; category?: string;
  estimated_cost?: number; currency?: string; duration_minutes?: number; description?: string;
}) => {
  const r = await query(
    `INSERT INTO activities (city_id, name, category, estimated_cost, currency, duration_minutes, description)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [data.city_id, data.name, data.category || "other",
     data.estimated_cost || null, data.currency || "USD",
     data.duration_minutes || null, data.description || null]
  );
  return r.rows[0];
};

export const updateActivity = async (id: string, data: Record<string, any>) => {
  const allowed = ["name","category","city_id","estimated_cost","currency","duration_minutes","description","is_active"];
  const sets: string[] = []; const vals: any[] = []; let i = 1;
  for (const k of allowed) {
    if (data[k] !== undefined) { sets.push(`${k} = $${i}`); vals.push(data[k]); i++; }
  }
  if (sets.length === 0) return null;
  sets.push(`updated_at = NOW()`);
  vals.push(id);
  const r = await query(`UPDATE activities SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`, vals);
  return r.rows[0] || null;
};

export const deleteActivity = async (id: string) => {
  await query("DELETE FROM activities WHERE id = $1", [id]);
};

// ═════════════════════════════════════════════════════════════════════
// CRUD — Community Posts (moderation)
// ═════════════════════════════════════════════════════════════════════

export const getAllPosts = async () => {
  const r = await query(
    `SELECT cp.id, cp.title, cp.body, cp.like_count, cp.comment_count, cp.view_count,
            cp.is_featured, cp.is_published, cp.published_at, cp.deleted_at,
            u.first_name AS author_first_name, u.last_name AS author_last_name, u.email AS author_email
     FROM community_posts cp
     JOIN users u ON u.id = cp.author_id
     ORDER BY cp.published_at DESC`
  );
  return r.rows;
};

export const deletePost = async (id: string) => {
  await query("UPDATE community_posts SET deleted_at = NOW(), is_published = FALSE WHERE id = $1", [id]);
};

export const restorePost = async (id: string) => {
  await query("UPDATE community_posts SET deleted_at = NULL, is_published = TRUE WHERE id = $1", [id]);
};

export const toggleFeatured = async (id: string) => {
  await query("UPDATE community_posts SET is_featured = NOT is_featured WHERE id = $1", [id]);
};
