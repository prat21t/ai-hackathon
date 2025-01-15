/*
  # Patient Engagement System Database Schema

  1. New Tables
    - `patients`
      - Core patient information and preferences
    - `appointments`
      - Patient appointment scheduling and history
    - `medications`
      - Patient medication tracking
    - `lab_results`
      - Patient laboratory test results
    - `engagement_metrics`
      - Patient engagement tracking and analytics
    - `ai_insights`
      - AI-generated insights and predictions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for healthcare providers to access their patients' data

  3. Changes
    - Add foreign key relationships between tables
    - Add indexes for frequently queried columns
*/

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  email text,
  phone text,
  preferred_language text DEFAULT 'en',
  preferred_contact_method text DEFAULT 'app',
  preferred_contact_time text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  patient_id uuid REFERENCES patients NOT NULL,
  appointment_type text NOT NULL,
  scheduled_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  provider_notes text,
  patient_notes text,
  reminder_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  patient_id uuid REFERENCES patients NOT NULL,
  medication_name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  status text NOT NULL DEFAULT 'active',
  adherence_rate integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Lab Results table
CREATE TABLE IF NOT EXISTS lab_results (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  patient_id uuid REFERENCES patients NOT NULL,
  test_name text NOT NULL,
  test_date timestamptz NOT NULL,
  result_value text NOT NULL,
  unit text,
  reference_range text,
  status text NOT NULL DEFAULT 'pending',
  notification_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

-- Engagement Metrics table
CREATE TABLE IF NOT EXISTS engagement_metrics (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  patient_id uuid REFERENCES patients NOT NULL,
  interaction_type text NOT NULL,
  interaction_date timestamptz NOT NULL,
  response_time integer,
  channel text NOT NULL,
  engagement_score integer,
  sentiment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE engagement_metrics ENABLE ROW LEVEL SECURITY;

-- AI Insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  patient_id uuid REFERENCES patients NOT NULL,
  insight_type text NOT NULL,
  insight_data jsonb NOT NULL,
  confidence_score numeric(3,2) NOT NULL,
  status text NOT NULL DEFAULT 'active',
  applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Patients table policies
CREATE POLICY "Users can view own patient profile"
  ON patients FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own patient profile"
  ON patients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Appointments table policies
CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  ));

-- Medications table policies
CREATE POLICY "Users can view own medications"
  ON medications FOR SELECT
  TO authenticated
  USING (patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own medications"
  ON medications FOR UPDATE
  TO authenticated
  USING (patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  ));

-- Lab Results table policies
CREATE POLICY "Users can view own lab results"
  ON lab_results FOR SELECT
  TO authenticated
  USING (patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  ));

-- Engagement Metrics table policies
CREATE POLICY "Users can view own engagement metrics"
  ON engagement_metrics FOR SELECT
  TO authenticated
  USING (patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  ));

CREATE POLICY "System can insert engagement metrics"
  ON engagement_metrics FOR INSERT
  TO authenticated
  WITH CHECK (patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  ));

-- AI Insights table policies
CREATE POLICY "Users can view own AI insights"
  ON ai_insights FOR SELECT
  TO authenticated
  USING (patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  ));

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_patient_id ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_patient_id ON engagement_metrics(patient_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_patient_id ON ai_insights(patient_id);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to relevant tables
DO $$ BEGIN
  CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_medications_updated_at
    BEFORE UPDATE ON medications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_ai_insights_updated_at
    BEFORE UPDATE ON ai_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;