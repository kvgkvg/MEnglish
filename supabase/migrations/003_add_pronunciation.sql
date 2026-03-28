-- Add pronunciation column to vocab_words table
ALTER TABLE vocab_words ADD COLUMN IF NOT EXISTS pronunciation TEXT;
