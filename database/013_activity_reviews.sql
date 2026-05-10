-- =============================================================================
-- TRAVELOOP — Activity Reviews
-- =============================================================================

CREATE TABLE activity_reviews (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id     UUID            NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trip_id         UUID            REFERENCES trips(id) ON DELETE SET NULL,
    rating          NUMERIC(3,2)    NOT NULL,
    title           VARCHAR(300),
    body            TEXT,
    photos          JSONB           NOT NULL DEFAULT '[]'::jsonb,
    is_verified     BOOLEAN         NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_ar_rating CHECK (rating BETWEEN 1.00 AND 5.00),
    CONSTRAINT uq_ar_user_activity UNIQUE (activity_id, user_id)
);

-- Activity review listing
CREATE INDEX idx_ar_activity ON activity_reviews (activity_id, created_at DESC) WHERE deleted_at IS NULL;

-- User's review history
CREATE INDEX idx_ar_user ON activity_reviews (user_id, created_at DESC) WHERE deleted_at IS NULL;

-- Rating aggregation
CREATE INDEX idx_ar_rating ON activity_reviews (activity_id, rating) WHERE deleted_at IS NULL;

COMMENT ON TABLE activity_reviews IS 'User reviews and ratings for activities (one per user per activity)';
