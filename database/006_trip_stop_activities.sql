-- =============================================================================
-- TRAVELOOP — Trip Stop Activities (itinerary items)
-- =============================================================================

CREATE TABLE trip_stop_activities (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_stop_id    UUID            NOT NULL REFERENCES trip_stops(id) ON DELETE CASCADE,
    activity_id     UUID            NOT NULL REFERENCES activities(id) ON DELETE RESTRICT,
    scheduled_date  DATE,                                     -- day within the stop
    start_time      TIME,
    end_time        TIME,
    order_index     INTEGER         NOT NULL DEFAULT 0,
    custom_note     TEXT,
    is_booked       BOOLEAN         NOT NULL DEFAULT FALSE,
    booking_ref     VARCHAR(100),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    -- Prevent adding the same activity twice to the same stop on the same date
    CONSTRAINT uq_stop_activity_date UNIQUE (trip_stop_id, activity_id, scheduled_date),
    CONSTRAINT chk_tsa_times
        CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time)
);

-- Day-wise itinerary loading
CREATE INDEX idx_tsa_stop_date ON trip_stop_activities (trip_stop_id, scheduled_date, order_index);

-- Reverse lookup: how often is an activity used across trips
CREATE INDEX idx_tsa_activity ON trip_stop_activities (activity_id);

COMMENT ON TABLE trip_stop_activities IS 'Scheduled activities within a trip stop (itinerary line items)';
