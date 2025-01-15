import React from 'react';
import { Target, TrendingUp, Award, Calendar, CheckCircle } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  target: string;
  progress: number;
  dueDate: string;
  category: 'exercise' | 'nutrition' | 'medication' | 'wellness';
}

interface HealthGoalsProps {
  goals: Goal[];
  onUpdateProgress: (goalId: string, progress: number) => void;
}

export function HealthGoals({ goals, onUpdateProgress }: HealthGoalsProps) {
  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'exercise':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'nutrition':
        return <Award className="w-5 h-5 text-green-500" />;
      case 'medication':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'wellness':
        return <Target className="w-5 h-5 text-orange-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Health Goals</h2>
        <button className="text-sm text-blue-600 hover:text-blue-800">
          Add New Goal
        </button>
      </div>

      <div className="space-y-6">
        {goals.map((goal) => (
          <div key={goal.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getCategoryIcon(goal.category)}
                <div>
                  <h3 className="font-medium text-gray-900">{goal.title}</h3>
                  <p className="text-sm text-gray-500">Target: {goal.target}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                Due: {new Date(goal.dueDate).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progress: {goal.progress}%
                </span>
                {goal.progress === 100 && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}