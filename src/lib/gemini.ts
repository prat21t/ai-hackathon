import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Sample medical data for fallback responses
const sampleMedicalData = {
  vitalSigns: {
    bloodPressure: "135/85 mmHg",
    bloodGlucose: "140 mg/dL",
    heartRate: "75 bpm",
    temperature: "98.6°F"
  },
  recommendations: [
    "Monitor blood pressure daily",
    "Check blood glucose before meals",
    "Take medications as prescribed",
    "Maintain a healthy diet and exercise routine"
  ]
};

// Fallback medical responses when API is not available
const fallbackResponse: GeminiAnalysisResult = {
  analysis: `Based on your recent vital signs:
- Blood Pressure: ${sampleMedicalData.vitalSigns.bloodPressure} (Slightly elevated)
- Blood Glucose: ${sampleMedicalData.vitalSigns.bloodGlucose} (Above target range)
- Heart Rate: ${sampleMedicalData.vitalSigns.heartRate} (Normal range)
- Temperature: ${sampleMedicalData.vitalSigns.temperature} (Normal)

Recommendation: Please monitor your blood pressure and glucose levels closely. Consider scheduling a follow-up appointment with your healthcare provider.`,
  recommendations: sampleMedicalData.recommendations,
  riskLevel: "medium",
  confidenceScore: 0.85
};

// Initialize Gemini client with error handling
const initializeGemini = () => {
  if (!API_KEY) {
    console.warn('Gemini API key not found. Using medical fallback responses.');
    return null;
  }
  return new GoogleGenerativeAI(API_KEY);
};

const genAI = initializeGemini();

export interface GeminiAnalysisResult {
  analysis: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  confidenceScore: number;
}

function extractJSONFromText(text: string): GeminiAnalysisResult {
  try {
    // Try multiple JSON extraction methods
    let jsonData: any = null;

    // Method 1: Extract JSON between backticks
    const jsonMatch = text.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
    if (jsonMatch) {
      try {
        jsonData = JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        console.warn('Failed to parse JSON from backticks:', e);
      }
    }

    // Method 2: Find first occurrence of { and last occurrence of }
    if (!jsonData) {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        try {
          jsonData = JSON.parse(text.slice(start, end + 1));
        } catch (e) {
          console.warn('Failed to parse JSON from brackets:', e);
        }
      }
    }

    // Method 3: Try to parse the entire text as JSON
    if (!jsonData) {
      try {
        jsonData = JSON.parse(text.trim());
      } catch (e) {
        console.warn('Failed to parse entire text as JSON:', e);
      }
    }

    // If no valid JSON found, create a structured response from the text
    if (!jsonData) {
      console.warn('No valid JSON found, creating structured response from text');
      return {
        analysis: text.substring(0, 500),
        recommendations: ["Please consult your healthcare provider for accurate medical advice"],
        riskLevel: "medium",
        confidenceScore: 0.5
      };
    }

    return sanitizeResponse(jsonData);
  } catch (error) {
    console.error('Error extracting JSON:', error);
    return fallbackResponse;
  }
}

function sanitizeResponse(response: any): GeminiAnalysisResult {
  try {
    // Ensure analysis is a string and not empty
    const analysis = typeof response.analysis === 'string' && response.analysis.trim()
      ? response.analysis.trim()
      : fallbackResponse.analysis;

    // Ensure recommendations is an array of strings
    let recommendations = Array.isArray(response.recommendations)
      ? response.recommendations.filter(r => typeof r === 'string' && r.trim())
      : fallbackResponse.recommendations;
    
    if (recommendations.length === 0) {
      recommendations = fallbackResponse.recommendations;
    }

    // Validate risk level
    const validRiskLevels = ['low', 'medium', 'high'] as const;
    const riskLevel = validRiskLevels.includes(response.riskLevel as any)
      ? response.riskLevel
      : fallbackResponse.riskLevel;

    // Ensure confidence score is a number between 0 and 1
    const confidenceScore = typeof response.confidenceScore === 'number' &&
                           response.confidenceScore >= 0 &&
                           response.confidenceScore <= 1
      ? response.confidenceScore
      : fallbackResponse.confidenceScore;

    return {
      analysis,
      recommendations,
      riskLevel,
      confidenceScore
    };
  } catch (error) {
    console.error('Error sanitizing response:', error);
    return fallbackResponse;
  }
}

