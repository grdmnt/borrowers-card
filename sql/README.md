# Database Migration for Unified Borrowed/Lent Items System

This directory contains SQL migration files to update your Supabase database for the unified borrowed/lent items system.

## 🎯 Overview

The migration adds a `lender_user_id` column to the `borrowed_items` table, enabling both borrowers and lenders to see the same record from their respective perspectives.

## 📋 Migration Files

Execute these files **in order** in your Supabase SQL editor:

### 1. `001_add_lender_user_id.sql`
- Adds the `lender_user_id` column to `borrowed_items` table
- Creates foreign key reference to `auth.users(id)`

### 2. `002_add_indexes.sql`
- Adds performance indexes for the new column
- Optimizes queries for both borrower and lender perspectives

### 3. `003_update_rls_policies.sql`
- Updates Row Level Security policies
- Allows both borrowers and lenders to access shared items
- Maintains data security and isolation

### 4. `004_helper_functions.sql` *(Optional)*
- Creates helper functions for querying items by perspective
- Provides convenient ways to get borrower-only or lender-only views

### 5. `005_data_migration.sql` *(Optional)*
- Handles existing data migration
- Contains commented code for auto-matching existing records

## 🚀 How to Run

1. **Open Supabase Dashboard**
   - Go to your project dashboard
   - Navigate to "SQL Editor"

2. **Execute Files in Order**
   ```sql
   -- Copy and paste each file content, starting with:
   -- 001_add_lender_user_id.sql
   -- 002_add_indexes.sql
   -- 003_update_rls_policies.sql
   -- etc.
   ```

3. **Verify Changes**
   ```sql
   -- Check that the column was added
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'borrowed_items' 
   AND column_name = 'lender_user_id';

   -- Check indexes were created
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename = 'borrowed_items' 
   AND indexname LIKE '%lender%';
   ```

## ⚠️ Important Notes

- **Backup First**: Always backup your database before running migrations
- **Test Environment**: Run these migrations in a test environment first
- **Existing Data**: Existing records will have `lender_user_id = NULL` until updated
- **Application Code**: Make sure your application code is updated to handle the new column

## 🔄 How the System Works After Migration

### Before Migration:
- `borrowed_items` table only tracks borrower perspective
- Lenders have no visibility into lent items

### After Migration:
- Same `borrowed_items` table serves both perspectives
- When User A borrows from User B:
  - `user_id` = User A (borrower)
  - `lender_user_id` = User B (lender)
- Both users can see, edit, and manage the same record
- UI shows appropriate perspective based on user role

## 🛠️ Rollback (if needed)

If you need to rollback these changes:

```sql
-- Remove the column (WARNING: This will delete data)
ALTER TABLE borrowed_items DROP COLUMN lender_user_id;

-- Drop indexes
DROP INDEX IF EXISTS idx_borrowed_items_lender_user_id;
DROP INDEX IF EXISTS idx_borrowed_items_user_perspectives;
DROP INDEX IF EXISTS idx_borrowed_items_status;
DROP INDEX IF EXISTS idx_borrowed_items_status_due_date;

-- Restore original RLS policies (adjust as needed for your setup)
-- You'll need to recreate your original policies here
```

## 📞 Support

If you encounter any issues during migration:
1. Check the Supabase logs for error details
2. Verify your database permissions
3. Ensure all prerequisite tables exist
4. Test with a small dataset first
