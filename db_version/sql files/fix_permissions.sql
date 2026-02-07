-- Fix PostgreSQL permissions for project_management database
-- Run this script as a PostgreSQL superuser (usually 'postgres')

-- First, check current user
SELECT current_user, current_database();

-- Grant connection privilege to the database
GRANT CONNECT ON DATABASE project_management TO dbuser;

-- Connect to the project_management database
\c project_management

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO dbuser;

-- Grant all privileges on all existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dbuser;

-- Grant all privileges on all sequences (for auto-increment columns)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dbuser;

-- Grant all privileges on all functions
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO dbuser;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO dbuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO dbuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO dbuser;

-- If tables are owned by a different user (e.g., postgres), transfer ownership
-- Uncomment and modify the following lines if needed:
-- ALTER TABLE users OWNER TO dbuser;
-- ALTER TABLE clients OWNER TO dbuser;
-- ALTER TABLE goals OWNER TO dbuser;
-- ALTER TABLE projects OWNER TO dbuser;
-- ALTER TABLE tasks OWNER TO dbuser;
-- ALTER TABLE milestones OWNER TO dbuser;

-- Alternative: Grant specific permissions if ALL is too broad
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO dbuser;

-- Verify permissions
SELECT 
    schemaname,
    tablename,
    tableowner,
    has_table_privilege('dbuser', schemaname||'.'||tablename, 'SELECT') as select,
    has_table_privilege('dbuser', schemaname||'.'||tablename, 'INSERT') as insert,
    has_table_privilege('dbuser', schemaname||'.'||tablename, 'UPDATE') as update,
    has_table_privilege('dbuser', schemaname||'.'||tablename, 'DELETE') as delete
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check current grants
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public'
AND grantee = 'dbuser'
ORDER BY table_name, privilege_type;
