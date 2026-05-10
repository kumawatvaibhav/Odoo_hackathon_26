-- =============================================================================
-- TRAVELOOP — Master Migration Runner
-- =============================================================================
-- Execute this file to build the entire schema from scratch.
-- Usage:  psql -U <user> -d traveloop -f migrate.sql
-- =============================================================================

\echo '=== Traveloop Database Migration ==='
\echo ''

\echo '[1/18] Installing extensions...'
\i 000_extensions.sql

\echo '[2/18] Creating users table...'
\i 001_users.sql

\echo '[3/18] Creating cities table...'
\i 002_cities.sql

\echo '[4/18] Creating trips table...'
\i 003_trips.sql

\echo '[5/18] Creating trip_stops table...'
\i 004_trip_stops.sql

\echo '[6/18] Creating activities table...'
\i 005_activities.sql

\echo '[7/18] Creating trip_stop_activities table...'
\i 006_trip_stop_activities.sql

\echo '[8/18] Creating expenses table...'
\i 007_expenses.sql

\echo '[9/18] Creating packing system...'
\i 008_packing_items.sql

\echo '[10/18] Creating trip_notes table...'
\i 009_trip_notes.sql

\echo '[11/18] Creating community system...'
\i 010_community.sql

\echo '[12/18] Creating saved_destinations table...'
\i 011_saved_destinations.sql

\echo '[13/18] Creating trip_collaborators table...'
\i 012_trip_collaborators.sql

\echo '[14/18] Creating activity_reviews table...'
\i 013_activity_reviews.sql

\echo '[15/18] Creating trip_media table...'
\i 014_trip_media.sql

\echo '[16/18] Creating notifications table...'
\i 015_notifications.sql

\echo '[17/18] Installing triggers...'
\i 016_triggers.sql

\echo '[18/18] Creating views...'
\i 017_views.sql

\echo ''
\echo '=== Migration complete ==='
\echo 'Run 018_seed_data.sql separately for development data.'
