-- =============================================================================
-- TRAVELOOP — Trip Media (photos, videos, documents)
-- =============================================================================

CREATE TYPE media_type_enum AS ENUM (
    'photo',
    'video',
    'document'
);

CREATE TABLE trip_media (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id         UUID            NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    trip_stop_id    UUID            REFERENCES trip_stops(id) ON DELETE SET NULL,
    uploaded_by     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_type      media_type_enum NOT NULL DEFAULT 'photo',
    file_url        TEXT            NOT NULL,
    thumbnail_url   TEXT,
    caption         TEXT,
    file_size_bytes BIGINT,
    mime_type       VARCHAR(100),
    metadata        JSONB           NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_tm_file_size CHECK (file_size_bytes IS NULL OR file_size_bytes > 0)
);

-- Trip gallery
CREATE INDEX idx_tm_trip ON trip_media (trip_id, created_at DESC);

-- Stop-level media
CREATE INDEX idx_tm_stop ON trip_media (trip_stop_id, created_at DESC)
    WHERE trip_stop_id IS NOT NULL;

-- User uploads
CREATE INDEX idx_tm_uploader ON trip_media (uploaded_by, created_at DESC);

-- Media type filter
CREATE INDEX idx_tm_type ON trip_media (trip_id, media_type);

COMMENT ON TABLE trip_media IS 'User-uploaded media files attached to trips or stops';
COMMENT ON COLUMN trip_media.metadata IS 'EXIF data, dimensions, GPS coords, etc.';
