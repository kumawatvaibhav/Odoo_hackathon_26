-- =============================================================================
-- TRAVELOOP — Seed Data (Development / Demo)
-- =============================================================================
-- Run this ONLY in development environments. Never in production.
-- =============================================================================

-- -----------------------------------------------------------------------
-- Sample Cities
-- -----------------------------------------------------------------------
INSERT INTO cities (name, country, country_code, region, latitude, longitude, popularity_score, cost_index, tags, images, description)
VALUES
    ('Paris',       'France',       'FR', 'Ile-de-France',  48.856614,   2.352222,  95.00, 78.00,
     '["romantic","historic","art","food"]'::jsonb,
     '["https://images.unsplash.com/photo-1502602898657-3e91760cbb34"]'::jsonb,
     'The City of Light - world-renowned for its cuisine, art, and architecture.'),

    ('Tokyo',       'Japan',        'JP', 'Kanto',          35.689487, 139.691711,  92.00, 72.00,
     '["culture","food","technology","nightlife"]'::jsonb,
     '["https://images.unsplash.com/photo-1540959733332-eab4deabeeaf"]'::jsonb,
     'A vibrant metropolis blending ultramodern and traditional.'),

    ('New York',    'United States','US', 'New York',        40.712776, -74.005974,  94.00, 85.00,
     '["urban","food","nightlife","shopping","art"]'::jsonb,
     '["https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9"]'::jsonb,
     'The city that never sleeps - iconic skyline, Broadway, and world-class dining.'),

    ('Bali',        'Indonesia',    'ID', 'Bali',            -8.340539, 115.091949,  88.00, 35.00,
     '["beach","relaxation","culture","adventure","nature"]'::jsonb,
     '["https://images.unsplash.com/photo-1537996194471-e657df975ab4"]'::jsonb,
     'Tropical paradise with stunning temples, rice terraces, and surf breaks.'),

    ('Barcelona',   'Spain',        'ES', 'Catalonia',       41.385064,   2.173404,  87.00, 55.00,
     '["beach","architecture","food","nightlife","art"]'::jsonb,
     '["https://images.unsplash.com/photo-1583422409516-2895a77efded"]'::jsonb,
     'Gaudi masterpieces, Mediterranean beaches, and legendary tapas.'),

    ('Dubai',       'UAE',          'AE', 'Dubai',           25.204849,  55.270782,  85.00, 70.00,
     '["luxury","shopping","architecture","desert","nightlife"]'::jsonb,
     '["https://images.unsplash.com/photo-1512453979798-5ea266f8880c"]'::jsonb,
     'Futuristic skyline, luxury shopping, and desert adventures.'),

    ('Cape Town',   'South Africa', 'ZA', 'Western Cape',   -33.924870,  18.424055,  80.00, 40.00,
     '["nature","adventure","wine","beach","historic"]'::jsonb,
     '["https://images.unsplash.com/photo-1580060839134-75a5edca2e99"]'::jsonb,
     'Where mountains meet the ocean - Table Mountain, vineyards, and vibrant culture.'),

    ('Kyoto',       'Japan',        'JP', 'Kansai',          35.011636, 135.768029,  82.00, 60.00,
     '["historic","culture","temples","nature","food"]'::jsonb,
     '["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e"]'::jsonb,
     'Ancient capital with thousands of temples, shrines, and traditional gardens.'),

    ('Lisbon',      'Portugal',     'PT', 'Lisboa',          38.722252,  -9.139337,  79.00, 42.00,
     '["historic","food","nightlife","beach","art"]'::jsonb,
     '["https://images.unsplash.com/photo-1585208798174-6cedd86e019a"]'::jsonb,
     'Pastel-colored hills, historic trams, and the best pasteis de nata in the world.'),

    ('Bangkok',     'Thailand',     'TH', 'Bangkok',         13.756331, 100.501762,  86.00, 30.00,
     '["food","culture","nightlife","shopping","temples"]'::jsonb,
     '["https://images.unsplash.com/photo-1508009603885-50cf7c579365"]'::jsonb,
     'Street food capital with golden temples, floating markets, and electric nightlife.');

