-- Truncate all public tables (wipes data, keeps schema)
TRUNCATE TABLE
    profiles,
    incidents,
    comments,
    incident_votes,
    emergency_contacts,
    notifications
CASCADE;

-- Optionally, truncate auth.users (wipes all users)
TRUNCATE TABLE auth.users CASCADE;

INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, created_at, updated_at, phone, phone_confirmed_at,
    phone_change, phone_change_token, phone_change_sent_at,
    email_change_token_current, email_change_confirm_status,
    banned_until, reauthentication_token, reauthentication_sent_at
) VALUES
      ('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440000', 'authenticated', 'authenticated', 'sarah.peters@email.ca', extensions.crypt('testing', extensions.gen_salt('bf')), timezone('utc', now()), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "sarah_peters", "role": "student"}', NULL, timezone('utc', now()), timezone('utc', now()), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL),
      ('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440002', 'authenticated', 'authenticated', 'james.david@concordia.ca', extensions.crypt('testing', extensions.gen_salt('bf')), timezone('utc', now()), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "staff_jamesdavid", "role": "staff"}', NULL, timezone('utc', now()), timezone('utc', now()), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL),
      ('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440003', 'authenticated', 'authenticated', 'john.doe@email.ca', extensions.crypt('testing', extensions.gen_salt('bf')), timezone('utc', now()), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "john_doe", "role": "student"}', NULL, timezone('utc', now()), timezone('utc', now()), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL),
      ('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440004', 'authenticated', 'authenticated', 'liam.kennard@email.ca', extensions.crypt('testing', extensions.gen_salt('bf')), timezone('utc', now()), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "liam_kennard", "role": "student"}', NULL, timezone('utc', now()), timezone('utc', now()), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL),
      ('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440005', 'authenticated', 'authenticated', 'frank.garcia@email.ca', extensions.crypt('testing', extensions.gen_salt('bf')), timezone('utc', now()), NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "frank_garcia", "role": "student"}', NULL, timezone('utc', now()), timezone('utc', now()), NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL);

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'sarah.peters@email.ca', '{"sub": "550e8400-e29b-41d4-a716-446655440000", "email": "sarah.peters@email.ca", "email_verified": true}', 'email', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'james.david@concordia.ca', '{"sub": "550e8400-e29b-41d4-a716-446655440002", "email": "james.david@concordia.ca", "email_verified": true}', 'email', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'john.doe@email.ca', '{"sub": "550e8400-e29b-41d4-a716-446655440003", "email": "john.doe@email.ca", "email_verified": true}', 'email', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'liam.kennard@email.ca', '{"sub": "550e8400-e29b-41d4-a716-446655440004", "email": "liam.kennard@email.ca", "email_verified": true}', 'email', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'frank.garcia@email.ca', '{"sub": "550e8400-e29b-41d4-a716-446655440005", "email": "frank.garcia@email.ca", "email_verified": true}', 'email', timezone('utc', now()), timezone('utc', now()), timezone('utc', now()));

-- Insert or update profiles (handles trigger-created rows)
INSERT INTO profiles (id, role, username, location_consent, preferences_completed, dark_mode, accessibility_routing, distance_normal, distance_silent, notif_protest, notif_road, notif_construction, notif_vandalism, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'student', 'sarah_peters', true, true, false, false, 800, 1500, 'normal', 'muted', 'muted', 'muted', NOW() - INTERVAL '10 days'),
('550e8400-e29b-41d4-a716-446655440002', 'staff', 'staff_jamesdavid', true, true, false, false, 1000, 2000, 'normal', 'normal', 'normal', 'normal', NOW() - INTERVAL '10 days'),
('550e8400-e29b-41d4-a716-446655440003', 'student', 'john_doe', true, true, false, false, 500, 1000, 'normal', 'normal', 'normal', 'normal', NOW() - INTERVAL '10 days'),
('550e8400-e29b-41d4-a716-446655440004', 'student', 'liam_kennard', true, true, false, false, 500, 1000, 'normal', 'normal', 'normal', 'normal', NOW() - INTERVAL '10 days'),
('550e8400-e29b-41d4-a716-446655440005', 'student', 'frank_garcia', true, true, false, false, 500, 1000, 'normal', 'normal', 'normal', 'normal', NOW() - INTERVAL '10 days')
    ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
                            username = EXCLUDED.username,
                            location_consent = EXCLUDED.location_consent,
                            preferences_completed = EXCLUDED.preferences_completed,
                            dark_mode = EXCLUDED.dark_mode,
                            accessibility_routing = EXCLUDED.accessibility_routing,
                            distance_normal = EXCLUDED.distance_normal,
                            distance_silent = EXCLUDED.distance_silent,
                            notif_protest = EXCLUDED.notif_protest,
                            notif_road = EXCLUDED.notif_road,
                            notif_construction = EXCLUDED.notif_construction,
                            notif_vandalism = EXCLUDED.notif_vandalism,
                            created_at = EXCLUDED.created_at;
-- Insert incidents
INSERT INTO incidents (id, user_id, type, description, severity, latitude, longitude, upvotes, status, verification_status, created_at, verified) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'construction', 'Construction near Hall Building.', 'low', 45.4970, -73.5794, 10, 'resolved', 'verified_by_campus', NOW() - INTERVAL '7 days', TRUE),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'protest', 'Protest near Museum of Fine Arts.', 'medium', 45.4985, -73.5800, 15, 'resolved', 'verified_by_campus', NOW() - INTERVAL '5 days', TRUE),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'vandalism', 'Vandalism near campus.', 'medium', 45.4962, -73.5790, 7, 'active', 'verified_by_users', NOW() - INTERVAL '1 day', FALSE);

-- Insert comments on incidents (by staff and other students, not Chloe)
INSERT INTO comments (id, incident_id, user_id, content, created_at) VALUES
-- Comments on incident 1 (construction, by James)
('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'This is inconvenient for classes.', NOW() - INTERVAL '6 days'),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'When will it be done?', NOW() - INTERVAL '6 days'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Thanks for the update.', NOW() - INTERVAL '6 days'),
-- Comments on incident 2 (protest, by Chloe)
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'I saw this earlier.', NOW() - INTERVAL '4 days'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Stay safe everyone.', NOW() - INTERVAL '4 days'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'Hope it resolves soon.', NOW() - INTERVAL '4 days'),
-- Comments on incident 3 (vandalism, by John)
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'This is concerning.', NOW() - INTERVAL '18 hours'),
('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'Campus security should check.', NOW() - INTERVAL '18 hours');