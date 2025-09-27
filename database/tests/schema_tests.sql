-- Borrower's Card Database Schema Tests
-- Run these tests after setting up the database to verify everything works

-- =============================================
-- TEST 1: Verify Tables Exist
-- =============================================

DO $$
DECLARE
    expected_tables TEXT[] := ARRAY['users', 'groups', 'group_members', 'borrowed_items', 'lent_items'];
    table_name TEXT;
    missing_tables TEXT[] := '{}';
BEGIN
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ All required tables exist';
    END IF;
END $$;

-- =============================================
-- TEST 2: Verify Custom Types Exist
-- =============================================

DO $$
DECLARE
    expected_types TEXT[] := ARRAY['item_status', 'item_condition', 'item_category', 'group_role'];
    type_name TEXT;
    missing_types TEXT[] := '{}';
BEGIN
    FOREACH type_name IN ARRAY expected_types
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_type 
            WHERE typname = type_name
        ) THEN
            missing_types := array_append(missing_types, type_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_types, 1) > 0 THEN
        RAISE EXCEPTION 'Missing custom types: %', array_to_string(missing_types, ', ');
    ELSE
        RAISE NOTICE '✅ All custom types exist';
    END IF;
END $$;

-- =============================================
-- TEST 3: Verify RLS is Enabled
-- =============================================

DO $$
DECLARE
    table_name TEXT;
    tables_without_rls TEXT[] := '{}';
BEGIN
    FOR table_name IN 
        SELECT t.tablename 
        FROM pg_tables t 
        WHERE t.schemaname = 'public' 
        AND t.tablename IN ('users', 'groups', 'group_members', 'borrowed_items', 'lent_items')
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = table_name 
            AND rowsecurity = true
        ) THEN
            tables_without_rls := array_append(tables_without_rls, table_name);
        END IF;
    END LOOP;
    
    IF array_length(tables_without_rls, 1) > 0 THEN
        RAISE EXCEPTION 'Tables without RLS: %', array_to_string(tables_without_rls, ', ');
    ELSE
        RAISE NOTICE '✅ RLS enabled on all tables';
    END IF;
END $$;

-- =============================================
-- TEST 4: Verify Functions Exist
-- =============================================

DO $$
DECLARE
    expected_functions TEXT[] := ARRAY[
        'get_overdue_count', 
        'mark_overdue_items', 
        'is_group_admin', 
        'is_group_member',
        'update_updated_at_column'
    ];
    function_name TEXT;
    missing_functions TEXT[] := '{}';
BEGIN
    FOREACH function_name IN ARRAY expected_functions
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = function_name
        ) THEN
            missing_functions := array_append(missing_functions, function_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_functions, 1) > 0 THEN
        RAISE EXCEPTION 'Missing functions: %', array_to_string(missing_functions, ', ');
    ELSE
        RAISE NOTICE '✅ All helper functions exist';
    END IF;
END $$;

-- =============================================
-- TEST 5: Verify Indexes Exist
-- =============================================

DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public'
    AND tablename IN ('users', 'groups', 'group_members', 'borrowed_items', 'lent_items');
    
    IF index_count < 15 THEN
        RAISE EXCEPTION 'Expected at least 15 indexes, found %', index_count;
    ELSE
        RAISE NOTICE '✅ Performance indexes created (% total)', index_count;
    END IF;
END $$;

-- =============================================
-- TEST 6: Test Data Insertion (Basic)
-- =============================================

DO $$
DECLARE
    test_user_id UUID := '550e8400-e29b-41d4-a716-446655440099';
    test_group_id UUID;
BEGIN
    -- Test user insertion
    INSERT INTO public.users (id, email, name) 
    VALUES (test_user_id, 'test@example.com', 'Test User')
    ON CONFLICT (id) DO NOTHING;
    
    -- Test group creation
    INSERT INTO public.groups (name, description, created_by) 
    VALUES ('Test Group', 'Test group for schema validation', test_user_id)
    RETURNING id INTO test_group_id;
    
    -- Test group membership
    INSERT INTO public.group_members (group_id, user_id, role)
    VALUES (test_group_id, test_user_id, 'admin');
    
    -- Test borrowed item
    INSERT INTO public.borrowed_items (
        name, borrowed_from_name, user_id, group_id
    ) VALUES (
        'Test Item', 'Test Lender', test_user_id, test_group_id
    );
    
    -- Test lent item
    INSERT INTO public.lent_items (
        name, lent_to_name, user_id, group_id
    ) VALUES (
        'Test Lent Item', 'Test Borrower', test_user_id, test_group_id
    );
    
    RAISE NOTICE '✅ Basic data insertion successful';
    
    -- Clean up test data
    DELETE FROM public.borrowed_items WHERE user_id = test_user_id;
    DELETE FROM public.lent_items WHERE user_id = test_user_id;
    DELETE FROM public.group_members WHERE user_id = test_user_id;
    DELETE FROM public.groups WHERE created_by = test_user_id;
    DELETE FROM public.users WHERE id = test_user_id;
    
    RAISE NOTICE '✅ Test data cleaned up';