-- -----------------------------------------------------------------------
-- Sample Activities (linked to seeded cities)
-- -----------------------------------------------------------------------
INSERT INTO activities (city_id, name, description, category, estimated_cost, currency, duration_minutes, rating, address)
SELECT c.id, a.name, a.description, a.category::activity_category_enum, a.cost, 'USD', a.duration, a.rating, a.address
FROM cities c
CROSS JOIN LATERAL (
    VALUES
        ('Paris',    'Eiffel Tower Visit',       'Iconic iron lattice tower with panoramic views.',       'sightseeing',  30.00, 120, 4.70, 'Champ de Mars, 5 Av. Anatole France'),
        ('Paris',    'Louvre Museum',             'World''s largest art museum and home to the Mona Lisa.','culture',      20.00, 180, 4.80, 'Rue de Rivoli, 75001'),
        ('Tokyo',    'Shibuya Crossing',          'The world''s busiest pedestrian intersection.',         'sightseeing',   0.00,  30, 4.50, 'Shibuya, Tokyo'),
        ('Tokyo',    'Tsukiji Outer Market',      'Fresh sushi and street food paradise.',                 'food_and_drink', 25.00, 90, 4.60, 'Tsukiji, Chuo City'),
        ('Bali',     'Tegallalang Rice Terraces', 'Stunning UNESCO-listed rice paddies.',                  'sightseeing',  10.00, 120, 4.50, 'Tegallalang, Gianyar'),
        ('Bali',     'Uluwatu Temple Sunset',     'Cliffside temple with traditional Kecak dance at sunset.','culture',    5.00,  150, 4.70, 'Pecatu, South Kuta'),
        ('Barcelona','La Sagrada Familia',        'Gaudi''s unfinished masterpiece basilica.',             'sightseeing',  26.00, 120, 4.90, 'C/ de Mallorca, 401'),
        ('Barcelona','La Boqueria Market',        'Vibrant food market on La Rambla.',                     'food_and_drink', 15.00, 60, 4.40, 'La Rambla, 91')
) AS a(city_name, name, description, category, cost, duration, rating, address)
WHERE c.name = a.city_name;

-- -----------------------------------------------------------------------
-- Sample Packing Templates (system-level)
-- -----------------------------------------------------------------------
INSERT INTO packing_templates (name, description, is_system, items)
VALUES
    ('Beach Vacation', 'Essential items for a tropical beach trip', TRUE,
     '[{"name":"Sunscreen SPF 50","category":"toiletries","quantity":1},
       {"name":"Swimsuit","category":"clothing","quantity":2},
       {"name":"Beach towel","category":"accessories","quantity":1},
       {"name":"Flip flops","category":"footwear","quantity":1},
       {"name":"Sunglasses","category":"accessories","quantity":1},
       {"name":"Waterproof phone pouch","category":"electronics","quantity":1}]'::jsonb),

    ('City Explorer', 'Pack light for an urban adventure', TRUE,
     '[{"name":"Comfortable walking shoes","category":"footwear","quantity":1},
       {"name":"Day backpack","category":"accessories","quantity":1},
       {"name":"Portable charger","category":"electronics","quantity":1},
       {"name":"Rain jacket","category":"clothing","quantity":1},
       {"name":"Travel adapter","category":"electronics","quantity":1},
       {"name":"Reusable water bottle","category":"accessories","quantity":1}]'::jsonb),

    ('Business Travel', 'Professional travel essentials', TRUE,
     '[{"name":"Laptop","category":"electronics","quantity":1},
       {"name":"Charger + cables","category":"electronics","quantity":1},
       {"name":"Formal shirt","category":"clothing","quantity":2},
       {"name":"Dress shoes","category":"footwear","quantity":1},
       {"name":"Business cards","category":"documents","quantity":1},
       {"name":"Toiletry kit","category":"toiletries","quantity":1}]'::jsonb);

-- =============================================================================
-- End of seed data
-- =============================================================================
