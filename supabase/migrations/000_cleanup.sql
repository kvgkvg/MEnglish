-- Cleanup script - Run this FIRST if you're re-running the migration

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS create_user_stats();

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS learning_sessions CASCADE;
DROP TABLE IF EXISTS learning_progress CASCADE;
DROP TABLE IF EXISTS vocab_words CASCADE;
DROP TABLE IF EXISTS vocab_sets CASCADE;
DROP TABLE IF EXISTS folders CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
