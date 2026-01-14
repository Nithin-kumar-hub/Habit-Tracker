/*
  # Habit Tracker Schema

  ## Overview
  This migration creates the core tables for a habit tracking application that allows users to create habits and log daily completions.

  ## New Tables
  
  ### `habits`
  Stores information about each habit to track
  - `id` (uuid, primary key) - Unique identifier for the habit
  - `name` (text) - Name of the habit (e.g., "Exercise", "Read")
  - `description` (text, optional) - Additional details about the habit
  - `color` (text) - Color code for visual identification
  - `icon` (text) - Icon name for display
  - `created_at` (timestamptz) - When the habit was created
  
  ### `habit_logs`
  Tracks daily completions of habits
  - `id` (uuid, primary key) - Unique identifier for the log entry
  - `habit_id` (uuid, foreign key) - References the habit being tracked
  - `completed_at` (date) - The date this habit was completed
  - `notes` (text, optional) - Optional notes about the completion
  - `created_at` (timestamptz) - When this log was created

  ## Security
  - Enable RLS on both tables
  - Public access policies for demo purposes (can be restricted later with auth)
  
  ## Indexes
  - Index on habit_logs(habit_id) for faster queries
  - Unique constraint on habit_logs(habit_id, completed_at) to prevent duplicate entries for the same day
*/

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#3b82f6',
  icon text DEFAULT 'target',
  created_at timestamptz DEFAULT now()
);

-- Create habit_logs table
CREATE TABLE IF NOT EXISTS habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_at date NOT NULL DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, completed_at)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_completed_at ON habit_logs(completed_at);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
CREATE POLICY "Anyone can view habits"
  ON habits FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create habits"
  ON habits FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update habits"
  ON habits FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete habits"
  ON habits FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Anyone can view habit logs"
  ON habit_logs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create habit logs"
  ON habit_logs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update habit logs"
  ON habit_logs FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete habit logs"
  ON habit_logs FOR DELETE
  TO public
  USING (true);