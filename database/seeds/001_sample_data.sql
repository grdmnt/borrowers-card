-- Borrower's Card Database Schema
-- Seed Data 001: Sample Data for Testing
-- Run this AFTER running the migration files
-- NOTE: This is for testing only - remove in production

-- =============================================
-- SAMPLE USER DATA
-- =============================================
-- Note: In production, users are created automatically via Supabase Auth
-- This is just for testing database structure

-- Insert sample users (replace with actual auth.users IDs in production)
-- You'll need to replace these UUIDs with real ones from your auth.users table
INSERT INTO public.users (id, email, name, bio, location, public_profile) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'alice@example.com', 'Alice Johnson', 'Book lover and tool sharer', 'San Francisco, CA', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'bob@example.com', 'Bob Smith', 'DIY enthusiast', 'Oakland, CA', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'carol@example.com', 'Carol Davis', 'Kitchen gadget collector', 'Berkeley, CA', false),
  ('550e8400-e29b-41d4-a716-446655440004', 'david@example.com', 'David Wilson', 'Tech gear sharer', 'San Jose, CA', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SAMPLE GROUPS DATA
-- =============================================

INSERT INTO public.groups (id, name, description, is_public, created_by) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Bay Area Book Club', 'Share books and literary discussions', true, '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Neighborhood Tool Library', 'Share tools and equipment for home projects', true, '550e8400-e29b-41d4-a716-446655440002'),
  ('650e8400-e29b-41d4-a716-446655440003', 'Tech Enthusiasts', 'Share gadgets and electronics', false, '550e8400-e29b-41d4-a716-446655440004'),
  ('650e8400-e29b-41d4-a716-446655440004', 'Cooking Circle', 'Share kitchen tools and appliances', true, '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SAMPLE GROUP MEMBERSHIPS
-- =============================================

INSERT INTO public.group_members (group_id, user_id, role) VALUES
  -- Bay Area Book Club
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'admin'),
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'member'),
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'member'),
  
  -- Neighborhood Tool Library
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'admin'),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'member'),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'member'),
  
  -- Tech Enthusiasts
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'admin'),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'member'),
  
  -- Cooking Circle
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'admin'),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'member'),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'member')
ON CONFLICT (group_id, user_id) DO NOTHING;

-- =============================================
-- SAMPLE BORROWED ITEMS
-- =============================================

INSERT INTO public.borrowed_items (
  name, description, category, condition, borrowed_from_name, borrowed_from_email,
  borrowed_date, due_date, status, user_id, group_id, notes
) VALUES
  (
    'The Great Gatsby', 
    'Classic American novel by F. Scott Fitzgerald', 
    'book', 
    'good',
    'Alice Johnson',
    'alice@example.com',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '10 days',
    'active',
    '550e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440001',
    'First edition, handle with care'
  ),
  (
    'Cordless Drill',
    'DeWalt 20V MAX cordless drill with battery',
    'tool',
    'excellent',
    'Bob Smith',
    'bob@example.com',
    CURRENT_DATE - INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '4 days',
    'active',
    '550e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440002',
    'Includes extra battery and drill bits'
  ),
  (
    'iPad Pro',
    '12.9-inch iPad Pro with Apple Pencil',
    'electronics',
    'excellent',
    'David Wilson',
    'david@example.com',
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE - INTERVAL '1 day',
    'overdue',
    '550e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440003',
    'For digital art project'
  ),
  (
    'Stand Mixer',
    'KitchenAid Artisan Series 5-Quart mixer',
    'kitchen',
    'good',
    'Carol Davis',
    'carol@example.com',
    CURRENT_DATE - INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '5 days',
    'active',
    '550e8400-e29b-41d4-a716-446655440004',
    '650e8400-e29b-41d4-a716-446655440004',
    'Making wedding cake'
  );

-- =============================================
-- SAMPLE LENT ITEMS
-- =============================================

INSERT INTO public.lent_items (
  name, description, category, condition, lent_to_name, lent_to_email,
  lent_date, due_date, status, user_id, group_id, notes
) VALUES
  (
    'To Kill a Mockingbird',
    'Harper Lee classic novel',
    'book',
    'good',
    'Bob Smith',
    'bob@example.com',
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE + INTERVAL '7 days',
    'active',
    '550e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440001',
    'Book club selection'
  ),
  (
    'Circular Saw',
    'Makita 7-1/4 inch circular saw',
    'tool',
    'excellent',
    'Alice Johnson',
    'alice@example.com',
    CURRENT_DATE - INTERVAL '4 days',
    CURRENT_DATE + INTERVAL '3 days',
    'active',
    '550e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440002',
    'Building deck project'
  ),
  (
    'Nintendo Switch',
    'Gaming console with extra controllers',
    'games',
    'excellent',
    'Carol Davis',
    'carol@example.com',
    CURRENT_DATE - INTERVAL '20 days',
    CURRENT_DATE - INTERVAL '5 days',
    'overdue',
    '550e8400-e29b-41d4-a716-446655440004',
    NULL,
    'Family game night'
  ),
  (
    'Food Processor',
    'Cuisinart 14-cup food processor',
    'kitchen',
    'good',
    'David Wilson',
    'david@example.com',
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '6 days',
    'active',
    '550e8400-e29b-41d4-a716-446655440003',
    '650e8400-e29b-41d4-a716-446655440004',
    'Meal prep for the week'
  ),
  (
    '1984 by George Orwell',
    'Dystopian social science fiction novel',
    'book',
    'excellent',
    'Bob Smith',
    'bob@example.com',
    CURRENT_DATE - INTERVAL '14 days',
    CURRENT_DATE,
    'returned',
    '550e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440001',
    'Great condition when returned'
  );

-- =============================================
-- UPDATE RETURNED ITEMS
-- =============================================

-- Mark returned items with return date
UPDATE public.lent_items 
SET returned_date = CURRENT_DATE 
WHERE status = 'returned';

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Count items by status
SELECT 
  'borrowed_items' as table_name,
  status,
  COUNT(*) as count
FROM public.borrowed_items 
GROUP BY status
UNION ALL
SELECT 
  'lent_items' as table_name,
  status,
  COUNT(*) as count
FROM public.lent_items 
GROUP BY status
ORDER BY table_name, status;

-- Count group memberships
SELECT 
  g.name as group_name,
  COUNT(gm.user_id) as member_count
FROM public.groups g
LEFT JOIN public.group_members gm ON g.id = gm.group_id AND gm.is_active = true
GROUP BY g.id, g.name
ORDER BY member_count DESC;

-- Show overdue items
SELECT 
  'borrowed' as type,
  name,
  borrowed_date as transaction_date,
  due_date,
  CURRENT_DATE - due_date as days_overdue
FROM public.borrowed_items 
WHERE status = 'overdue'
UNION ALL
SELECT 
  'lent' as type,
  name,
  lent_date as transaction_date,
  due_date,
  CURRENT_DATE - due_date as days_overdue
FROM public.lent_items 
WHERE status = 'overdue'
ORDER BY days_overdue DESC;

-- Sample data inserted successfully
SELECT 'Sample data inserted successfully!' as result;
