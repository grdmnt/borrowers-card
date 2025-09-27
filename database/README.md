# Borrower's Card Database Setup

This directory contains the database schema and setup files for the Borrower's Card application.

## 📁 Directory Structure

```
database/
├── migrations/
│   ├── 001_initial_schema.sql      # Core database schema
│   └── 002_basic_permissions.sql   # Basic permissions (RLS disabled)
├── seeds/
│   └── 001_sample_data.sql         # Sample data for testing
└── README.md                       # This file
```

## 🚀 Setup Instructions

### Step 1: Run Migrations

Execute these SQL files in your Supabase SQL Editor in order:

1. **Initial Schema** (`migrations/001_initial_schema.sql`)
   - Creates all tables, indexes, and functions
   - Sets up custom types and constraints
   - Adds automatic timestamp triggers

2. **Basic Permissions** (`migrations/002_basic_permissions.sql`)
   - Disables Row Level Security for development
   - Grants basic permissions to authenticated users
   - Sets up realtime subscriptions

### Step 2: Verify Setup

After running the migrations, verify the setup:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if RLS is disabled (should show 'f' for false)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Test helper functions
SELECT get_overdue_count('550e8400-e29b-41d4-a716-446655440001');
```

### Step 3: Sample Data (Optional)

For testing purposes, you can run the seed data:

```sql
-- Run the sample data script
\i database/seeds/001_sample_data.sql
```

**⚠️ Important:** Remove sample data before going to production!

## 📊 Database Schema Overview

### Core Tables

1. **`users`** - User profiles (extends Supabase auth.users)
2. **`groups`** - Lending circles/communities
3. **`group_members`** - User membership in groups
4. **`borrowed_items`** - Items users have borrowed
5. **`lent_items`** - Items users have lent out

### Custom Types

- `item_status`: active, returned, overdue, lost
- `item_category`: book, tool, electronics, etc.
- `group_role`: admin, member

### Key Features

- **No RLS (Development)**: All authenticated users can access all data for easier development
- **Automatic Timestamps**: `created_at` and `updated_at` managed automatically
- **Overdue Detection**: Functions to identify and mark overdue items
- **Realtime Updates**: Live updates for collaborative features
- **Performance Indexes**: Optimized queries for common operations

## 🔓 Security Model (Development)

### Current Setup

- **RLS Disabled**: Row Level Security is turned off for easier development
- **Basic Permissions**: All authenticated users have full access to all tables
- **No Data Isolation**: Users can access any data in the database

### Future Security (Production)

When ready for production, you can:
1. Enable RLS on all tables
2. Create security policies to isolate user data
3. Implement group-based permissions
4. Add privacy controls

## 🛠️ Helper Functions

### `get_overdue_count(user_id)`
Returns count of overdue borrowed and lent items for a user.
```sql
SELECT * FROM get_overdue_count(auth.uid());
```

### `mark_overdue_items()`
Automatically marks items as overdue based on due dates.

```sql
SELECT mark_overdue_items(); -- Returns count of items marked overdue
```

### `is_group_admin(group_id, user_id)`
Checks if a user is an admin of a specific group.

```sql
SELECT is_group_admin('group-uuid', auth.uid());
```

### `is_group_member(group_id, user_id)`
Checks if a user is a member of a specific group.

```sql
SELECT is_group_member('group-uuid', auth.uid());
```

## 📈 Performance Optimizations

### Indexes Created

- User email and activity indexes
- Group membership and public group indexes
- Item status, category, and due date indexes
- Overdue item detection indexes

### Query Optimization

- Composite indexes for common filter combinations
- Partial indexes for active/public records only
- Foreign key indexes for join performance

## 🔄 Maintenance

### Regular Tasks

1. **Mark Overdue Items**: Run `mark_overdue_items()` daily
2. **Clean Up**: Remove old test data periodically
3. **Monitor Performance**: Check slow query logs
4. **Backup**: Regular database backups via Supabase

### Monitoring Queries

```sql
-- Check overdue items across all users
SELECT COUNT(*) as overdue_borrowed FROM borrowed_items WHERE status = 'overdue';
SELECT COUNT(*) as overdue_lent FROM lent_items WHERE status = 'overdue';

-- Check group activity
SELECT g.name, COUNT(gm.user_id) as members 
FROM groups g 
LEFT JOIN group_members gm ON g.id = gm.group_id 
GROUP BY g.id, g.name;

-- Check recent activity
SELECT COUNT(*) as items_added_today 
FROM (
  SELECT created_at FROM borrowed_items 
  UNION ALL 
  SELECT created_at FROM lent_items
) items 
WHERE created_at::date = CURRENT_DATE;
```

## 🚨 Troubleshooting

### Common Issues

1. **RLS Blocking Queries**: Ensure user is authenticated and policies are correct
2. **Foreign Key Errors**: Check that referenced records exist
3. **Permission Denied**: Verify user has proper group membership/role
4. **Overdue Not Updating**: Run `mark_overdue_items()` function

### Debug Queries

```sql
-- Check current user authentication
SELECT auth.uid(), auth.email();

-- Check user's group memberships
SELECT g.name, gm.role 
FROM group_members gm 
JOIN groups g ON gm.group_id = g.id 
WHERE gm.user_id = auth.uid() AND gm.is_active = true;

-- Test RLS policies
SET ROLE authenticated;
SELECT * FROM users WHERE id = auth.uid();
```

## 📝 Migration History

- **001_initial_schema.sql**: Initial database structure
- **002_rls_policies.sql**: Security policies and permissions

Future migrations should be numbered sequentially (003, 004, etc.).
