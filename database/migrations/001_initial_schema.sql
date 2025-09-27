-- Borrower's Card Database Schema
-- Migration 001: Initial Schema Setup
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE item_status AS ENUM ('active', 'returned', 'overdue', 'lost');
CREATE TYPE item_condition AS ENUM ('excellent', 'good', 'fair', 'poor');
CREATE TYPE item_category AS ENUM (
  'book', 'tool', 'electronics', 'clothing', 'sports', 'kitchen', 
  'furniture', 'games', 'media', 'vehicle', 'other'
);
CREATE TYPE group_role AS ENUM ('admin', 'member');

-- =============================================
-- USERS TABLE (extends Supabase auth.users)
-- =============================================
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  phone TEXT,
  
  -- Preferences
  notification_email BOOLEAN DEFAULT true,
  notification_reminders BOOLEAN DEFAULT true,
  public_profile BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- GROUPS TABLE (for lending circles)
-- =============================================
CREATE TABLE public.groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  
  -- Settings
  is_public BOOLEAN DEFAULT false,
  require_approval BOOLEAN DEFAULT true,
  max_members INTEGER DEFAULT 50,
  
  -- Ownership
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- GROUP MEMBERS TABLE
-- =============================================
CREATE TABLE public.group_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role group_role DEFAULT 'member' NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Unique constraint: one membership per user per group
  UNIQUE(group_id, user_id)
);

-- =============================================
-- BORROWED ITEMS TABLE
-- =============================================
CREATE TABLE public.borrowed_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Item details
  name TEXT NOT NULL,
  description TEXT,
  category item_category DEFAULT 'other',
  condition item_condition DEFAULT 'good',
  estimated_value DECIMAL(10,2),
  image_url TEXT,
  
  -- Borrowing details
  borrowed_from_name TEXT NOT NULL,
  borrowed_from_email TEXT,
  borrowed_from_phone TEXT,
  borrowed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  returned_date DATE,
  
  -- Status and notes
  status item_status DEFAULT 'active' NOT NULL,
  notes TEXT,
  return_notes TEXT,
  
  -- Ownership and context
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (
    (due_date IS NULL OR due_date >= borrowed_date) AND
    (returned_date IS NULL OR returned_date >= borrowed_date)
  ),
  CONSTRAINT valid_return_status CHECK (
    (status = 'returned' AND returned_date IS NOT NULL) OR
    (status != 'returned')
  )
);

-- =============================================
-- LENT ITEMS TABLE
-- =============================================
CREATE TABLE public.lent_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Item details
  name TEXT NOT NULL,
  description TEXT,
  category item_category DEFAULT 'other',
  condition item_condition DEFAULT 'good',
  estimated_value DECIMAL(10,2),
  image_url TEXT,
  
  -- Lending details
  lent_to_name TEXT NOT NULL,
  lent_to_email TEXT,
  lent_to_phone TEXT,
  lent_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  returned_date DATE,
  
  -- Status and notes
  status item_status DEFAULT 'active' NOT NULL,
  notes TEXT,
  return_notes TEXT,
  
  -- Ownership and context
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (
    (due_date IS NULL OR due_date >= lent_date) AND
    (returned_date IS NULL OR returned_date >= lent_date)
  ),
  CONSTRAINT valid_return_status CHECK (
    (status = 'returned' AND returned_date IS NOT NULL) OR
    (status != 'returned')
  )
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at);
CREATE INDEX idx_users_last_active ON public.users(last_active_at);

-- Groups indexes
CREATE INDEX idx_groups_created_by ON public.groups(created_by);
CREATE INDEX idx_groups_public ON public.groups(is_public) WHERE is_public = true;
CREATE INDEX idx_groups_created_at ON public.groups(created_at);

-- Group members indexes
CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX idx_group_members_active ON public.group_members(is_active) WHERE is_active = true;

