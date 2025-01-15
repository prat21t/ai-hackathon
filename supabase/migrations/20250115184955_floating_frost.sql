/*
  # Add AI Features to Notifications Table

  1. Changes
    - Add aiFeatures column to notifications table
    - Update existing notifications to have default AI features
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add aiFeatures column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'ai_features'
  ) THEN
    ALTER TABLE notifications 
    ADD COLUMN ai_features jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create an index on the new column for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_ai_features 
ON notifications USING gin(ai_features);

-- Update existing notifications with default AI features
UPDATE notifications 
SET ai_features = '{
  "nlpAnalysis": "Pending analysis",
  "predictionScore": 0.5,
  "riskLevel": "medium",
  "chatbotSuggestion": "Would you like more information about this notification?",
  "engagementScore": 50
}'::jsonb
WHERE ai_features IS NULL;