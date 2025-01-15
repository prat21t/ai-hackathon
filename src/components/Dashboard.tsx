import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { useAIInsightsStore } from '../store/aiInsightsStore';
import { NotificationCard } from './NotificationCard';
import { AIInsightCard } from './AIInsightCard';
import { RiskAssessmentCard } from './RiskAssessmentCard';
import { ChatbotInterface } from './ChatbotInterface';
import { HealthGoals } from './HealthGoals';
import { EmergencyContacts } from './EmergencyContacts';
import { VitalSigns } from './VitalSigns';
import { NotificationPreferences } from './NotificationPreferences';
import { AppointmentBooking } from './AppointmentBooking';
import {
  sampleVitalSigns,
  sampleHealthGoals,
  sampleEmergencyContacts,
  sampleNotificationPreferences,
  sampleHealthInsights,
  sampleRiskAssessments,
  sampleNotifications
} from '../data/sampleData';

export function Dashboard() {
  const [showChatbot, setShowChatbot] = useState(false);
  const { notifications, createEmergencyAlert, createBehavioralNudge } = useNotificationStore();
  const { insights, riskAssessments } = useAIInsightsStore();

  const handleVitalAlert = async (vitalId: string) => {
    const vital = sampleVitalSigns.find(v => v.id === vitalId);
    if (vital) {
      await createEmergencyAlert(
        { [vital.name]: vital.value },
        { normalRange: vital.normalRange }
      );
    }
  };

  const handleGoalUpdate = async (goalId: string, progress: number) => {
    const goal = sampleHealthGoals.find(g => g.id === goalId);
    if (goal) {
      await createBehavioralNudge(
        { goalId, progress },
        `Update on ${goal.title} progress`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <VitalSigns vitals={sampleVitalSigns} onAlert={handleVitalAlert} />
          <HealthGoals goals={sampleHealthGoals} onUpdateProgress={handleGoalUpdate} />
        </div>

        <div className="mt-8">
          <AppointmentBooking />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <EmergencyContacts 
            contacts={sampleEmergencyContacts}
            onEscalate={(contactId) => {
              console.log('Escalating to contact:', contactId);
            }}
          />
          <NotificationPreferences
            channels={sampleNotificationPreferences}
            onUpdateChannel={(channelId, updates) => {
              console.log('Updating channel:', channelId, updates);
            }}
          />
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">AI Health Insights</h2>
            <div className="space-y-4">
              {sampleHealthInsights.map(insight => (
                <AIInsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              {sampleNotifications.map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Risk Assessments</h2>
            <div className="space-y-4">
              {sampleRiskAssessments.map(assessment => (
                <RiskAssessmentCard key={assessment.id} assessment={assessment} />
              ))}
            </div>
          </div>
        </div>

        {/* Chatbot */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setShowChatbot(!showChatbot)}
            className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>

        {showChatbot && (
          <div className="fixed bottom-20 right-6 w-96">
            <ChatbotInterface />
          </div>
        )}
      </div>
    </div>
  );
}