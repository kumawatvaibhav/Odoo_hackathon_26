-- =============================================================================
-- TRAVELOOP — Trip Stops (multi-city itinerary legs)
-- =============================================================================

CREATE TABLE trip_stops (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id         UUID            NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    city_id         UUID            NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    arrival_date    DATE,
    departure_date  DATE,
    budget          NUMERIC(12,2),
    order_index     INTEGER         NOT NULL DEFAULT 0,       -- drag-and-drop ordering
    notes           TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_trip_stops_dates
        CHECK (departure_date IS NULL OR arrival_date IS NULL OR departure_date >= arrival_date),
    CONSTRAINT chk_trip_stops_budget_positive
        CHECK (budget IS NULL OR budget >= 0),
    -- Prevent duplicate ordering within the same trip
    CONSTRAINT uq_trip_stops_order UNIQUE (trip_id, order_index)
);

-- Load all stops for a trip, ordered
CREATE INDEX idx_trip_stops_trip_order ON trip_stops (trip_id, order_index);

-- Reverse lookup: which trips visit a city
CREATE INDEX idx_trip_stops_city ON trip_stops (city_id);

COMMENT ON TABLE trip_stops IS 'Ordered city legs within a trip';
COMMENT ON COLUMN trip_stops.order_index IS 'Zero-based ordering for drag-and-drop reordering';
