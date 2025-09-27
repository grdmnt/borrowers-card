-- Data migration script for existing borrowed_items
-- This script helps migrate existing data to work with the new unified system
-- Run this AFTER adding the lender_user_id column

-- WARNING: This migration script makes assumptions about existing data
-- Review and modify as needed based on your actual data structure

-- Option 1: Set lender_user_id to NULL for existing records
-- This allows existing records to continue working while new records use the unified system
UPDATE borrowed_items 
SET lender_user_id = NULL 
WHERE lender_user_id IS NULL;

-- Option 2: Attempt to populate lender_user_id from borrowed_from_name
-- This tries to match borrowed_from_name with actual user names
-- UNCOMMENT AND MODIFY THE FOLLOWING IF YOU WANT TO ATTEMPT AUTO-MATCHING:

/*
-- Create a temporary function to help with migration
CREATE OR REPLACE FUNCTION migrate_lender_user_ids()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
    item_record RECORD;
    lender_id UUID;
BEGIN
    -- Loop through borrowed_items that don't have lender_user_id set
    FOR item_record IN 
        SELECT id, borrowed_from_name 
        FROM borrowed_items 
        WHERE lender_user_id IS NULL 
        AND borrowed_from_name IS NOT NULL
    LOOP
        -- Try to find a matching user by name
        -- NOTE: This assumes you have user names stored somewhere accessible
        -- Modify this query based on your actual user data structure
        SELECT id INTO lender_id
        FROM auth.users u
        WHERE u.raw_user_meta_data->>'name' = item_record.borrowed_from_name
        OR u.email = item_record.borrowed_from_name
        LIMIT 1;
        
        -- If we found a matching user, update the record
        IF lender_id IS NOT NULL THEN
            UPDATE borrowed_items 
            SET lender_user_id = lender_id 
            WHERE id = item_record.id;
            
            updated_count := updated_count + 1;
        END IF;
        
        lender_id := NULL; -- Reset for next iteration
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Run the migration
SELECT migrate_lender_user_ids() as updated_records;

-- Drop the temporary function
DROP FUNCTION migrate_lender_user_ids();
*/

-- Add a comment about the migration
COMMENT ON COLUMN borrowed_items.lender_user_id IS 
'Added for unified borrowed/lent system. NULL values indicate legacy records created before this feature.';
