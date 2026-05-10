-- =============================================================================
-- TRAVELOOP — Saved / Wishlisted Destinations
-- =============================================================================

CREATE TABLE saved_destinations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_id         UUID            NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    notes           TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT uq_saved_dest UNIQUE (user_id, city_id)
);

CREATE INDEX idx_saved_dest_user ON saved_destinations (user_id, created_at DESC);
CREATE INDEX idx_saved_dest_city ON saved_destinations (city_id);

COMMENT ON TABLE saved_destinations IS 'User wishlist of cities they want to visit';
