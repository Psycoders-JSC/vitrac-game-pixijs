-- Supabase Database Structure for Jam Invader
-- Run this in Supabase SQL Editor to create the high_scores table

CREATE TABLE IF NOT EXISTS high_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_high_scores_score ON high_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_high_scores_created_at ON high_scores(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_high_scores_updated_at
    BEFORE UPDATE ON high_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Allow public read on high_scores" ON high_scores
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on high_scores" ON high_scores
  FOR INSERT WITH CHECK (true);
