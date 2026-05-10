-- =============================================================================
-- TRAVELOOP — Expenses
-- =============================================================================

CREATE TYPE expense_category_enum AS ENUM (
    'transport',
    'stay',
    'food',
    'activity',
    'shopping',
    'insurance',
    'visa',
    'misc'
);

CREATE TABLE expenses (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id         UUID            NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    trip_stop_id    UUID            REFERENCES trip_stops(id) ON DELETE SET NULL,
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category        expense_category_enum NOT NULL DEFAULT 'misc',
    title           VARCHAR(300)    NOT NULL,
    description     TEXT,
    amount          NUMERIC(12,2)   NOT NULL,
    quantity        INTEGER         NOT NULL DEFAULT 1,
    currency        CHAR(3)         NOT NULL DEFAULT 'USD',
    expense_date    DATE            NOT NULL DEFAULT CURRENT_DATE,
    receipt_url     TEXT,
    is_paid         BOOLEAN         NOT NULL DEFAULT TRUE,
    deleted_at      TIMESTAMPTZ,                              -- soft delete
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_expenses_amount
        CHECK (amount >= 0),
    CONSTRAINT chk_expenses_quantity
        CHECK (quantity > 0)
);

-- Trip-level expense aggregation
CREATE INDEX idx_expenses_trip ON expenses (trip_id, expense_date) WHERE deleted_at IS NULL;

-- Category breakdown per trip
CREATE INDEX idx_expenses_trip_cat ON expenses (trip_id, category) WHERE deleted_at IS NULL;

-- User-level spending history
CREATE INDEX idx_expenses_user ON expenses (user_id, expense_date DESC) WHERE deleted_at IS NULL;

-- Stop-level rollup
CREATE INDEX idx_expenses_stop ON expenses (trip_stop_id) WHERE trip_stop_id IS NOT NULL AND deleted_at IS NULL;

COMMENT ON TABLE expenses IS 'Per-trip expense tracking with optional stop-level granularity';
