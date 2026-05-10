-- =============================================================================
-- TRAVELOOP — PostgreSQL Extensions
-- =============================================================================
-- Required extensions for UUID generation, full-text/trigram search, and
-- cryptographic functions. Must be executed by a superuser or a role with
-- CREATE privilege on the target database.
-- =============================================================================

-- UUID v4 generation via gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Trigram-based fuzzy text search (ILIKE, similarity(), %)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Unaccented text search (optional but recommended for international city names)
CREATE EXTENSION IF NOT EXISTS unaccent;
