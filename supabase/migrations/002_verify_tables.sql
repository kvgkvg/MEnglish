-- Verification query - Run this to check if tables exist

SELECT
    table_name,
    table_schema
FROM
    information_schema.tables
WHERE
    table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY
    table_name;

-- This should return:
-- folders
-- learning_progress
-- learning_sessions
-- user_stats
-- vocab_sets
-- vocab_words