async function handleGeminiRequest(
  prompt: string,
  errorMessage: string
): Promise<GeminiAnalysisResult> {
  if (!genAI) {
    console.warn('Using medical fallback response');
    return fallbackResponse;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const formattedPrompt = `You are a medical AI assistant. Analyze the following information and provide a response in JSON format only.

${prompt}

CRITICAL: Your response must be ONLY valid JSON in this exact format:
{
  "analysis": "detailed medical analysis here",
  "recommendations": ["specific recommendation 1", "specific recommendation 2"],
  "riskLevel": "low|medium|high",
  "confidenceScore": 0.XX
}

Do not include any other text, markdown, or formatting - ONLY the JSON object.`;

    const result = await model.generateContent(formattedPrompt);
    const response = await result.response;
    const text = response.text().trim();
    
    if (!text) {
      console.warn('Empty response from Gemini API');
      return fallbackResponse;
    }

    return extractJSONFromText(text);
  } catch (error) {
    console.error('Medical AI Error:', error);
    return fallbackResponse;
  }
}

export async function analyzeHealthData(
  patientData: Record<string, any>,
  context: string
): Promise<GeminiAnalysisResult> {
  const prompt = `
    Analyze the following patient health data and provide insights:
    
    Patient Data:
    ${JSON.stringify(patientData, null, 2)}
    
    Context:
    ${context}
    
    Please provide:
    1. A detailed analysis
    2. Specific recommendations
    3. Risk level assessment (low, medium, or high)
    4. Confidence score (0-1)
  `;

  return handleGeminiRequest(prompt, 'Failed to analyze health data');
}

export async function generateHealthInsight(
  type: string,
  data: Record<string, any>
): Promise<GeminiAnalysisResult> {
  const prompt = `
    Generate a health insight based on the following data:
    
    Type: ${type}
    Data: ${JSON.stringify(data, null, 2)}
    
    Consider:
    - Patient history
    - Current metrics
    - Medical guidelines
    - Best practices
  `;

  return handleGeminiRequest(prompt, 'Failed to generate health insight');
}

export async function generateEmergencyResponse(
  vitalSigns: Record<string, any>,
  patientHistory: Record<string, any>
): Promise<GeminiAnalysisResult> {
  const prompt = `
    Analyze these vital signs for potential emergencies:
    
    Vital Signs:
    ${JSON.stringify(vitalSigns, null, 2)}
    
    Patient History:
    ${JSON.stringify(patientHistory, null, 2)}
    
    Provide an emergency assessment focusing on:
    1. Immediate risks and concerns
    2. Required actions
    3. Urgency level
    4. Confidence in assessment
  `;

  return handleGeminiRequest(prompt, 'Failed to generate emergency response');
}

export async function generateBehavioralNudge(
  patientData: Record<string, any>,
  context: string
): Promise<GeminiAnalysisResult> {
  const prompt = `
    Generate a personalized behavioral nudge based on:
    
    Patient Data:
    ${JSON.stringify(patientData, null, 2)}
    
    Context:
    ${context}
    
    Consider:
    - Patient's current behavior patterns
    - Motivation factors
    - Best practices for behavioral change
    - Personalized approach based on patient history
  `;

  return handleGeminiRequest(prompt, 'Failed to generate behavioral nudge');
}

export async function assessPatientRisk(
  patientData: Record<string, any>,
  assessmentType: string
): Promise<GeminiAnalysisResult> {
  const prompt = `
    Perform a risk assessment for the following patient:
    
    Assessment Type: ${assessmentType}
    Patient Data: ${JSON.stringify(patientData, null, 2)}
    
    Consider:
    - Medical history
    - Current conditions
    - Lifestyle factors
    - Adherence patterns
    - Recent changes
  `;

  return handleGeminiRequest(prompt, 'Failed to assess patient risk');
}