-- Borrowed items indexes
CREATE INDEX idx_borrowed_items_user_id ON public.borrowed_items(user_id);
CREATE INDEX idx_borrowed_items_group_id ON public.borrowed_items(group_id);
CREATE INDEX idx_borrowed_items_status ON public.borrowed_items(status);
CREATE INDEX idx_borrowed_items_category ON public.borrowed_items(category);
CREATE INDEX idx_borrowed_items_due_date ON public.borrowed_items(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_borrowed_items_borrowed_date ON public.borrowed_items(borrowed_date);
CREATE INDEX idx_borrowed_items_overdue ON public.borrowed_items(due_date, status) 
  WHERE status = 'active';

-- Lent items indexes
CREATE INDEX idx_lent_items_user_id ON public.lent_items(user_id);
CREATE INDEX idx_lent_items_group_id ON public.lent_items(group_id);
CREATE INDEX idx_lent_items_status ON public.lent_items(status);
CREATE INDEX idx_lent_items_category ON public.lent_items(category);
CREATE INDEX idx_lent_items_due_date ON public.lent_items(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_lent_items_lent_date ON public.lent_items(lent_date);
CREATE INDEX idx_lent_items_overdue ON public.lent_items(due_date, status) 
  WHERE status = 'active';

-- =============================================
-- FUNCTIONS FOR AUTOMATIC TIMESTAMPS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at 
  BEFORE UPDATE ON public.groups 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_borrowed_items_updated_at 
  BEFORE UPDATE ON public.borrowed_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lent_items_updated_at 
  BEFORE UPDATE ON public.lent_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get overdue items count for a user
CREATE OR REPLACE FUNCTION get_overdue_count(user_uuid UUID)
RETURNS TABLE(borrowed_overdue BIGINT, lent_overdue BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.borrowed_items 
     WHERE user_id = user_uuid 
       AND status = 'active' 
       AND due_date < CURRENT_DATE) as borrowed_overdue,
    (SELECT COUNT(*) FROM public.lent_items 
     WHERE user_id = user_uuid 
       AND status = 'active' 
       AND due_date < CURRENT_DATE) as lent_overdue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically mark overdue items
CREATE OR REPLACE FUNCTION mark_overdue_items()
RETURNS INTEGER AS $$
DECLARE
  borrowed_count INTEGER := 0;
  lent_count INTEGER := 0;
  total_count INTEGER := 0;
BEGIN
  -- Mark overdue borrowed items
  UPDATE public.borrowed_items 
  SET status = 'overdue'
  WHERE status = 'active' 
    AND due_date < CURRENT_DATE;
  
  GET DIAGNOSTICS borrowed_count = ROW_COUNT;
  
  -- Mark overdue lent items
  UPDATE public.lent_items 
  SET status = 'overdue'
  WHERE status = 'active' 
    AND due_date < CURRENT_DATE;
  
  GET DIAGNOSTICS lent_count = ROW_COUNT;
  
  total_count := borrowed_count + lent_count;
  
  RETURN total_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE public.groups IS 'Lending circles/groups for organizing shared borrowing';
COMMENT ON TABLE public.group_members IS 'Membership relationships between users and groups';
COMMENT ON TABLE public.borrowed_items IS 'Items that users have borrowed from others';
COMMENT ON TABLE public.lent_items IS 'Items that users have lent to others';

-- Function to check if user is group admin
CREATE OR REPLACE FUNCTION is_group_admin(group_uuid UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = group_uuid 
      AND user_id = user_uuid 
      AND role = 'admin' 
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is group member
CREATE OR REPLACE FUNCTION is_group_member(group_uuid UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = group_uuid 
      AND user_id = user_uuid 
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_overdue_count(UUID) IS 'Returns count of overdue borrowed and lent items for a user';
COMMENT ON FUNCTION mark_overdue_items() IS 'Automatically marks items as overdue based on due_date';
COMMENT ON FUNCTION is_group_admin(UUID, UUID) IS 'Check if a user is an admin of a specific group';
COMMENT ON FUNCTION is_group_member(UUID, UUID) IS 'Check if a user is a member of a specific group';

-- Migration complete
SELECT 'Database schema created successfully!' as result;
