import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { AIHealthInsight, PatientRiskAssessment } from '../types';
import { analyzeHealthData, generateHealthInsight, assessPatientRisk } from '../lib/gemini';

interface AIInsightsStore {
  insights: AIHealthInsight[];
  riskAssessments: PatientRiskAssessment[];
  isLoading: boolean;
  error: string | null;
  selectedInsightType: string | null;
  fetchInsights: () => Promise<void>;
  fetchRiskAssessments: () => Promise<void>;
  setSelectedInsightType: (type: string | null) => void;
  generateNewInsight: (type: string, data: Record<string, any>) => Promise<void>;
  performRiskAssessment: (patientId: string, assessmentType: string, data: Record<string, any>) => Promise<void>;
  analyzePatientData: (data: Record<string, any>, context: string) => Promise<void>;
}

export const useAIInsightsStore = create<AIInsightsStore>((set, get) => ({
  insights: [],
  riskAssessments: [],
  isLoading: false,
  error: null,
  selectedInsightType: null,

  fetchInsights: async () => {
    set({ isLoading: true });
    try {
      let query = supabase
        .from('ai_health_insights')
        .select('*')
        .order('created_at', { ascending: false });

      const { selectedInsightType } = get();
      if (selectedInsightType) {
        query = query.eq('insight_type', selectedInsightType);
      }

      const { data, error } = await query;
      if (error) throw error;

      set({ 
        insights: data as AIHealthInsight[],
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: (error as Error).message,
        isLoading: false 
      });
    }
  },

  fetchRiskAssessments: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('patient_risk_assessments')
        .select('*')
        .order('risk_score', { ascending: false });

      if (error) throw error;

      set({ 
        riskAssessments: data as PatientRiskAssessment[],
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: (error as Error).message,
        isLoading: false 
      });
    }
  },

  generateNewInsight: async (type: string, data: Record<string, any>) => {
    set({ isLoading: true });
    try {
      const result = await generateHealthInsight(type, data);
      
      const { error } = await supabase
        .from('ai_health_insights')
        .insert({
          insight_type: type,
          insight_text: result.analysis,
          confidence_score: result.confidenceScore,
          recommendations: result.recommendations,
          data_sources: data
        });

      if (error) throw error;

      get().fetchInsights();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  performRiskAssessment: async (patientId: string, assessmentType: string, data: Record<string, any>) => {
    set({ isLoading: true });
    try {
      const result = await assessPatientRisk(data, assessmentType);
      
      const { error } = await supabase
        .from('patient_risk_assessments')
        .insert({
          patient_id: patientId,
          assessment_type: assessmentType,
          risk_score: result.confidenceScore,
          risk_factors: {
            analysis: result.analysis,
            recommendations: result.recommendations,
            riskLevel: result.riskLevel
          }
        });

      if (error) throw error;

      get().fetchRiskAssessments();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  analyzePatientData: async (data: Record<string, any>, context: string) => {
    set({ isLoading: true });
    try {
      const result = await analyzeHealthData(data, context);
      
      // Store the analysis result or update UI as needed
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  setSelectedInsightType: (type: string | null) => {
    set({ selectedInsightType: type });
    get().fetchInsights();
  }
}));