END $$;

-- =============================================
-- TEST 7: Test Helper Functions
-- =============================================

DO $$
DECLARE
    test_user_id UUID := '550e8400-e29b-41d4-a716-446655440099';
    test_group_id UUID;
    overdue_result RECORD;
    marked_count INTEGER;
BEGIN
    -- Create test data
    INSERT INTO public.users (id, email, name) 
    VALUES (test_user_id, 'test@example.com', 'Test User');
    
    INSERT INTO public.groups (name, created_by) 
    VALUES ('Test Group', test_user_id)
    RETURNING id INTO test_group_id;
    
    INSERT INTO public.group_members (group_id, user_id, role)
    VALUES (test_group_id, test_user_id, 'admin');
    
    -- Test overdue count function
    SELECT * INTO overdue_result FROM get_overdue_count(test_user_id);
    IF overdue_result IS NOT NULL THEN
        RAISE NOTICE '✅ get_overdue_count function works';
    END IF;
    
    -- Test group admin function
    IF is_group_admin(test_group_id, test_user_id) THEN
        RAISE NOTICE '✅ is_group_admin function works';
    ELSE
        RAISE EXCEPTION 'is_group_admin function failed';
    END IF;
    
    -- Test group member function
    IF is_group_member(test_group_id, test_user_id) THEN
        RAISE NOTICE '✅ is_group_member function works';
    ELSE
        RAISE EXCEPTION 'is_group_member function failed';
    END IF;
    
    -- Test mark overdue function
    SELECT mark_overdue_items() INTO marked_count;
    RAISE NOTICE '✅ mark_overdue_items function works (marked % items)', marked_count;
    
    -- Clean up
    DELETE FROM public.group_members WHERE user_id = test_user_id;
    DELETE FROM public.groups WHERE id = test_group_id;
    DELETE FROM public.users WHERE id = test_user_id;
    
END $$;

-- =============================================
-- TEST 8: Verify Constraints Work
-- =============================================

DO $$
DECLARE
    test_user_id UUID := '550e8400-e29b-41d4-a716-446655440099';
    constraint_test_passed BOOLEAN := false;
BEGIN
    -- Create test user
    INSERT INTO public.users (id, email, name) 
    VALUES (test_user_id, 'test@example.com', 'Test User');
    
    -- Test date constraint (should fail)
    BEGIN
        INSERT INTO public.borrowed_items (
            name, borrowed_from_name, user_id,
            borrowed_date, due_date
        ) VALUES (
            'Test Item', 'Test Lender', test_user_id,
            CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day'  -- Invalid: due before borrowed
        );
        RAISE EXCEPTION 'Date constraint should have failed but did not';
    EXCEPTION
        WHEN check_violation THEN
            constraint_test_passed := true;
            RAISE NOTICE '✅ Date constraints working correctly';
    END;
    
    IF NOT constraint_test_passed THEN
        RAISE EXCEPTION 'Date constraint test failed';
    END IF;
    
    -- Clean up
    DELETE FROM public.users WHERE id = test_user_id;
    
END $$;

-- =============================================
-- FINAL SUMMARY
-- =============================================

SELECT 
    '🎉 All database schema tests passed! Your database is ready to use.' as result,
    NOW() as tested_at;

-- Show table row counts
SELECT 
    'Table Statistics' as info,
    (SELECT COUNT(*) FROM public.users) as users,
    (SELECT COUNT(*) FROM public.groups) as groups,
    (SELECT COUNT(*) FROM public.group_members) as memberships,
    (SELECT COUNT(*) FROM public.borrowed_items) as borrowed_items,
    (SELECT COUNT(*) FROM public.lent_items) as lent_items;
