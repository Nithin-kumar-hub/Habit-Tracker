/*
  # Remove Unused Index

  ## Overview
  Drop the unused idx_habits_user_id index that is not being utilized by queries.
  
  ## Changes
  - Drop idx_habits_user_id index from habits table
  - Reduces unnecessary database overhead
*/

DROP INDEX IF EXISTS idx_habits_user_id;
