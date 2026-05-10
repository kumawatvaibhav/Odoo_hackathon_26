-- =============================================================================
-- TRAVELOOP — Trips
-- =============================================================================

-- Enum for trip lifecycle
CREATE TYPE trip_status_enum AS ENUM (
    'draft',
    'planning',
    'ongoing',
    'completed',
    'cancelled'
);

-- Enum for visibility granularity
CREATE TYPE trip_visibility_enum AS ENUM (
    'private',        -- only owner + collaborators
    'unlisted',       -- accessible via direct link
    'public'          -- appears in discovery feed
);

CREATE TABLE trips (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(300)    NOT NULL,
    description     TEXT,
    start_date      DATE,
    end_date        DATE,
    cover_image_url TEXT,
    total_budget    NUMERIC(12,2),
    currency        CHAR(3)         NOT NULL DEFAULT 'USD',  -- ISO 4217
    trip_status     trip_status_enum NOT NULL DEFAULT 'draft',
    visibility      trip_visibility_enum NOT NULL DEFAULT 'private',
    is_public       BOOLEAN         NOT NULL DEFAULT FALSE,
    share_slug      VARCHAR(100),                            -- human-readable URL slug
    deleted_at      TIMESTAMPTZ,                              -- soft delete
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_trips_dates
        CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
    CONSTRAINT chk_trips_budget_positive
        CHECK (total_budget IS NULL OR total_budget >= 0),
    CONSTRAINT uq_trips_share_slug UNIQUE (share_slug)
);

-- Owner's trip list
CREATE INDEX idx_trips_owner ON trips (owner_id, created_at DESC) WHERE deleted_at IS NULL;

-- Public feed
CREATE INDEX idx_trips_public_feed ON trips (created_at DESC)
    WHERE is_public = TRUE AND deleted_at IS NULL AND trip_status IN ('ongoing', 'completed');

-- Status filter
CREATE INDEX idx_trips_status ON trips (trip_status) WHERE deleted_at IS NULL;

-- Share slug lookup
CREATE UNIQUE INDEX idx_trips_slug ON trips (share_slug) WHERE share_slug IS NOT NULL;

COMMENT ON TABLE trips IS 'User-created travel plans';
COMMENT ON COLUMN trips.share_slug IS 'URL-safe unique slug for public sharing';
