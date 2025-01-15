import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Bell,
  Calendar,
  Pill,
  Syringe,
  FlaskConical,
  Shield,
  Home,
  AlertCircle,
  Clock,
  Stethoscope,
  Activity,
  Brain,
  TrendingUp,
  Bot,
  CheckCircle2,
  XCircle,
  Trash2,
  Check,
  MessageCircle,
  BarChart2,
} from 'lucide-react';
import { Notification } from '../types';
import { useNotificationStore } from '../store/notificationStore';

interface NotificationCardProps {
  notification: Notification;
}

export function NotificationCard({ notification }: NotificationCardProps) {
  const { markAsComplete, dismissNotification, recordPatientResponse } = useNotificationStore();
  const [showResponseInput, setShowResponseInput] = useState(false);
  const [response, setResponse] = useState('');

  const handleSubmitResponse = () => {
    if (response.trim()) {
      recordPatientResponse(notification.id, response);
      setShowResponseInput(false);
      setResponse('');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Pill className="w-5 h-5" />;
      case 'appointment':
        return <Calendar className="w-5 h-5" />;
      case 'lab':
        return <FlaskConical className="w-5 h-5" />;
      case 'insurance':
        return <Shield className="w-5 h-5" />;
      case 'homecare':
        return <Home className="w-5 h-5" />;
      case 'screening':
        return <Stethoscope className="w-5 h-5" />;
      case 'vaccination':
        return <Syringe className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getAIFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'nlp':
        return <Brain className="w-4 h-4" />;
      case 'prediction':
        return <TrendingUp className="w-4 h-4" />;
      case 'chatbot':
        return <Bot className="w-4 h-4" />;
      case 'engagement':
        return <BarChart2 className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span className="text-xs font-medium">Completed</span>
          </div>
        );
      case 'overdue':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-full">
            <XCircle className="w-3 h-3" />
            <span className="text-xs font-medium">Overdue</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-medium">Pending</span>
          </div>
        );
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <div className={`rounded-full p-2 ${getPriorityColor(notification.priority)}`}>
          {getIcon(notification.type)}
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900">{notification.message}</h3>
              {getStatusBadge(notification.status)}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {format(new Date(notification.date), 'MMM d, yyyy h:mm a')}
              </span>
              <button
                onClick={() => setShowResponseInput(!showResponseInput)}
                className="p-1 hover:bg-blue-50 rounded-full"
                title="Respond"
              >
                <MessageCircle className="w-4 h-4 text-blue-600" />
              </button>
              {notification.status !== 'completed' && (
                <button
                  onClick={() => markAsComplete(notification.id)}
                  className="p-1 hover:bg-green-50 rounded-full"
                  title="Mark as complete"
                >
                  <Check className="w-4 h-4 text-green-600" />
                </button>
              )}
              <button
                onClick={() => dismissNotification(notification.id)}
                className="p-1 hover:bg-red-50 rounded-full"
                title="Dismiss notification"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>

          {showResponseInput && (
            <div className="mt-2">
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type your response..."
                rows={2}
              />
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setShowResponseInput(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitResponse}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Send Response
                </button>
              </div>
            </div>
          )}

          {notification.adherenceRate && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-500">Adherence Rate:</div>
                <div className="w-24 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${notification.adherenceRate}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700">{notification.adherenceRate}%</span>
              </div>
            </div>
          )}

          {notification.aiFeatures && (
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="flex items-center space-x-1 mb-1">
                    {getAIFeatureIcon('nlp')}
                    <span className="text-xs font-medium text-blue-700">NLP Analysis</span>
                  </div>
                  <p className="text-xs text-gray-600">{notification.aiFeatures.nlpAnalysis}</p>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <div className="flex items-center space-x-1 mb-1">
                    {getAIFeatureIcon('prediction')}
                    <span className="text-xs font-medium text-purple-700">Risk Score</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${notification.aiFeatures.predictionScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-purple-700">
                      {Math.round(notification.aiFeatures.predictionScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {notification.aiFeatures.engagementScore !== undefined && (
                <div className="bg-indigo-50 p-2 rounded">
                  <div className="flex items-center space-x-1 mb-1">
                    {getAIFeatureIcon('engagement')}
                    <span className="text-xs font-medium text-indigo-700">Engagement Score</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${notification.aiFeatures.engagementScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-indigo-700">
                      {notification.aiFeatures.engagementScore}%
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-green-50 p-2 rounded">
                <div className="flex items-center space-x-1 mb-1">
                  {getAIFeatureIcon('chatbot')}
                  <span className="text-xs font-medium text-green-700">AI Assistant</span>
                </div>
                <p className="text-xs text-gray-600">{notification.aiFeatures.chatbotSuggestion}</p>
              </div>
            </div>
          )}

          {notification.aiSuggestion && (
            <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded">
              <div className="flex items-center mb-1">
                <Activity className="w-4 h-4 text-blue-500 mr-2" />
                <span className="font-medium">AI Insight:</span>
              </div>
              {notification.aiSuggestion}
            </div>
          )}

          {notification.followUpAction && (
            <div className="mt-2 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Next Step: {notification.followUpAction}</span>
            </div>
          )}

          {notification.engagementMetrics && (
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Response Time: {notification.engagementMetrics.responseTime}min</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>Interactions: {notification.engagementMetrics.interactionCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}