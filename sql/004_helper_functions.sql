-- Helper functions for the unified borrowed/lent items system
-- These functions provide convenient ways to query items from different perspectives

-- Function to get user items with perspective information
-- Returns items with additional metadata about whether the user is borrower or lender
CREATE OR REPLACE FUNCTION get_user_items_with_perspective(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    status TEXT,
    borrowed_date DATE,
    due_date DATE,
    returned_date DATE,
    notes TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    perspective TEXT, -- 'borrower' or 'lender'
    other_user_id UUID,
    other_user_name TEXT,
    borrowed_from_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bi.id,
        bi.name,
        bi.description,
        bi.status,
        bi.borrowed_date,
        bi.due_date,
        bi.returned_date,
        bi.notes,
        bi.image_url,
        bi.created_at,
        bi.updated_at,
        CASE 
            WHEN bi.user_id = user_uuid THEN 'borrower'::TEXT
            WHEN bi.lender_user_id = user_uuid THEN 'lender'::TEXT
        END as perspective,
        CASE 
            WHEN bi.user_id = user_uuid THEN bi.lender_user_id
            WHEN bi.lender_user_id = user_uuid THEN bi.user_id
        END as other_user_id,
        CASE 
            WHEN bi.user_id = user_uuid THEN bi.borrowed_from_name
            WHEN bi.lender_user_id = user_uuid THEN borrower.name
        END as other_user_name,
        bi.borrowed_from_name
    FROM borrowed_items bi
    LEFT JOIN auth.users borrower ON borrower.id = bi.user_id
    WHERE bi.user_id = user_uuid OR bi.lender_user_id = user_uuid
    ORDER BY bi.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get items from borrower perspective only
CREATE OR REPLACE FUNCTION get_borrowed_items(user_uuid UUID)
RETURNS SETOF borrowed_items AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM borrowed_items
    WHERE user_id = user_uuid
    ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get items from lender perspective only
CREATE OR REPLACE FUNCTION get_lent_items(user_uuid UUID)
RETURNS SETOF borrowed_items AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM borrowed_items
    WHERE lender_user_id = user_uuid
    ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_items_with_perspective(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_borrowed_items(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_lent_items(UUID) TO authenticated;
