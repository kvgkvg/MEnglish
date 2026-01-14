-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Folders table
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vocab sets table
CREATE TABLE vocab_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vocab words table
CREATE TABLE vocab_words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    set_id UUID NOT NULL REFERENCES vocab_sets(id) ON DELETE CASCADE,
    word VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    example_sentence TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Learning progress table
CREATE TABLE learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES vocab_words(id) ON DELETE CASCADE,
    memory_score INTEGER NOT NULL DEFAULT 50 CHECK (memory_score >= 0 AND memory_score <= 100),
    next_review_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    review_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    UNIQUE(user_id, word_id)
);

-- Learning sessions table
CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    set_id UUID NOT NULL REFERENCES vocab_sets(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('flashcard', 'multiple_choice', 'write', 'matching', 'test')),
    score DECIMAL(5,2),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User stats table
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_words_learned INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_vocab_sets_user_id ON vocab_sets(user_id);
CREATE INDEX idx_vocab_sets_folder_id ON vocab_sets(folder_id);
CREATE INDEX idx_vocab_words_set_id ON vocab_words(set_id);
CREATE INDEX idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX idx_learning_progress_word_id ON learning_progress(word_id);
CREATE INDEX idx_learning_progress_next_review ON learning_progress(next_review_date);
CREATE INDEX idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_set_id ON learning_sessions(set_id);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Folders policies
CREATE POLICY "Users can view their own folders"
    ON folders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders"
    ON folders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
    ON folders FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
    ON folders FOR DELETE
    USING (auth.uid() = user_id);

-- Vocab sets policies
CREATE POLICY "Users can view their own vocab sets"
    ON vocab_sets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vocab sets"
    ON vocab_sets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocab sets"
    ON vocab_sets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vocab sets"
    ON vocab_sets FOR DELETE
    USING (auth.uid() = user_id);

-- Vocab words policies (based on set ownership)
CREATE POLICY "Users can view words in their sets"
    ON vocab_words FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM vocab_sets
        WHERE vocab_sets.id = vocab_words.set_id
        AND vocab_sets.user_id = auth.uid()
    ));

CREATE POLICY "Users can create words in their sets"
    ON vocab_words FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM vocab_sets
        WHERE vocab_sets.id = vocab_words.set_id
        AND vocab_sets.user_id = auth.uid()
    ));

CREATE POLICY "Users can update words in their sets"
    ON vocab_words FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM vocab_sets
        WHERE vocab_sets.id = vocab_words.set_id
        AND vocab_sets.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete words in their sets"
    ON vocab_words FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM vocab_sets
        WHERE vocab_sets.id = vocab_words.set_id
        AND vocab_sets.user_id = auth.uid()
    ));

-- Learning progress policies
CREATE POLICY "Users can view their own learning progress"
    ON learning_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learning progress"
    ON learning_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress"
    ON learning_progress FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning progress"
    ON learning_progress FOR DELETE
    USING (auth.uid() = user_id);

-- Learning sessions policies
CREATE POLICY "Users can view their own learning sessions"
    ON learning_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learning sessions"
    ON learning_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning sessions"
    ON learning_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning sessions"
    ON learning_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view their own stats"
    ON user_stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stats"
    ON user_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
    ON user_stats FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stats"
    ON user_stats FOR DELETE
    USING (auth.uid() = user_id);

-- Function to automatically create user_stats on user signup
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_stats (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user_stats when a new user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_stats();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_folders_updated_at
    BEFORE UPDATE ON folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vocab_sets_updated_at
    BEFORE UPDATE ON vocab_sets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
