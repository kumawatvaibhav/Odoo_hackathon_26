-- =============================================================================
-- TRAVELOOP — Packing Checklist
-- =============================================================================

-- Reusable packing templates (system-wide or user-created)
CREATE TABLE packing_templates (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        UUID            REFERENCES users(id) ON DELETE CASCADE,   -- NULL = system template
    name            VARCHAR(200)    NOT NULL,
    description     TEXT,
    items           JSONB           NOT NULL DEFAULT '[]'::jsonb,             -- template items snapshot
    is_system       BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_packing_templates_owner ON packing_templates (owner_id) WHERE owner_id IS NOT NULL;
CREATE INDEX idx_packing_templates_system ON packing_templates (is_system) WHERE is_system = TRUE;

-- Per-trip packing items
CREATE TABLE packing_items (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id         UUID            NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(200)    NOT NULL,
    category        VARCHAR(100),                             -- clothing, toiletries, electronics, etc.
    quantity        INTEGER         NOT NULL DEFAULT 1,
    is_packed       BOOLEAN         NOT NULL DEFAULT FALSE,
    template_id     UUID            REFERENCES packing_templates(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_packing_quantity CHECK (quantity > 0)
);

-- Trip checklist loading
CREATE INDEX idx_packing_items_trip ON packing_items (trip_id, category, is_packed);

-- User's items across trips
CREATE INDEX idx_packing_items_user ON packing_items (user_id);

COMMENT ON TABLE packing_templates IS 'Reusable packing list templates (system or user-owned)';
COMMENT ON TABLE packing_items IS 'Trip-specific packing checklist items';
