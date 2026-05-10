-- =============================================================================
-- TRAVELOOP — Notifications
-- =============================================================================

CREATE TYPE notification_type_enum AS ENUM (
    'trip_invite',
    'trip_update',
    'comment',
    'like',
    'reminder',
    'system',
    'expense_added',
    'itinerary_change'
);

CREATE TABLE notifications (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            notification_type_enum NOT NULL,
    title           VARCHAR(300)    NOT NULL,
    body            TEXT,
    data            JSONB           NOT NULL DEFAULT '{}'::jsonb,  -- action payload
    is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_notif_read_at
        CHECK (read_at IS NULL OR is_read = TRUE)
);

-- User's unread notifications (hot path)
CREATE INDEX idx_notif_user_unread ON notifications (user_id, created_at DESC)
    WHERE is_read = FALSE;

-- User's full notification history
CREATE INDEX idx_notif_user ON notifications (user_id, created_at DESC);

-- Type filter
CREATE INDEX idx_notif_type ON notifications (user_id, type);

-- JSONB payload
CREATE INDEX idx_notif_data ON notifications USING gin (data);

COMMENT ON TABLE notifications IS 'In-app notification feed per user';
COMMENT ON COLUMN notifications.data IS 'Action payload: {trip_id, post_id, actor_id, ...}';
