-- =============================================================================
-- TRAVELOOP — Cities (Reference / Discovery)
-- =============================================================================

CREATE TABLE cities (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200)    NOT NULL,
    country         VARCHAR(100)    NOT NULL,
    country_code    CHAR(2)         NOT NULL,               -- ISO 3166-1 alpha-2
    region          VARCHAR(150),                            -- state / province
    latitude        NUMERIC(9,6)    NOT NULL,
    longitude       NUMERIC(9,6)    NOT NULL,
    popularity_score NUMERIC(5,2)   NOT NULL DEFAULT 0.00,  -- 0-100 scale
    cost_index      NUMERIC(5,2),                           -- relative cost 0-100
    tags            JSONB           NOT NULL DEFAULT '[]'::jsonb,
    images          JSONB           NOT NULL DEFAULT '[]'::jsonb,
    description     TEXT,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_cities_country_code_len
        CHECK (LENGTH(country_code) = 2),
    CONSTRAINT chk_cities_latitude
        CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT chk_cities_longitude
        CHECK (longitude BETWEEN -180 AND 180),
    CONSTRAINT chk_cities_popularity
        CHECK (popularity_score BETWEEN 0 AND 100)
);

-- Prevent duplicate city+country combos
CREATE UNIQUE INDEX idx_cities_name_country ON cities (LOWER(name), LOWER(country));

-- Discovery feed sorted by popularity
CREATE INDEX idx_cities_popularity ON cities (popularity_score DESC) WHERE is_active = TRUE;

-- Country filter
CREATE INDEX idx_cities_country_code ON cities (country_code);

-- Trigram search on city name
CREATE INDEX idx_cities_name_trgm ON cities USING gin (name gin_trgm_ops);

-- GIN index on JSONB tags for tag-based filtering
CREATE INDEX idx_cities_tags ON cities USING gin (tags);

COMMENT ON TABLE cities IS 'Reference catalog of travel destinations';
COMMENT ON COLUMN cities.tags IS 'Array of string tags, e.g. ["beach","historic","nightlife"]';
COMMENT ON COLUMN cities.images IS 'Array of image URL strings';
