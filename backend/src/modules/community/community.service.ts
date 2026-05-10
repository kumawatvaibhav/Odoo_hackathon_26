// =============================================================================
// Community Service — Business Logic
// =============================================================================

import { query } from "../../config/database.js";
import { NotFoundError } from "../../utils/errors.js";
import type {
  CommunityPostRow,
  SafeCommunityPost,
  CommunityQueryParams,
  CreatePostBody,
} from "./community.types.js";

// ─── Transform DB row → safe API shape ──────────────────────────────
const toSafePost = (row: CommunityPostRow): SafeCommunityPost => ({
  id: row.id,
  trip_id: row.trip_id,
  title: row.title,
  body: row.body,
  share_slug: row.share_slug,
  cover_image_url: row.cover_image_url,
  like_count: row.like_count,
  comment_count: row.comment_count,
  view_count: row.view_count,
  is_featured: row.is_featured,
  published_at: row.published_at,
  author: {
    id: row.author_id,
    first_name: row.author_first_name || "",
    last_name: row.author_last_name || "",
    profile_photo_url: row.author_profile_photo_url || null,
  },
  trip: {
    title: row.trip_title || "",
    city: row.trip_city || null,
    country: row.trip_country || null,
  },
});

// ─── List / Search posts ────────────────────────────────────────────
export const getPosts = async (
  params: CommunityQueryParams
): Promise<{ posts: SafeCommunityPost[]; total: number; page: number; limit: number }> => {
  const {
    search,
    filter,
    sortBy = "published_at",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  const conditions: string[] = [
    "cp.is_published = TRUE",
    "cp.deleted_at IS NULL",
  ];
  const values: any[] = [];
  let paramIdx = 1;

  // Search
  if (search && search.trim()) {
    conditions.push(`(cp.title ILIKE $${paramIdx} OR cp.body ILIKE $${paramIdx})`);
    values.push(`%${search.trim()}%`);
    paramIdx++;
  }

  // Filter presets
  if (filter === "featured") {
    conditions.push("cp.is_featured = TRUE");
  } else if (filter === "recent") {
    conditions.push("cp.published_at >= NOW() - INTERVAL '7 days'");
  } else if (filter === "popular") {
    conditions.push("cp.like_count >= 5");
  }

  // Allowed sort columns (whitelist to prevent SQL injection)
  const allowedSort = ["published_at", "like_count", "view_count", "comment_count"];
  const sortCol = allowedSort.includes(sortBy) ? sortBy : "published_at";
  const order = sortOrder === "asc" ? "ASC" : "DESC";

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (page - 1) * limit;

  // Count total
  const countSql = `SELECT COUNT(*) AS total FROM community_posts cp ${whereClause}`;
  const countResult = await query(countSql, values);
  const total = parseInt(countResult.rows[0].total, 10);

  // Fetch posts with author + trip info (city comes via first trip_stop)
  const dataSql = `
    SELECT
      cp.*,
      u.first_name  AS author_first_name,
      u.last_name   AS author_last_name,
      u.email        AS author_email,
      u.profile_photo_url AS author_profile_photo_url,
      t.title        AS trip_title,
      c.name         AS trip_city,
      c.country      AS trip_country
    FROM community_posts cp
    JOIN users u ON u.id = cp.author_id
    JOIN trips t ON t.id = cp.trip_id
    LEFT JOIN trip_stops ts ON ts.trip_id = t.id AND ts.order_index = 0
    LEFT JOIN cities c ON c.id = ts.city_id
    ${whereClause}
    ORDER BY cp.${sortCol} ${order}
    LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
  `;

  const dataResult = await query(dataSql, [...values, limit, offset]);

  return {
    posts: dataResult.rows.map((r: any) => toSafePost(r)),
    total,
    page,
    limit,
  };
};

// ─── Get single post by ID ──────────────────────────────────────────
export const getPostById = async (postId: string): Promise<SafeCommunityPost> => {
  const result = await query(
    `SELECT
      cp.*,
      u.first_name  AS author_first_name,
      u.last_name   AS author_last_name,
      u.email        AS author_email,
      u.profile_photo_url AS author_profile_photo_url,
      t.title        AS trip_title,
      c.name         AS trip_city,
      c.country      AS trip_country
    FROM community_posts cp
    JOIN users u ON u.id = cp.author_id
    JOIN trips t ON t.id = cp.trip_id
    LEFT JOIN trip_stops ts ON ts.trip_id = t.id AND ts.order_index = 0
    LEFT JOIN cities c ON c.id = ts.city_id
    WHERE cp.id = $1 AND cp.is_published = TRUE AND cp.deleted_at IS NULL`,
    [postId]
  );

  if ((result.rowCount ?? 0) === 0) {
    throw new NotFoundError("Community post not found");
  }

  // Increment view count (fire-and-forget)
  query("UPDATE community_posts SET view_count = view_count + 1 WHERE id = $1", [postId]).catch(
    () => {}
  );

  return toSafePost(result.rows[0]);
};

// ─── Create a new post ──────────────────────────────────────────────
export const createPost = async (
  authorId: string,
  body: CreatePostBody
): Promise<SafeCommunityPost> => {
  let tripId = body.trip_id;

  // If no trip_id provided, auto-create a community trip for this user
  if (!tripId) {
    const tripResult = await query(
      `INSERT INTO trips (owner_id, title, trip_status, visibility, is_public)
       VALUES ($1, $2, 'completed', 'public', TRUE)
       RETURNING id`,
      [authorId, body.title]
    );
    tripId = tripResult.rows[0].id;
  }

  const result = await query(
    `INSERT INTO community_posts (trip_id, author_id, title, body, cover_image_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [tripId, authorId, body.title, body.body || null, body.cover_image_url || null]
  );

  // Re-fetch with joins
  return getPostById(result.rows[0].id);
};

// ─── Toggle like ────────────────────────────────────────────────────
export const toggleLike = async (
  postId: string,
  userId: string
): Promise<{ liked: boolean; like_count: number }> => {
  // Check if already liked
  const existing = await query(
    "SELECT id FROM community_likes WHERE post_id = $1 AND user_id = $2",
    [postId, userId]
  );

  if ((existing.rowCount ?? 0) > 0) {
    // Unlike
    await query("DELETE FROM community_likes WHERE post_id = $1 AND user_id = $2", [
      postId,
      userId,
    ]);
    await query(
      "UPDATE community_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1",
      [postId]
    );
    const updated = await query("SELECT like_count FROM community_posts WHERE id = $1", [postId]);
    return { liked: false, like_count: updated.rows[0].like_count };
  } else {
    // Like
    await query("INSERT INTO community_likes (post_id, user_id) VALUES ($1, $2)", [
      postId,
      userId,
    ]);
    await query("UPDATE community_posts SET like_count = like_count + 1 WHERE id = $1", [postId]);
    const updated = await query("SELECT like_count FROM community_posts WHERE id = $1", [postId]);
    return { liked: true, like_count: updated.rows[0].like_count };
  }
};
