-- Add lender_user_id column to borrowed_items table
-- This enables the unified borrowed/lent items system where both borrower and lender
-- can see the same record from their respective perspectives

-- Add the lender_user_id column
ALTER TABLE borrowed_items 
ADD COLUMN lender_user_id UUID REFERENCES auth.users(id);

-- Add comment to document the column purpose
COMMENT ON COLUMN borrowed_items.lender_user_id IS 'ID of the user who lent the item (references auth.users)';
