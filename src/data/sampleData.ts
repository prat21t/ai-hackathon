import { Patient, Medication, LabResult, Appointment, AIHealthInsight, PatientRiskAssessment, Notification } from '../types';

// Sample Patients
export const samplePatients: Patient[] = [
  {
    id: '1',
    userId: 'auth0|123',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1980-05-15',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    preferredLanguage: 'en',
    preferredContactMethod: 'email',
    preferredContactTime: '09:00-17:00',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Sample Medications
export const sampleMedications: Medication[] = [
  {
    id: 1,
    patientId: '1',
    medicationName: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    startDate: '2024-01-01',
    status: 'active',
    adherenceRate: 85,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    patientId: '1',
    medicationName: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    startDate: '2024-01-01',
    status: 'active',
    adherenceRate: 90,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Sample Lab Results
export const sampleLabResults: LabResult[] = [
  {
    id: 1,
    patientId: '1',
    testName: 'HbA1c',
    testDate: '2024-01-15T00:00:00Z',
    resultValue: '6.8',
    unit: '%',
    referenceRange: '4.0-5.6',
    status: 'completed',
    notificationSent: true,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 2,
    patientId: '1',
    testName: 'Blood Pressure',
    testDate: '2024-01-15T00:00:00Z',
    resultValue: '135/85',
    unit: 'mmHg',
    referenceRange: '120/80',
    status: 'completed',
    notificationSent: true,
    createdAt: '2024-01-15T00:00:00Z'
  }
];

// Sample Appointments
export const sampleAppointments: Appointment[] = [
  {
    id: 1,
    patientId: '1',
    appointmentType: 'Follow-up',
    scheduledTime: '2024-02-01T10:00:00Z',
    status: 'scheduled',
    providerNotes: 'Regular diabetes check-up',
    reminderSent: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Sample AI Health Insights
export const sampleHealthInsights: AIHealthInsight[] = [
  {
    id: 1,
    patientId: '1',
    insightType: 'lab_result_analysis',
    insightText: 'HbA1c levels indicate pre-diabetes range. Recommend lifestyle modifications.',
    confidenceScore: 0.85,
    dataSources: {
      labResults: ['HbA1c', 'Blood Pressure'],
      medications: ['Metformin']
    },
    recommendations: {
      diet: 'Reduce carbohydrate intake',
      exercise: 'Increase physical activity to 30 minutes daily',
      monitoring: 'Check blood glucose levels twice daily'
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

// Sample Risk Assessments
export const sampleRiskAssessments: PatientRiskAssessment[] = [
  {
    id: 1,
    patientId: '1',
    assessmentType: 'chronic_condition',
    riskScore: 0.65,
    riskFactors: {
      hba1c_elevated: 'HbA1c above target range',
      bp_elevated: 'Blood pressure slightly elevated',
      medication_adherence: 'Good medication adherence',
      lifestyle_factors: 'Moderate exercise routine'
    },
    nextAssessmentDate: '2024-03-15T00:00:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

// Sample Notifications
export const sampleNotifications: Notification[] = [
  {
    id: 1,
    type: 'lab_result',
    message: 'Your recent HbA1c test results are available',
    date: '2024-01-15T00:00:00Z',
    priority: 'medium',
    category: 'lab',
    status: 'pending',
    aiFeatures: {
      nlpAnalysis: 'Test results indicate need for lifestyle modifications',
      predictionScore: 0.75,
      riskLevel: 'medium',
      chatbotSuggestion: 'Would you like to schedule a follow-up appointment to discuss your results?',
      engagementScore: 85
    },
    engagementMetrics: {
      responseTime: 30,
      interactionCount: 2,
      preferredChannel: 'app'
    }
  },
  {
    id: 2,
    type: 'medication',
    message: 'Time to refill your Metformin prescription',
    date: '2024-01-20T00:00:00Z',
    priority: 'high',
    category: 'medication',
    status: 'pending',
    adherenceRate: 90,
    aiFeatures: {
      nlpAnalysis: 'Consistent medication adherence pattern detected',
      predictionScore: 0.85,
      riskLevel: 'low',
      chatbotSuggestion: 'Would you like me to help you schedule a prescription refill?',
      engagementScore: 90
    }
  }
];

// Sample Vital Signs
export const sampleVitalSigns = [
  {
    id: '1',
    name: 'Blood Pressure',
    value: 135,
    unit: 'mmHg',
    normalRange: {
      min: 120,
      max: 140
    },
    trend: 'stable',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Heart Rate',
    value: 75,
    unit: 'bpm',
    normalRange: {
      min: 60,
      max: 100
    },
    trend: 'stable',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Blood Glucose',
    value: 120,
    unit: 'mg/dL',
    normalRange: {
      min: 70,
      max: 130
    },
    trend: 'up',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Temperature',
    value: 98.6,
    unit: '°F',
    normalRange: {
      min: 97,
      max: 99
    },
    trend: 'stable',
    lastUpdated: new Date().toISOString()
  }
];

// Sample Health Goals
export const sampleHealthGoals = [
  {
    id: '1',
    title: 'Daily Walking',
    target: '10,000 steps',
    progress: 75,
    dueDate: '2025-01-16',
    category: 'exercise'
  },
  {
    id: '2',
    title: 'Blood Glucose Control',
    target: 'Below 140 mg/dL',
    progress: 60,
    dueDate: '2024-03-31',
    category: 'health'
  },
  {
    id: '3',
    title: 'Medication Adherence',
    target: '100% adherence',
    progress: 90,
    dueDate: '2024-03-31',
    category: 'medication'
  }
];

// Sample Emergency Contacts
export const sampleEmergencyContacts = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    relationship: 'Primary Care Physician',
    phone: '+1-555-0123',
    email: 'dr.johnson@healthcare.com',
    priority: 1
  },
  {
    id: '2',
    name: 'Mary Doe',
    relationship: 'Spouse',
    phone: '+1-555-0124',
    email: 'mary.doe@example.com',
    priority: 2
  },
  {
    id: '3',
    name: 'City General Hospital',
    relationship: 'Emergency Care',
    phone: '+1-555-0125',
    email: 'emergency@citygeneral.com',
    priority: 3
  }
];

// Sample Notification Preferences
export const sampleNotificationPreferences = [
  {
    id: '1',
    type: 'email',
    enabled: true,
    schedule: {
      start: '09:00',
      end: '18:00'
    },
    categories: ['Appointments', 'Lab Results', 'Medications']
  },
  {
    id: '2',
    type: 'sms',
    enabled: true,
    schedule: {
      start: '08:00',
      end: '20:00'
    },
    categories: ['Emergency Alerts', 'Medication Reminders']
  },
  {
    id: '3',
    type: 'push',
    enabled: true,
    schedule: {
      start: '07:00',
      end: '22:00'
    },
    categories: ['All Notifications']
  }
];
