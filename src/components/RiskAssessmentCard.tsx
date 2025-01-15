import React from 'react';
import { format } from 'date-fns';
import {
  AlertTriangle,
  Calendar,
  TrendingUp,
  List,
  Shield,
  Clock,
} from 'lucide-react';
import { PatientRiskAssessment } from '../types';

interface RiskAssessmentCardProps {
  assessment: PatientRiskAssessment;
}

export function RiskAssessmentCard({ assessment }: RiskAssessmentCardProps) {
  const getRiskColor = (score: number) => {
    if (score >= 0.7) return 'bg-red-100 text-red-800';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 0.7) return 'High Risk';
    if (score >= 0.4) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-lg ${getRiskColor(assessment.riskScore)}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {assessment.assessmentType.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(assessment.riskScore)}`}>
              {getRiskLabel(assessment.riskScore)}
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-700">Risk Score:</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div 
                  className={`h-full rounded-full ${
                    assessment.riskScore >= 0.7 ? 'bg-red-500' :
                    assessment.riskScore >= 0.4 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${assessment.riskScore * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {Math.round(assessment.riskScore * 100)}%
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <List className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-700">Risk Factors</span>
            </div>
            <ul className="space-y-2">
              {Object.entries(assessment.riskFactors).map(([key, value]) => (
                <li key={key} className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-gray-500 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    {key.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}: {value as string}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>
                Assessed: {format(new Date(assessment.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
            {assessment.nextAssessmentDate && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Next Assessment: {format(new Date(assessment.nextAssessmentDate), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}