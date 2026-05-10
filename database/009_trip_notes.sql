-- =============================================================================
-- TRAVELOOP — Trip Notes / Journal
-- =============================================================================

CREATE TABLE trip_notes (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id         UUID            NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    trip_stop_id    UUID            REFERENCES trip_stops(id) ON DELETE SET NULL,  -- NULL = trip-level note
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(300),
    content         TEXT            NOT NULL,                  -- supports Markdown
    content_format  VARCHAR(20)     NOT NULL DEFAULT 'markdown',
    is_pinned       BOOLEAN         NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,                              -- soft delete
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- Trip-level notes feed
CREATE INDEX idx_trip_notes_trip ON trip_notes (trip_id, created_at DESC) WHERE deleted_at IS NULL;

-- Stop-level notes
CREATE INDEX idx_trip_notes_stop ON trip_notes (trip_stop_id, created_at DESC)
    WHERE trip_stop_id IS NOT NULL AND deleted_at IS NULL;

-- Pinned notes quick access
CREATE INDEX idx_trip_notes_pinned ON trip_notes (trip_id)
    WHERE is_pinned = TRUE AND deleted_at IS NULL;

-- Full-text search on note content
CREATE INDEX idx_trip_notes_fts ON trip_notes USING gin (
    to_tsvector('english', COALESCE(title, '') || ' ' || content)
);

COMMENT ON TABLE trip_notes IS 'Markdown journal entries scoped to trip or trip stop';
