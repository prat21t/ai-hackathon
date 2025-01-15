import React from 'react';
import { format } from 'date-fns';
import {
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BarChart2,
  Lightbulb,
  Shield,
} from 'lucide-react';
import { AIHealthInsight } from '../types';

interface AIInsightCardProps {
  insight: AIHealthInsight;
}

export function AIInsightCard({ insight }: AIInsightCardProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'lab_result_analysis':
        return <BarChart2 className="w-5 h-5" />;
      case 'medication_adherence':
        return <CheckCircle className="w-5 h-5" />;
      case 'health_screening':
        return <Shield className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          {getInsightIcon(insight.insightType)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {insight.insightType.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </h3>
            <div className="flex items-center space-x-1">
              <Brain className="w-4 h-4 text-purple-500" />
              <span className={`text-sm font-medium ${getConfidenceColor(insight.confidenceScore)}`}>
                {Math.round(insight.confidenceScore * 100)}% confidence
              </span>
            </div>
          </div>

          <p className="text-gray-600 mb-3">{insight.insightText}</p>

          {insight.recommendations && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Recommendations</span>
              </div>
              <ul className="space-y-2">
                {Object.entries(insight.recommendations).map(([key, value]) => (
                  <li key={key} className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    <span className="text-sm text-gray-600">{value as string}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
            <span>
              Created: {format(new Date(insight.createdAt), 'MMM d, yyyy h:mm a')}
            </span>
            {insight.dataSources && (
              <div className="flex items-center space-x-1">
                <BarChart2 className="w-4 h-4" />
                <span>{Object.keys(insight.dataSources).length} data sources</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}