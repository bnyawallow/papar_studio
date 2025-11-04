-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (handled by Lucia auth)
-- This table will be created automatically by Lucia

-- Create user_sessions table (handled by Lucia auth)
-- This table will be created automatically by Lucia

-- Create projects table for storing editor projects
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  data JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- Create index on slug for faster lookups
CREATE INDEX idx_projects_slug ON projects(slug);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own projects and public projects
CREATE POLICY "Users can view own and public projects" ON projects
  FOR SELECT USING (
    auth.uid()::text = user_id OR is_public = TRUE
  );

-- Policy: Users can insert their own projects
CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own projects
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Policy: Users can delete their own projects
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid()::text = user_id);