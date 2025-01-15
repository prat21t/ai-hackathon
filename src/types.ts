export interface Notification {
  id: number;
  type: string;
  message: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  aiSuggestion?: string;
  category: 'medication' | 'appointment' | 'lab' | 'vaccination' | 'insurance' | 'homecare' | 'screening' | 'billing';
  status: 'pending' | 'completed' | 'overdue';
  followUpAction?: string;
  adherenceRate?: number;
  aiFeatures?: {
    nlpAnalysis?: string;
    predictionScore?: number;
    riskLevel?: 'low' | 'medium' | 'high';
    chatbotSuggestion?: string;
    engagementScore?: number;
    nextBestAction?: string;
    patientSentiment?: 'positive' | 'neutral' | 'negative';
  };
  patientResponse?: string;
  lastInteraction?: string;
  engagementMetrics?: {
    responseTime?: number;
    interactionCount?: number;
    preferredChannel?: 'email' | 'sms' | 'app';
    bestTimeToContact?: string;
  };
}

export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email?: string;
  phone?: string;
  preferredLanguage: string;
  preferredContactMethod: string;
  preferredContactTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIHealthInsight {
  id: number;
  patientId: string;
  insightType: 'lab_result_analysis' | 'medication_adherence' | 'health_screening' | 
               'vaccination_schedule' | 'procedure_followup' | 'insurance_coverage' | 'home_care';
  insightText: string;
  confidenceScore: number;
  dataSources?: Record<string, any>;
  recommendations?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PatientRiskAssessment {
  id: number;
  patientId: string;
  assessmentType: 'medication_adherence' | 'appointment_attendance' | 
                  'health_screening' | 'chronic_condition' | 'readmission';
  riskScore: number;
  riskFactors: Record<string, any>;
  nextAssessmentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  id: number;
  templateType: 'lab_result' | 'vaccination' | 'procedure_followup' | 
                'medication_refill' | 'health_screening' | 'insurance_renewal' | 
                'prescription_pickup' | 'home_care';
  templateContent: string;
  variables: Record<string, any>;
  aiRules?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface EngagementMetric {
  id: number;
  patientId: string;
  interactionType: string;
  interactionDate: string;
  responseTime?: number;
  channel: string;
  engagementScore: number;
  sentiment?: string;
  createdAt: string;
}

export interface AIInsight {
  id: number;
  patientId: string;
  insightType: string;
  insightData: Record<string, any>;
  confidenceScore: number;
  status: string;
  applied: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: number;
  patientId: string;
  appointmentType: string;
  scheduledTime: string;
  status: string;
  providerNotes?: string;
  patientNotes?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: number;
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: string;
  adherenceRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface LabResult {
  id: number;
  patientId: string;
  testName: string;
  testDate: string;
  resultValue: string;
  unit?: string;
  referenceRange?: string;
  status: string;
  notificationSent: boolean;
  createdAt: string;
}