import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Notification } from '../types';
import { generateEmergencyResponse, generateBehavioralNudge } from '../lib/gemini';

interface NotificationStore {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: string | null;
  searchQuery: string;
  fetchNotifications: () => Promise<void>;
  markAsComplete: (id: number) => Promise<void>;
  dismissNotification: (id: number) => Promise<void>;
  updateAdherenceRate: (id: number, rate: number) => Promise<void>;
  recordPatientResponse: (id: number, response: string) => Promise<void>;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  updateEngagementMetrics: (id: number, metrics: Notification['engagementMetrics']) => Promise<void>;
  createEmergencyAlert: (vitalSigns: Record<string, any>, patientHistory: Record<string, any>) => Promise<void>;
  createBehavioralNudge: (patientData: Record<string, any>, context: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,
  selectedCategory: null,
  searchQuery: '',

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // If no user is logged in, use demo data
      if (!user) {
        set({ 
          notifications: [], 
          isLoading: false 
        });
        return;
      }

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      const { selectedCategory, searchQuery } = get();
      
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = query.ilike('message', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ notifications: data || [], isLoading: false });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  markAsComplete: async (id: number) => {
    set({ error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // If no user is logged in, just update local state
      if (!user) {
        const notifications = get().notifications.map(notification =>
          notification.id === id
            ? { 
                ...notification, 
                status: 'completed',
                lastInteraction: new Date().toISOString()
              }
            : notification
        );
        set({ notifications });
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ 
          status: 'completed',
          lastInteraction: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await get().fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as complete:', error);
      set({ error: (error as Error).message });
    }
  },

  dismissNotification: async (id: number) => {
    set({ error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // If no user is logged in, just update local state
      if (!user) {
        const notifications = get().notifications.filter(
          notification => notification.id !== id
        );
        set({ notifications });
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await get().fetchNotifications();
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
      set({ error: (error as Error).message });
    }
  },

  updateAdherenceRate: async (id: number, rate: number) => {
    set({ error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // If no user is logged in, just update local state
      if (!user) {
        const notifications = get().notifications.map(notification =>
          notification.id === id
            ? { ...notification, adherenceRate: rate }
            : notification
        );
        set({ notifications });
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ adherenceRate: rate })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await get().fetchNotifications();
    } catch (error) {
      console.error('Failed to update adherence rate:', error);
      set({ error: (error as Error).message });
    }
  },

  recordPatientResponse: async (id: number, response: string) => {
    set({ error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // If no user is logged in, just update local state
      if (!user) {
        const notifications = get().notifications.map(notification =>
          notification.id === id
            ? { 
                ...notification, 
                patientResponse: response,
                lastInteraction: new Date().toISOString()
              }
            : notification
        );
        set({ notifications });
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ 
          patientResponse: response,
          lastInteraction: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await get().fetchNotifications();
    } catch (error) {
      console.error('Failed to record patient response:', error);
      set({ error: (error as Error).message });
    }
  },

  updateEngagementMetrics: async (id: number, metrics: Notification['engagementMetrics']) => {
    set({ error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // If no user is logged in, just update local state
      if (!user) {
        const notifications = get().notifications.map(notification =>
          notification.id === id
            ? { ...notification, engagementMetrics: metrics }
            : notification
        );
        set({ notifications });
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ engagementMetrics: metrics })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await get().fetchNotifications();
    } catch (error) {
      console.error('Failed to update engagement metrics:', error);
      set({ error: (error as Error).message });
    }
  },

  createEmergencyAlert: async (vitalSigns: Record<string, any>, patientHistory: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const result = await generateEmergencyResponse(vitalSigns, patientHistory);
      
      // If no user is logged in, just update local state
      if (!user) {
        const newNotification: Notification = {
          id: Date.now(),
          type: 'emergency',
          message: result.analysis,
          date: new Date().toISOString(),
          priority: 'high',
          category: 'screening',
          status: 'pending',
          aiFeatures: {
            nlpAnalysis: result.analysis,
            predictionScore: result.confidenceScore,
            riskLevel: result.riskLevel,
            recommendations: result.recommendations
          }
        };
        
        set(state => ({ 
          notifications: [newNotification, ...state.notifications],
          isLoading: false 
        }));
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .insert({
          type: 'emergency',
          message: result.analysis,
          date: new Date().toISOString(),
          priority: 'high',
          category: 'screening',
          status: 'pending',
          user_id: user.id,
          ai_features: {
            nlpAnalysis: result.analysis,
            predictionScore: result.confidenceScore,
            riskLevel: result.riskLevel,
            recommendations: result.recommendations
          }
        });

      if (error) throw error;

      await get().fetchNotifications();
    } catch (error) {
      console.error('Failed to create emergency alert:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createBehavioralNudge: async (patientData: Record<string, any>, context: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const result = await generateBehavioralNudge(patientData, context);
      
      // If no user is logged in, just update local state
      if (!user) {
        const newNotification: Notification = {
          id: Date.now(),
          type: 'behavioral_nudge',
          message: result.recommendations[0] || result.analysis,
          date: new Date().toISOString(),
          priority: 'medium',
          category: 'homecare',
          status: 'pending',
          aiFeatures: {
            nlpAnalysis: result.analysis,
            predictionScore: result.confidenceScore,
            riskLevel: result.riskLevel,
            recommendations: result.recommendations,
            chatbotSuggestion: result.recommendations[1] || 'Would you like more information about this?'
          }
        };
        
        set(state => ({ 
          notifications: [newNotification, ...state.notifications],
          isLoading: false 
        }));
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .insert({
          type: 'behavioral_nudge',
          message: result.recommendations[0] || result.analysis,
          date: new Date().toISOString(),
          priority: 'medium',
          category: 'homecare',
          status: 'pending',
          user_id: user.id,
          ai_features: {
            nlpAnalysis: result.analysis,
            predictionScore: result.confidenceScore,
            riskLevel: result.riskLevel,
            recommendations: result.recommendations,
            chatbotSuggestion: result.recommendations[1] || 'Would you like more information about this?'
          }
        });

      if (error) throw error;

      await get().fetchNotifications();
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to create behavioral nudge:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setSelectedCategory: (category: string | null) => {
    set({ selectedCategory: category });
    get().fetchNotifications();
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().fetchNotifications();
  }
}));