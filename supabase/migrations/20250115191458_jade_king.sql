/*
  # Fix notifications RLS policies

  1. Changes
    - Drop existing RLS policies for notifications table
    - Create new RLS policies with proper user_id checks
    - Add NOT NULL constraint to user_id column
    - Add index on user_id for better performance

  2. Security
    - Enable RLS on notifications table
    - Add policies for CRUD operations
    - Ensure users can only access their own notifications
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- Ensure user_id is NOT NULL
ALTER TABLE notifications 
ALTER COLUMN user_id SET NOT NULL;

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
ON notifications(user_id);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);