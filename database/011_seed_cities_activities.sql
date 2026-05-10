-- =============================================================================
-- TRAVELOOP — Seed: Cities & Activities
-- Run AFTER schema migrations (002_cities.sql, 005_activities.sql)
-- Uses ON CONFLICT to avoid duplicates on re-run
-- =============================================================================

-- ─── Cities ─────────────────────────────────────────────────────────
INSERT INTO cities (name, country, country_code, latitude, longitude, popularity_score, description)
VALUES
  ('Varanasi',  'India',    'IN', 25.3176,  83.0068,  85, 'Spiritual heart of India on the banks of the Ganges'),
  ('Jaipur',    'India',    'IN', 26.9124,  75.7873,  90, 'The Pink City — royal palaces and vibrant bazaars'),
  ('Srinagar',  'India',    'IN', 34.0837,  74.7973,  80, 'Houseboats on Dal Lake surrounded by the Himalayas'),
  ('Lisbon',    'Portugal', 'PT', 38.7223,  -9.1393,  92, 'Sun-drenched hills, trams, and world-class pastéis'),
  ('Kyoto',     'Japan',    'JP', 35.0116, 135.7681,  95, 'Temples, bamboo groves, and timeless tea ceremonies'),
  ('Marrakesh', 'Morocco',  'MA', 31.6295,  -7.9811,  88, 'A sensory feast of souks, riads, and rooftop sunsets'),
  ('Hanoi',     'Vietnam',  'VN', 21.0285, 105.8542,  82, 'Old Quarter charm with the best street food in Asia'),
  ('Reykjavik', 'Iceland',  'IS', 64.1466, -21.9426,  78, 'Gateway to glaciers, geysers, and the Northern Lights')
ON CONFLICT (LOWER(name), LOWER(country)) DO UPDATE SET
  popularity_score = EXCLUDED.popularity_score,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ─── Activities ─────────────────────────────────────────────────────
-- Each activity is linked to its city via a sub-select

INSERT INTO activities (city_id, name, description, category, estimated_cost, currency, duration_minutes, rating)
VALUES
  ((SELECT id FROM cities WHERE LOWER(name)='varanasi'  LIMIT 1), 'Sunrise Varanasi Ghats Cruise',  'Float past the riverfront temples with a local guide and a chai tasting on board.',  'sightseeing',   1450, 'INR', 150, 4.80),
  ((SELECT id FROM cities WHERE LOWER(name)='jaipur'    LIMIT 1), 'Jaipur Heritage Bazaar Walk',    'Textiles, gemstone ateliers, and a curated route through the Pink City alleys.',    'culture',       1200, 'INR', 180, 4.70),
  ((SELECT id FROM cities WHERE LOWER(name)='srinagar'  LIMIT 1), 'Srinagar Houseboat Atelier',     'Meet artisan families crafting walnut woodwork with a lakeside lunch.',              'culture',       2600, 'INR', 240, 4.90),
  ((SELECT id FROM cities WHERE LOWER(name)='lisbon'    LIMIT 1), 'Lisbon Miradouros Circuit',      'Golden-hour viewpoints with a local photographer and tram ride tickets.',           'sightseeing',     38, 'EUR', 195, 4.60),
  ((SELECT id FROM cities WHERE LOWER(name)='kyoto'     LIMIT 1), 'Kyoto Lanterns & Tea',           'A gentle dusk walk through Gion paired with a seasonal tea ceremony.',             'culture',       5400, 'JPY', 120, 4.90),
  ((SELECT id FROM cities WHERE LOWER(name)='marrakesh' LIMIT 1), 'Marrakesh Rooftop Tasting',      'Mint tea rituals and panoramic medina views with a chef host.',                    'food_and_drink',  420, 'MAD', 165, 4.70)
ON CONFLICT DO NOTHING;
