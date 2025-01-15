import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Heart, Activity, Pill, Brain, RefreshCw, AlertCircle } from 'lucide-react';
import { generateHealthInsight } from '../lib/gemini';
import { 
  sampleVitalSigns, 
  sampleHealthGoals, 
  sampleLabResults, 
  sampleMedications,
  samplePatients 
} from '../data/sampleData';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'info' | 'warning' | 'success' | 'error';
  suggestions?: string[];
}

export function ChatbotInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          text: "👋 Hello! I'm your healthcare assistant. I can help you with:",
          sender: 'bot',
          timestamp: new Date(),
          suggestions: [
            "Check my vital signs",
            "View my medications",
            "Show my lab results",
            "Track my health goals"
          ]
        }
      ]);
    }
  }, []);

  const getRelevantData = (userMessage: string) => {
    const message = userMessage.toLowerCase();
    const data: Record<string, any> = {
      patient: samplePatients[0],
      timestamp: new Date().toISOString()
    };

    // Include vital signs data
    if (message.includes('vital') || message.includes('blood') || 
        message.includes('pressure') || message.includes('glucose') || 
        message.includes('heart') || message.includes('temperature')) {
      data.vitalSigns = sampleVitalSigns;
    }

    // Include health goals data
    if (message.includes('goal') || message.includes('progress') || 
        message.includes('target') || message.includes('exercise')) {
      data.healthGoals = sampleHealthGoals;
    }

    // Include lab results data
    if (message.includes('lab') || message.includes('test') || 
        message.includes('result') || message.includes('hba1c')) {
      data.labResults = sampleLabResults;
    }

    // Include medication data
    if (message.includes('med') || message.includes('prescription') || 
        message.includes('drug') || message.includes('dose')) {
      data.medications = sampleMedications;
    }

    return data;
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSend(suggestion);
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const relevantData = getRelevantData(messageText);
      const result = await generateHealthInsight('chatbot_response', {
        userMessage: messageText,
        messageHistory: messages.slice(-5),
        ...relevantData
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.analysis,
        sender: 'bot',
        timestamp: new Date(),
        type: result.riskLevel as 'info' | 'warning' | 'error',
        suggestions: result.recommendations
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to generate response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error. Please try asking your question again.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getMessageStyle = (message: Message) => {
    const baseStyle = "max-w-[80%] rounded-lg p-3";
    if (message.sender === 'user') {
      return `${baseStyle} bg-blue-500 text-white`;
    }
    
    switch (message.type) {
      case 'warning':
        return `${baseStyle} bg-yellow-50 text-yellow-800 border border-yellow-200`;
      case 'error':
        return `${baseStyle} bg-red-50 text-red-800 border border-red-200`;
      case 'success':
        return `${baseStyle} bg-green-50 text-green-800 border border-green-200`;
      default:
        return `${baseStyle} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-[500px] flex flex-col border border-gray-200">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center space-x-2">
        <Heart className="w-6 h-6 text-blue-500" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Healthcare Assistant</h3>
          <p className="text-xs text-gray-500">AI-powered medical support</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={getMessageStyle(message)}>
              <div className="flex items-center space-x-2 mb-1">
                {message.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                <span className="text-xs opacity-75">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm whitespace-pre-line">{message.text}</p>
              
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs px-3 py-1 bg-white rounded-full border border-gray-200 
                               hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Brain className="w-4 h-4" />
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your health, medications, or vital signs..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                     focus:ring-blue-500 bg-white"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                     flex items-center space-x-2"
          >
            {isTyping ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}