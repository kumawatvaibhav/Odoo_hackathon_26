-- =============================================================================
-- TRAVELOOP — Trigger Functions & Automation
-- =============================================================================

-- -----------------------------------------------------------------------
-- 1. Auto-update `updated_at` on any row modification
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to every table that has an updated_at column
DO $$
DECLARE
    _tbl TEXT;
BEGIN
    FOR _tbl IN
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = 'updated_at'
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW
             EXECUTE FUNCTION fn_set_updated_at();',
            _tbl, _tbl
        );
    END LOOP;
END;
$$;

-- -----------------------------------------------------------------------
-- 2. Auto-increment / decrement like_count on community_posts
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_community_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_community_like_count
AFTER INSERT OR DELETE ON community_likes
FOR EACH ROW
EXECUTE FUNCTION fn_community_like_count();

-- -----------------------------------------------------------------------
-- 3. Auto-increment / decrement comment_count on community_posts
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_community_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_community_comment_count
AFTER INSERT OR DELETE ON community_comments
FOR EACH ROW
EXECUTE FUNCTION fn_community_comment_count();

-- -----------------------------------------------------------------------
-- 4. Auto-update activity rating aggregate after review insert/update/delete
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_activity_rating_sync()
RETURNS TRIGGER AS $$
DECLARE
    _activity_id UUID;
BEGIN
    _activity_id := COALESCE(NEW.activity_id, OLD.activity_id);

    UPDATE activities
    SET rating = COALESCE(
            (SELECT ROUND(AVG(rating), 2)
             FROM activity_reviews
             WHERE activity_id = _activity_id AND deleted_at IS NULL),
            0.00),
        review_count = (
            SELECT COUNT(*)
            FROM activity_reviews
            WHERE activity_id = _activity_id AND deleted_at IS NULL)
    WHERE id = _activity_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_activity_rating_sync
AFTER INSERT OR UPDATE OR DELETE ON activity_reviews
FOR EACH ROW
EXECUTE FUNCTION fn_activity_rating_sync();
