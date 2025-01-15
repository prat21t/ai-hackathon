import React from 'react';
import { Heart, Activity, Thermometer, Droplets, Wind, Scale, Phone, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface VitalSign {
  id: string;
  name: string;
  value: number;
  unit: string;
  normalRange: {
    min: number;
    max: number;
  };
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface VitalSignsProps {
  vitals: VitalSign[];
  onAlert: (vitalId: string) => void;
}

const EMERGENCY_CONTACT = '+917981847657';

export function VitalSigns({ vitals, onAlert }: VitalSignsProps) {
  const getVitalIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'heart rate':
        return <Heart className="w-6 h-6 text-rose-500" />;
      case 'blood pressure':
        return <Activity className="w-6 h-6 text-indigo-500" />;
      case 'temperature':
        return <Thermometer className="w-6 h-6 text-amber-500" />;
      case 'oxygen saturation':
        return <Wind className="w-6 h-6 text-violet-500" />;
      case 'blood glucose':
        return <Droplets className="w-6 h-6 text-emerald-500" />;
      default:
        return <Scale className="w-6 h-6 text-slate-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5" />;
      case 'down':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <Minus className="w-5 h-5" />;
    }
  };

  const getStatusColor = (value: number, range: { min: number; max: number }) => {
    if (value < range.min || value > range.max) {
      return 'text-rose-600 bg-rose-50 border-rose-200 shadow-rose-100/50';
    }
    if (value === range.min || value === range.max) {
      return 'text-amber-600 bg-amber-50 border-amber-200 shadow-amber-100/50';
    }
    return 'text-emerald-600 bg-emerald-50 border-emerald-200 shadow-emerald-100/50';
  };

  const handleEmergencyCall = (vitalId: string) => {
    onAlert(vitalId);
    window.location.href = `tel:${EMERGENCY_CONTACT}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
            <Activity className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Vital Signs Monitor</h2>
            <p className="text-sm text-slate-500">
              Last updated: {new Date(vitals[0]?.lastUpdated || '').toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vitals.map((vital) => {
          const isAbnormal = vital.value < vital.normalRange.min || vital.value > vital.normalRange.max;
          return (
            <div 
              key={vital.id} 
              className={`relative rounded-xl p-6 border-2 transition-all duration-300 ${
                isAbnormal 
                  ? 'border-rose-200 bg-gradient-to-br from-rose-50/50 to-white shadow-lg shadow-rose-100/50' 
                  : 'border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${
                    isAbnormal 
                      ? 'bg-gradient-to-br from-rose-100 to-rose-50' 
                      : 'bg-gradient-to-br from-indigo-50 to-blue-50'
                  }`}>
                    {getVitalIcon(vital.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{vital.name}</h3>
                    <div className={`flex items-center space-x-2 text-sm ${
                      vital.trend === 'up' ? 'text-rose-600' :
                      vital.trend === 'down' ? 'text-indigo-600' :
                      'text-slate-600'
                    }`}>
                      {getTrendIcon(vital.trend)}
                      <span className="capitalize">{vital.trend}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className={`px-5 py-3 rounded-xl border-2 ${getStatusColor(vital.value, vital.normalRange)}`}>
                  <span className="text-3xl font-bold tracking-tight">
                    {vital.value}
                  </span>
                  <span className="ml-1 text-sm font-medium">
                    {vital.unit}
                  </span>
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-medium">Normal Range:</span>
                  <br />
                  {vital.normalRange.min}-{vital.normalRange.max} {vital.unit}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex mb-2 items-center justify-between">
                  <div className="text-xs font-medium text-slate-500">Range Indicator</div>
                </div>
                <div className="h-2.5 relative bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${((vital.value - vital.normalRange.min) / 
                      (vital.normalRange.max - vital.normalRange.min)) * 100}%`
                    }}
                    className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                      isAbnormal 
                        ? 'bg-gradient-to-r from-rose-500 to-rose-400' 
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    }`}
                  />
                </div>
              </div>

              {isAbnormal && (
                <button
                  onClick={() => handleEmergencyCall(vital.id)}
                  className="mt-6 w-full py-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 
                           hover:to-rose-600 text-white rounded-xl transition-all duration-300
                           flex items-center justify-center space-x-3 shadow-lg shadow-rose-200/50
                           transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <AlertTriangle className="w-5 h-5" />
                  <Phone className="w-5 h-5" />
                  <span className="font-semibold">Alert Medical Team ({EMERGENCY_CONTACT})</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}