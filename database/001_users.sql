-- =============================================================================
-- TRAVELOOP — Users
-- =============================================================================

CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    password_hash   TEXT            NOT NULL,
    phone_number    VARCHAR(20),
    profile_photo_url TEXT,
    city            VARCHAR(100),
    country         VARCHAR(100),
    language_preference VARCHAR(10) NOT NULL DEFAULT 'en',
    is_admin        BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    deleted_at      TIMESTAMPTZ,                              -- soft delete
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_email_format
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Fast email lookups (login, uniqueness)
CREATE UNIQUE INDEX idx_users_email_lower ON users (LOWER(email));

-- Active-user listing / admin queries
CREATE INDEX idx_users_active ON users (is_active) WHERE is_active = TRUE AND deleted_at IS NULL;

-- Trigram index for name search
CREATE INDEX idx_users_name_trgm ON users USING gin (
    (first_name || ' ' || last_name) gin_trgm_ops
);

COMMENT ON TABLE users IS 'Registered platform users';
COMMENT ON COLUMN users.deleted_at IS 'Non-null value indicates a soft-deleted record';
