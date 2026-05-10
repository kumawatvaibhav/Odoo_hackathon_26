-- =============================================================================
-- TRAVELOOP — Community Posts & Engagement
-- =============================================================================

CREATE TABLE community_posts (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id         UUID            NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    author_id       UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(400)    NOT NULL,
    body            TEXT,
    share_slug      VARCHAR(150),
    cover_image_url TEXT,
    like_count      INTEGER         NOT NULL DEFAULT 0,
    comment_count   INTEGER         NOT NULL DEFAULT 0,
    view_count      INTEGER         NOT NULL DEFAULT 0,
    is_featured     BOOLEAN         NOT NULL DEFAULT FALSE,
    is_published    BOOLEAN         NOT NULL DEFAULT TRUE,
    deleted_at      TIMESTAMPTZ,
    published_at    TIMESTAMPTZ     DEFAULT now(),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_cp_like_count   CHECK (like_count >= 0),
    CONSTRAINT chk_cp_comment_count CHECK (comment_count >= 0),
    CONSTRAINT chk_cp_view_count   CHECK (view_count >= 0),
    CONSTRAINT uq_community_slug   UNIQUE (share_slug)
);

-- Public feed ranked by engagement
CREATE INDEX idx_cp_public_feed ON community_posts (published_at DESC)
    WHERE is_published = TRUE AND deleted_at IS NULL;

-- Featured posts
CREATE INDEX idx_cp_featured ON community_posts (published_at DESC)
    WHERE is_featured = TRUE AND is_published = TRUE AND deleted_at IS NULL;

-- Author's posts
CREATE INDEX idx_cp_author ON community_posts (author_id, published_at DESC) WHERE deleted_at IS NULL;

-- Slug lookup
CREATE UNIQUE INDEX idx_cp_slug ON community_posts (share_slug) WHERE share_slug IS NOT NULL;

-- Engagement ranking composite
CREATE INDEX idx_cp_engagement ON community_posts (like_count DESC, view_count DESC)
    WHERE is_published = TRUE AND deleted_at IS NULL;

-- ------- Community Likes (prevents double-like) -------

CREATE TABLE community_likes (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID            NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT uq_community_like UNIQUE (post_id, user_id)
);

CREATE INDEX idx_cl_post ON community_likes (post_id);
CREATE INDEX idx_cl_user ON community_likes (user_id);

-- ------- Community Comments -------

CREATE TABLE community_comments (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID            NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id       UUID            REFERENCES community_comments(id) ON DELETE CASCADE,  -- threaded replies
    body            TEXT            NOT NULL,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_cc_post ON community_comments (post_id, created_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_cc_parent ON community_comments (parent_id) WHERE parent_id IS NOT NULL;

COMMENT ON TABLE community_posts IS 'Publicly shared trip itineraries with engagement metrics';
COMMENT ON TABLE community_likes IS 'Like junction — one like per user per post';
COMMENT ON TABLE community_comments IS 'Threaded comments on community posts';
