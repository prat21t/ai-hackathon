/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (bigint, primary key)
      - `type` (text)
      - `message` (text)
      - `date` (timestamptz)
      - `priority` (text)
      - `category` (text)
      - `status` (text)
      - `ai_suggestion` (text)
      - `follow_up_action` (text)
      - `adherence_rate` (integer)
      - `ai_features` (jsonb)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `notifications` table
    - Add policies for authenticated users to manage their notifications
*/

CREATE TABLE notifications (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  type text NOT NULL,
  message text NOT NULL,
  date timestamptz NOT NULL,
  priority text NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  ai_suggestion text,
  follow_up_action text,
  adherence_rate integer,
  ai_features jsonb,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own notifications
CREATE POLICY "Users can insert own notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);