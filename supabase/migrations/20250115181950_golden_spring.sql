/*
  # Healthcare AI Features Enhancement

  1. New Tables
    - `ai_health_insights`: Stores AI-generated health insights and recommendations
    - `patient_risk_assessments`: Tracks patient risk levels and predictions
    - `notification_templates`: Stores customizable message templates for different scenarios
  
  2. Functions
    - `generate_health_notification`: Generates personalized health notifications
    - `calculate_patient_risk_score`: Calculates risk scores based on patient data
    
  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated access
*/

-- AI Health Insights
CREATE TABLE IF NOT EXISTS ai_health_insights (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  patient_id uuid REFERENCES patients NOT NULL,
  insight_type text NOT NULL,
  insight_text text NOT NULL,
  confidence_score numeric(3,2) NOT NULL,
  data_sources jsonb,
  recommendations jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_insight_type CHECK (
    insight_type IN (
      'lab_result_analysis',
      'medication_adherence',
      'health_screening',
      'vaccination_schedule',
      'procedure_followup',
      'insurance_coverage',
      'home_care'
    )
  )
);

ALTER TABLE ai_health_insights ENABLE ROW LEVEL SECURITY;

-- Patient Risk Assessments
CREATE TABLE IF NOT EXISTS patient_risk_assessments (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  patient_id uuid REFERENCES patients NOT NULL,
  assessment_type text NOT NULL,
  risk_score numeric(3,2) NOT NULL,
  risk_factors jsonb NOT NULL,
  next_assessment_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_assessment_type CHECK (
    assessment_type IN (
      'medication_adherence',
      'appointment_attendance',
      'health_screening',
      'chronic_condition',
      'readmission'
    )
  )
);

ALTER TABLE patient_risk_assessments ENABLE ROW LEVEL SECURITY;

-- Notification Templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  template_type text NOT NULL,
  template_content text NOT NULL,
  variables jsonb NOT NULL,
  ai_rules jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_template_type CHECK (
    template_type IN (
      'lab_result',
      'vaccination',
      'procedure_followup',
      'medication_refill',
      'health_screening',
      'insurance_renewal',
      'prescription_pickup',
      'home_care'
    )
  )
);

ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Function to generate personalized health notifications
CREATE OR REPLACE FUNCTION generate_health_notification(
  p_patient_id uuid,
  p_template_type text,
  p_variables jsonb
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_template text;
  v_result text;
  v_key text;
  v_value text;
BEGIN
  -- Get the template
  SELECT template_content 
  INTO v_template
  FROM notification_templates
  WHERE template_type = p_template_type
  LIMIT 1;

  -- Replace variables in template
  v_result := v_template;
  FOR v_key, v_value IN
    SELECT * FROM jsonb_each_text(p_variables)
  LOOP
    v_result := replace(v_result, '{{' || v_key || '}}', v_value);
  END LOOP;

  RETURN v_result;
END;
$$;

-- Function to calculate patient risk score
CREATE OR REPLACE FUNCTION calculate_patient_risk_score(
  p_patient_id uuid,
  p_assessment_type text
) RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_risk_score numeric(3,2);
BEGIN
  -- Calculate base risk score
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0.1
      ELSE LEAST(1.0, COUNT(*) * 0.2)
    END INTO v_risk_score
  FROM notifications n
  WHERE n.patient_id = p_patient_id
  AND n.status = 'overdue'
  AND n.created_at > now() - interval '6 months';

  -- Adjust score based on engagement metrics
  SELECT 
    v_risk_score * 
    CASE 
      WHEN AVG(engagement_score) < 30 THEN 1.5
      WHEN AVG(engagement_score) < 60 THEN 1.2
      ELSE 1.0
    END INTO v_risk_score
  FROM engagement_metrics
  WHERE patient_id = p_patient_id
  AND created_at > now() - interval '3 months';

  RETURN v_risk_score;
END;
$$;

-- RLS Policies

-- AI Health Insights policies
CREATE POLICY "Users can view own health insights"
  ON ai_health_insights
  FOR SELECT
  TO authenticated
  USING (patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  ));

-- Patient Risk Assessments policies
CREATE POLICY "Users can view own risk assessments"
  ON patient_risk_assessments
  FOR SELECT
  TO authenticated
  USING (patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  ));

-- Notification Templates policies
CREATE POLICY "Users can view notification templates"
  ON notification_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_health_insights_patient_id 
  ON ai_health_insights(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_risk_assessments_patient_id 
  ON patient_risk_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_ai_health_insights_type 
  ON ai_health_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_patient_risk_assessments_type 
  ON patient_risk_assessments(assessment_type);

-- Add updated_at triggers
CREATE TRIGGER update_ai_health_insights_updated_at
  BEFORE UPDATE ON ai_health_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_risk_assessments_updated_at
  BEFORE UPDATE ON patient_risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();