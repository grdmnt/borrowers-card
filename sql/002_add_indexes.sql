-- Add indexes for performance optimization
-- These indexes improve query performance when filtering by lender_user_id
-- and when querying items from both borrower and lender perspectives

-- Index for efficient queries on lender_user_id
CREATE INDEX IF NOT EXISTS idx_borrowed_items_lender_user_id 
ON borrowed_items(lender_user_id);

-- Composite index for user perspective queries (both borrower and lender)
-- This optimizes queries that filter by either user_id OR lender_user_id
CREATE INDEX IF NOT EXISTS idx_borrowed_items_user_perspectives 
ON borrowed_items(user_id, lender_user_id);

-- Index for status-based queries (commonly used in filters)
CREATE INDEX IF NOT EXISTS idx_borrowed_items_status 
ON borrowed_items(status);

-- Composite index for due date queries (for overdue items)
CREATE INDEX IF NOT EXISTS idx_borrowed_items_status_due_date 
ON borrowed_items(status, due_date) 
WHERE due_date IS NOT NULL;
