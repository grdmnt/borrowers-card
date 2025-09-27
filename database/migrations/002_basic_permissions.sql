-- Borrower's Card Database Schema
-- Migration 002: Basic Permissions (No RLS for Development)
-- Run this AFTER running 001_initial_schema.sql

-- =============================================
-- DISABLE ROW LEVEL SECURITY (FOR DEVELOPMENT)
-- =============================================
-- Note: RLS is disabled for easier development
-- We'll add proper security policies later when needed

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowed_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lent_items DISABLE ROW LEVEL SECURITY;

-- =============================================
-- GRANT BASIC PERMISSIONS
-- =============================================

-- Grant usage on custom types
GRANT USAGE ON TYPE item_status TO authenticated;
GRANT USAGE ON TYPE item_condition TO authenticated;
GRANT USAGE ON TYPE item_category TO authenticated;
GRANT USAGE ON TYPE group_role TO authenticated;

-- Grant permissions on tables to authenticated users
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.groups TO authenticated;
GRANT ALL ON public.group_members TO authenticated;
GRANT ALL ON public.borrowed_items TO authenticated;
GRANT ALL ON public.lent_items TO authenticated;

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION get_overdue_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_overdue_items() TO authenticated;
-- Note: is_group_admin and is_group_member functions not created yet

-- =============================================
-- REALTIME SUBSCRIPTIONS SETUP
-- =============================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.borrowed_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lent_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON SCHEMA public IS 'Borrower''s Card application schema - RLS disabled for development';

-- Basic permissions setup complete
SELECT 'Basic permissions configured successfully! RLS is disabled for development.' as result;
