-- =============================================================================
-- 020_seed_demo.sql — Demo user, trip, stops, and activities
-- =============================================================================

WITH user_row AS (
  INSERT INTO users (first_name, last_name, email, password_hash, phone_number)
  VALUES ('Demo', 'User', 'demo@traveloop.com', '$2b$12$xxvzNQbopVLf7c5zByB9y.RZAy3VqS6MfuDR9T6OxoTYGplGDhyJa', NULL)
  ON CONFLICT (email) DO UPDATE
    SET password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name
  RETURNING id
),
owner AS (
  SELECT id FROM user_row
  UNION
  SELECT id FROM users WHERE email = 'demo@traveloop.com' LIMIT 1
),
trip_row AS (
  INSERT INTO trips (owner_id, title, description, start_date, end_date, total_budget, currency, trip_status)
  SELECT (SELECT id FROM owner), 'europe trip 2026', 'Seeded itinerary for demo',
         DATE '2026-05-12', DATE '2026-05-16', 5997, 'GBP', 'planning'
  WHERE NOT EXISTS (
    SELECT 1 FROM trips WHERE owner_id = (SELECT id FROM owner) AND title = 'europe trip 2026'
  )
  RETURNING id
),
trip_pick AS (
  SELECT id FROM trip_row
  UNION
  SELECT id FROM trips WHERE owner_id = (SELECT id FROM owner) AND title = 'europe trip 2026'
  LIMIT 1
),
city_paris AS (
  SELECT id FROM cities WHERE name = 'Paris' LIMIT 1
),
city_tokyo AS (
  SELECT id FROM cities WHERE name = 'Tokyo' LIMIT 1
),
stop1 AS (
  INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, notes, budget, order_index)
  SELECT (SELECT id FROM trip_pick), (SELECT id FROM city_paris),
         DATE '2026-05-12', DATE '2026-05-14', 'Stay near city center', 2000, 0
  WHERE NOT EXISTS (
    SELECT 1 FROM trip_stops WHERE trip_id = (SELECT id FROM trip_pick) AND order_index = 0
  )
  RETURNING id
),
stop2 AS (
  INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, notes, budget, order_index)
  SELECT (SELECT id FROM trip_pick), (SELECT id FROM city_tokyo),
         DATE '2026-05-14', DATE '2026-05-16', 'Explore markets and temples', 2500, 1
  WHERE NOT EXISTS (
    SELECT 1 FROM trip_stops WHERE trip_id = (SELECT id FROM trip_pick) AND order_index = 1
  )
  RETURNING id
),
stop1_pick AS (
  SELECT id FROM stop1
  UNION
  SELECT id FROM trip_stops WHERE trip_id = (SELECT id FROM trip_pick) AND order_index = 0 LIMIT 1
),
stop2_pick AS (
  SELECT id FROM stop2
  UNION
  SELECT id FROM trip_stops WHERE trip_id = (SELECT id FROM trip_pick) AND order_index = 1 LIMIT 1
)
INSERT INTO trip_activities (stop_id, day_number, order_index, title, description, expense)
SELECT * FROM (
  VALUES
    ((SELECT id FROM stop1_pick), 1, 0, 'Eiffel Tower Visit', NULL, 30),
    ((SELECT id FROM stop1_pick), 1, 1, 'Louvre Museum', NULL, 20),
    ((SELECT id FROM stop1_pick), 2, 0, 'Seine River Walk', NULL, 0),
    ((SELECT id FROM stop2_pick), 1, 0, 'Shibuya Crossing', NULL, 0),
    ((SELECT id FROM stop2_pick), 1, 1, 'Tsukiji Outer Market', NULL, 25),
    ((SELECT id FROM stop2_pick), 2, 0, 'Temple Visit', NULL, 10)
) AS v(stop_id, day_number, order_index, title, description, expense)
WHERE NOT EXISTS (
  SELECT 1 FROM trip_activities ta
  WHERE ta.stop_id = v.stop_id
    AND ta.day_number = v.day_number
    AND ta.order_index = v.order_index
);
