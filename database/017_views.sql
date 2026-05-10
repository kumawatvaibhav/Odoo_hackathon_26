-- =============================================================================
-- TRAVELOOP — Useful Views (read-only projections for common queries)
-- =============================================================================

-- -----------------------------------------------------------------------
-- 1. Trip summary with owner info and stop count
-- -----------------------------------------------------------------------
CREATE OR REPLACE VIEW v_trip_summary AS
SELECT
    t.id                AS trip_id,
    t.title,
    t.trip_status,
    t.visibility,
    t.is_public,
    t.start_date,
    t.end_date,
    t.total_budget,
    t.currency,
    t.cover_image_url,
    t.share_slug,
    t.created_at,
    u.id                AS owner_id,
    u.first_name || ' ' || u.last_name AS owner_name,
    u.profile_photo_url AS owner_photo,
    COALESCE(sc.stop_count, 0)  AS stop_count,
    COALESCE(ec.total_spent, 0) AS total_spent
FROM trips t
JOIN users u ON u.id = t.owner_id
LEFT JOIN LATERAL (
    SELECT COUNT(*) AS stop_count
    FROM trip_stops ts
    WHERE ts.trip_id = t.id
) sc ON TRUE
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(e.amount * e.quantity), 0) AS total_spent
    FROM expenses e
    WHERE e.trip_id = t.id AND e.deleted_at IS NULL
) ec ON TRUE
WHERE t.deleted_at IS NULL;

-- -----------------------------------------------------------------------
-- 2. Public community feed
-- -----------------------------------------------------------------------
CREATE OR REPLACE VIEW v_community_feed AS
SELECT
    cp.id               AS post_id,
    cp.title,
    cp.body,
    cp.share_slug,
    cp.cover_image_url,
    cp.like_count,
    cp.comment_count,
    cp.view_count,
    cp.is_featured,
    cp.published_at,
    u.id                AS author_id,
    u.first_name || ' ' || u.last_name AS author_name,
    u.profile_photo_url AS author_photo,
    t.title             AS trip_title,
    t.share_slug        AS trip_slug
FROM community_posts cp
JOIN users u ON u.id = cp.author_id
JOIN trips t ON t.id = cp.trip_id
WHERE cp.is_published = TRUE
  AND cp.deleted_at IS NULL
  AND t.deleted_at IS NULL;

-- -----------------------------------------------------------------------
-- 3. Expense breakdown per trip (for dashboards)
-- -----------------------------------------------------------------------
CREATE OR REPLACE VIEW v_expense_breakdown AS
SELECT
    e.trip_id,
    e.category,
    e.currency,
    COUNT(*)                         AS item_count,
    SUM(e.amount * e.quantity)       AS total_amount,
    MIN(e.expense_date)              AS earliest_date,
    MAX(e.expense_date)              AS latest_date
FROM expenses e
WHERE e.deleted_at IS NULL
GROUP BY e.trip_id, e.category, e.currency;
