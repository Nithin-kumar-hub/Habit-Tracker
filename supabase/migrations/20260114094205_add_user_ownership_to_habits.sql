/*
  # Add User Ownership to Habits

  ## Overview
  This migration adds user ownership to the habits and habit_logs tables, allowing each user to have their own habits.

  ## Changes
  
  ### habits table
  - Add `user_id` column (uuid, references auth.users)
  - Create index on user_id for faster queries
  
  ### habit_logs table
  - No direct changes needed (cascade delete will handle it through habit_id)

  ## Security
  - Update RLS policies to restrict access to user's own habits
  - Policies now check auth.uid() against user_id
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE habits ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_habits_user_id ON habits(user_id);
  END IF;
END $$;

DROP POLICY IF EXISTS "Anyone can view habits" ON habits;
DROP POLICY IF EXISTS "Anyone can create habits" ON habits;
DROP POLICY IF EXISTS "Anyone can update habits" ON habits;
DROP POLICY IF EXISTS "Anyone can delete habits" ON habits;
DROP POLICY IF EXISTS "Anyone can view habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Anyone can create habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Anyone can update habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Anyone can delete habit logs" ON habit_logs;

CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create habits"
  ON habits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own habit logs"
  ON habit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create habit logs"
  ON habit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own habit logs"
  ON habit_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own habit logs"
  ON habit_logs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = auth.uid()
    )
  );
