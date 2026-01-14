# Database Setup Guide

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/vvlmxhujhmdiypygflsl
2. Click on the "SQL Editor" in the left sidebar
3. Click "New query"

## Step 2: Run the Migration

Copy the entire contents of `supabase/migrations/001_initial_schema.sql` and paste it into the SQL Editor, then click "Run".

This will create:

### Tables
- **folders** - Organize vocab sets into folders
- **vocab_sets** - Your vocabulary sets
- **vocab_words** - Individual words with definitions
- **learning_progress** - Track memory scores for each word
- **learning_sessions** - Log of completed learning sessions
- **user_stats** - User-wide statistics (streak, total words, etc.)

### Security
- Row Level Security (RLS) policies ensure users can only access their own data
- All tables are protected with appropriate read/write policies

### Automatic Features
- **Auto-created user_stats**: When a user signs up, their stats record is automatically created
- **Updated timestamps**: Folders and vocab_sets automatically update their `updated_at` field

## Step 3: Verify Setup

After running the migration, you can verify the tables were created:

1. Go to "Table Editor" in the Supabase sidebar
2. You should see all 6 tables listed
3. Click on each table to inspect its structure

## What's Next?

Once the database is set up:
- The app will be able to store and retrieve vocab sets
- User progress will be tracked automatically
- You'll be ready to move to Period 3: Vocab Set Management

## Troubleshooting

### Error: trigger "on_auth_user_created" already exists

If you get this error, it means you need to clean up from a previous migration attempt:

1. First, run the cleanup script `supabase/migrations/000_cleanup.sql` in the SQL Editor
2. Then run the main migration `supabase/migrations/001_initial_schema.sql`

### Other Issues

- Make sure you're using the correct Supabase project
- Check that the SQL ran completely without errors
- If you see any other errors, try the cleanup script first, then re-run the migration
