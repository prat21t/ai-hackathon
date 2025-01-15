import React, { useState } from 'react';
import { Calendar, Clock, Stethoscope, AlertCircle, Brain, RefreshCw } from 'lucide-react';
import { generateHealthInsight } from '../lib/gemini';
import { useNotificationStore } from '../store/notificationStore';
import { samplePatients } from '../data/sampleData';

interface TimeSlot {
  time: string;
  available: boolean;
}

const appointmentTypes = [
  { id: 'checkup', name: 'Regular Check-up', duration: 30 },
  { id: 'followup', name: 'Follow-up Visit', duration: 20 },
  { id: 'consultation', name: 'Consultation', duration: 45 },
  { id: 'labReview', name: 'Lab Results Review', duration: 15 },
];

const timeSlots: TimeSlot[] = Array.from({ length: 16 }, (_, i) => ({
  time: `${Math.floor(i/2) + 9}:${i%2 === 0 ? '00' : '30'}`,
  available: Math.random() > 0.3
}));

export function AppointmentBooking() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('');
  const [aiRecommendation, setAiRecommendation] = useState<string>('');
  const [paraphrasedDescription, setParaphrasedDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isParaphrasing, setIsParaphrasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createBehavioralNudge } = useNotificationStore();

  const handleSymptomChange = async (value: string) => {
    setSymptoms(value);
    setError(null);
    
    if (value.length > 10) {
      setIsLoading(true);
      try {
        const result = await generateHealthInsight('appointment_recommendation', {
          symptoms: value,
          patientHistory: samplePatients[0],
          appointmentTypes
        });

        setAiRecommendation(result.analysis);
        
        // Generate paraphrased description
        const paraphraseResult = await generateHealthInsight('paraphrase_symptoms', {
          symptoms: value,
          context: 'medical_appointment'
        });
        
        setParaphrasedDescription(paraphraseResult.analysis);

        // If AI suggests a specific appointment type, pre-select it
        const suggestedType = appointmentTypes.find(type => 
          result.analysis.toLowerCase().includes(type.name.toLowerCase())
        );
        if (suggestedType) {
          setSelectedType(suggestedType.id);
        }
      } catch (error) {
        console.error('Failed to get AI recommendation:', error);
        setError('Unable to analyze symptoms. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleParaphrase = async () => {
    if (!symptoms.trim()) return;
    
    setIsParaphrasing(true);
    setError(null);
    try {
      const result = await generateHealthInsight('paraphrase_symptoms', {
        symptoms,
        context: 'medical_appointment'
      });
      setParaphrasedDescription(result.analysis);
    } catch (error) {
      console.error('Failed to paraphrase symptoms:', error);
      setError('Unable to rephrase symptoms. Please try again.');
    } finally {
      setIsParaphrasing(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedType || !selectedTime) {
      setError('Please select all required appointment details.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const appointmentType = appointmentTypes.find(type => type.id === selectedType);
      if (!appointmentType) {
        throw new Error('Invalid appointment type selected');
      }

      // Create appointment notification
      await createBehavioralNudge(
        {
          type: 'appointment',
          appointmentDetails: {
            type: appointmentType.name,
            date: selectedDate,
            time: selectedTime,
            duration: appointmentType.duration
          },
          symptoms: {
            original: symptoms,
            paraphrased: paraphrasedDescription
          },
          patient: {
            id: samplePatients[0].id,
            name: `${samplePatients[0].firstName} ${samplePatients[0].lastName}`
          },
          aiRecommendation: aiRecommendation
        },
        'New appointment scheduled'
      );

      // Reset form
      setSelectedDate('');
      setSelectedType('');
      setSelectedTime('');
      setSymptoms('');
      setAiRecommendation('');
      setParaphrasedDescription('');

      alert('Appointment booked successfully! You will receive a notification with the details.');
    } catch (error) {
      console.error('Failed to book appointment:', error);
      setError('Failed to book appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold">Book an Appointment</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Symptoms Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your symptoms or reason for visit
          </label>
          <div className="space-y-2">
            <textarea
              value={symptoms}
              onChange={(e) => handleSymptomChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="E.g., Experiencing frequent headaches and dizziness..."
            />
            <button
              onClick={handleParaphrase}
              disabled={!symptoms.trim() || isParaphrasing}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400"
            >
              <RefreshCw className={`w-4 h-4 ${isParaphrasing ? 'animate-spin' : ''}`} />
              <span>Rephrase description</span>
            </button>
          </div>
        </div>

        {/* Paraphrased Description */}
        {paraphrasedDescription && (
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">Medical Description</span>
            </div>
            <p className="text-sm text-gray-700">{paraphrasedDescription}</p>
          </div>
        )}

        {/* AI Recommendation */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-600">
            <Brain className="w-5 h-5 animate-pulse" />
            <span>Analyzing symptoms...</span>
          </div>
        )}
        
        {aiRecommendation && (
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">AI Recommendation</span>
            </div>
            <p className="text-sm text-blue-900">{aiRecommendation}</p>
          </div>
        )}

        {/* Appointment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            {appointmentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-3 rounded-md border text-left ${
                  selectedType === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-medium">{type.name}</div>
                    <div className="text-sm text-gray-500">{type.duration} min</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Time
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={`p-2 rounded-md text-center ${
                    selectedTime === slot.time
                      ? 'bg-blue-500 text-white'
                      : slot.available
                      ? 'bg-white border hover:border-blue-300'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{slot.time}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Important Notes */}
        <div className="bg-yellow-50 p-4 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Important Notes</span>
          </div>
          <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
            <li>Please arrive 15 minutes before your appointment</li>
            <li>Bring any relevant medical records or test results</li>
            <li>Wear a mask during your visit</li>
            <li>Reschedule if you have any COVID-19 symptoms</li>
          </ul>
        </div>

        {/* Book Button */}
        <button
          onClick={handleBookAppointment}
          disabled={!selectedDate || !selectedType || !selectedTime || isLoading}
          className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Booking...</span>
            </>
          ) : (
            <span>Book Appointment</span>
          )}
        </button>
      </div>
    </div>
  );
}