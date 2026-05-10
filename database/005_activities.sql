-- =============================================================================
-- TRAVELOOP — Activities (city-level catalog)
-- =============================================================================

CREATE TYPE activity_category_enum AS ENUM (
    'sightseeing',
    'adventure',
    'food_and_drink',
    'nightlife',
    'shopping',
    'culture',
    'relaxation',
    'transport',
    'accommodation',
    'other'
);

CREATE TABLE activities (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id             UUID            NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name                VARCHAR(300)    NOT NULL,
    description         TEXT,
    category            activity_category_enum NOT NULL DEFAULT 'other',
    estimated_cost      NUMERIC(10,2),
    currency            CHAR(3)         NOT NULL DEFAULT 'USD',
    duration_minutes    INTEGER,
    rating              NUMERIC(3,2)    DEFAULT 0.00,          -- 0.00 – 5.00
    review_count        INTEGER         NOT NULL DEFAULT 0,
    image_gallery       JSONB           NOT NULL DEFAULT '[]'::jsonb,
    metadata            JSONB           NOT NULL DEFAULT '{}'::jsonb,
    address             TEXT,
    latitude            NUMERIC(9,6),
    longitude           NUMERIC(9,6),
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_activities_rating
        CHECK (rating BETWEEN 0.00 AND 5.00),
    CONSTRAINT chk_activities_cost
        CHECK (estimated_cost IS NULL OR estimated_cost >= 0),
    CONSTRAINT chk_activities_duration
        CHECK (duration_minutes IS NULL OR duration_minutes > 0)
);

-- Activities for a given city
CREATE INDEX idx_activities_city ON activities (city_id) WHERE is_active = TRUE;

-- Category filter
CREATE INDEX idx_activities_category ON activities (category) WHERE is_active = TRUE;

-- Rating sort (top-rated feed)
CREATE INDEX idx_activities_rating ON activities (rating DESC, review_count DESC) WHERE is_active = TRUE;

-- Name search
CREATE INDEX idx_activities_name_trgm ON activities USING gin (name gin_trgm_ops);

-- JSONB metadata
CREATE INDEX idx_activities_metadata ON activities USING gin (metadata);

COMMENT ON TABLE activities IS 'Catalog of bookable/visitable activities per city';
COMMENT ON COLUMN activities.image_gallery IS 'JSON array of image URL strings';
COMMENT ON COLUMN activities.metadata IS 'Flexible key-value pairs: opening_hours, booking_url, etc.';
