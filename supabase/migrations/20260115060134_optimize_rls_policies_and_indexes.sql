/*
  # Optimize RLS Policies and Remove Unused Indexes

  ## Overview
  This migration improves performance by:
  1. Replacing direct auth.uid() calls with (select auth.uid()) in RLS policies
  2. Removing unused indexes that aren't providing value

  ## Performance Improvements
  Using (select auth.uid()) prevents re-evaluation of the function for each row,
  significantly improving query performance at scale.
  
  ## Changes
  - Updated all RLS policies on habits and habit_logs tables
  - Dropped unused indexes: idx_habit_logs_habit_id, idx_habit_logs_completed_at, idx_habits_user_id
*/

DROP POLICY IF EXISTS "Users can view own habits" ON habits;
DROP POLICY IF EXISTS "Users can create habits" ON habits;
DROP POLICY IF EXISTS "Users can update own habits" ON habits;
DROP POLICY IF EXISTS "Users can delete own habits" ON habits;

DROP POLICY IF EXISTS "Users can view own habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Users can create habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Users can update own habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Users can delete own habit logs" ON habit_logs;

CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create habits"
  ON habits FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can view own habit logs"
  ON habit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create habit logs"
  ON habit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own habit logs"
  ON habit_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete own habit logs"
  ON habit_logs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = (select auth.uid())
    )
  );

DROP INDEX IF EXISTS idx_habit_logs_habit_id;
DROP INDEX IF EXISTS idx_habit_logs_completed_at;
DROP INDEX IF EXISTS idx_habits_user_id;

CREATE INDEX idx_habits_user_id ON habits(user_id);
