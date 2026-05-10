-- =============================================================================
-- 019_trip_activities.sql — Day-by-day activities within a trip stop
-- =============================================================================

CREATE TABLE IF NOT EXISTS trip_activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id       UUID NOT NULL REFERENCES trip_stops(id) ON DELETE CASCADE,
  day_number    INT  NOT NULL DEFAULT 1,
  order_index   INT  NOT NULL DEFAULT 0,
  title         TEXT NOT NULL DEFAULT '',
  description   TEXT,
  expense       NUMERIC(12,2) DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trip_activities_stop ON trip_activities(stop_id);
CREATE INDEX IF NOT EXISTS idx_trip_activities_day  ON trip_activities(stop_id, day_number, order_index);
