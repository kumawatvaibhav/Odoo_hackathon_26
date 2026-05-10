-- =============================================================================
-- TRAVELOOP — Trip Collaborators
-- =============================================================================

CREATE TYPE collaborator_role_enum AS ENUM (
    'viewer',
    'editor',
    'admin'
);

CREATE TABLE trip_collaborators (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id         UUID            NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            collaborator_role_enum NOT NULL DEFAULT 'viewer',
    invited_by      UUID            REFERENCES users(id) ON DELETE SET NULL,
    accepted_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT uq_trip_collaborator UNIQUE (trip_id, user_id)
);

-- Trip's collaborator list
CREATE INDEX idx_tc_trip ON trip_collaborators (trip_id);

-- User's shared trips
CREATE INDEX idx_tc_user ON trip_collaborators (user_id);

COMMENT ON TABLE trip_collaborators IS 'Users invited to collaborate on a trip with role-based access';
