-- Banking Journey Strategist Database Schema
-- Project: lmuejkfvsjscmboaayds
-- Created: 2025-10-14

-- Create implementations table
CREATE TABLE IF NOT EXISTS implementations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_implementations_user_id ON implementations(user_id);
CREATE INDEX IF NOT EXISTS idx_implementations_created_at ON implementations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_implementations_updated_at ON implementations(updated_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_implementations_updated_at ON implementations;
CREATE TRIGGER update_implementations_updated_at
    BEFORE UPDATE ON implementations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE implementations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own implementations" ON implementations;
DROP POLICY IF EXISTS "Users can create their own implementations" ON implementations;
DROP POLICY IF EXISTS "Users can update their own implementations" ON implementations;
DROP POLICY IF EXISTS "Users can delete their own implementations" ON implementations;

-- RLS Policies: Users can only access their own implementations
CREATE POLICY "Users can view their own implementations"
    ON implementations
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own implementations"
    ON implementations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own implementations"
    ON implementations
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own implementations"
    ON implementations
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON implementations TO authenticated;
GRANT ALL ON implementations TO service_role;
