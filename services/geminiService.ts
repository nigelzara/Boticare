
import { GoogleGenAI, Modality, GenerateContentResponse, Part } from "@google/genai";
import { Appointment, ChatMessage, AvailabilitySlot, PrescriptionRefillRequest } from "../types";
import { supabase } from "./supabaseClient";

if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set. Gemini AI features will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'MISSING_API_KEY' });

interface GroundingOptions {
    useSearch?: boolean;
    useMaps?: boolean;
    latitude?: number;
    longitude?: number;
}

const getCurrentTimestamp = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const getAIResponse = async (userMessage: string, imagePart: Part | null, grounding: GroundingOptions): Promise<ChatMessage> => {
  try {
    const contents: { parts: Part[] } = { parts: [] };
    if (imagePart) {
        contents.parts.push(imagePart);
    }
    contents.parts.push({ text: userMessage });

    const tools: any[] = [];
    let toolConfig: any = {};

    if (grounding.useSearch) {
        tools.push({ googleSearch: {} });
    }
    if (grounding.useMaps) {
        tools.push({ googleMaps: {} });
        if (grounding.latitude && grounding.longitude) {
            toolConfig.retrievalConfig = {
                latLng: {
                    latitude: grounding.latitude,
                    longitude: grounding.longitude
                }
            };
        }
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      ...(tools.length > 0 && { config: { tools }, ...(Object.keys(toolConfig).length > 0 && { toolConfig }) }),
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks.map((chunk: any) => ({
      uri: chunk.web?.uri || chunk.maps?.uri || '#',
      title: chunk.web?.title || chunk.maps?.title || 'Source'
    }));
    
    return {
        sender: 'ai',
        text: response.text || "I'm having trouble understanding. Could you rephrase?",
        sources: sources.length > 0 ? sources : undefined,
        timestamp: getCurrentTimestamp(),
    };
  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    return { 
        sender: 'ai', 
        text: "I'm sorry, but I'm having trouble connecting right now. Please try again later.",
        timestamp: getCurrentTimestamp(),
    };
  }
};

export const getWordSuggestions = async (inputText: string, chatHistory: ChatMessage[]): Promise<string[]> => {
  if (!inputText.trim() && chatHistory.length < 2) {
    return ["How are you feeling?", "Updates on tests?", "Next appointment?"];
  }
  try {
    const relevantHistory = chatHistory.slice(-5);
    const historyText = relevantHistory
      .map(msg => `${msg.sender}: ${msg.text}`)
      .join('\n');

    const prompt = `You are a medical predictive text assistant. Based on this conversation history, suggest 3 short, professional replies or follow-up questions (under 5 words each).

Conversation:
${historyText}

Current user input: "${inputText}"

Return ONLY a comma-separated list of 3 suggestions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: { parts: [{ text: prompt }] },
    });

    const suggestionsText = response.text?.trim();
    if (!suggestionsText) return [];
    
    return suggestionsText.split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(s => s);
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return ["Thank you.", "I understand.", "Please let me know."];
  }
};

export const getAppointmentSummary = async (appointment: Appointment): Promise<string> => {
  try {
    const prompt = `Generate a professional medical summary of a patient's consultation (~300 words).
    
    Patient: ${appointment.patientName}
    Professional: ${appointment.doctorName} (${appointment.specialty})
    Date: ${appointment.date}, ${appointment.time}
    Notes: "${appointment.notes}"
    
    Include: Discussion points, diagnoses, treatment plan, and next steps.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] },
    });
    return response.text || "No summary available.";
  } catch (error) {
    console.error("Error generating appointment summary:", error);
    return "Could not generate summary at this time.";
  }
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType } },
                    { text: prompt },
                ],
            },
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        return null;
    } catch (error) {
        console.error("Error editing image:", error);
        return null;
    }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say cheerfully: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

export const analyzeVideo = async (videoFile: File, prompt: string): Promise<string> => {
    try {
        const base64Video = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result.split(',')[1]);
                } else {
                    resolve('');
                }
            };
            reader.readAsDataURL(videoFile);
        });

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64Video, mimeType: videoFile.type } },
                    { text: prompt },
                ],
            },
        });
        return response.text || "I couldn't analyze the video.";
    } catch (error) {
        console.error("Error analyzing video:", error);
        return "Error analyzing video.";
    }
};

export const generateHealthReport = async (healthData: any, startDate: string, endDate: string): Promise<string> => {
    try {
        const prompt = `As a healthcare professional AI, generate a comprehensive patient health report for the period ${startDate} to ${endDate}.
        
        Data:
        - Patient: ${healthData.patientName}
        - Metrics: ${JSON.stringify(healthData.metrics)}
        - Medications: ${JSON.stringify(healthData.medications)}
        - Appointments: ${JSON.stringify(healthData.appointments)}

        Generate a structured medical report with Summary, Key Trends, and Recommendations. Use professional markdown formatting.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });

        return response.text || "No report generated.";
    } catch (error) {
        console.error("Error generating health report:", error);
        return "Could not generate the health report at this time.";
    }
};

/**
 * DATABASE SERVICES (Supabase)
 */

export const getProfessionalAvailability = async (professionalId: string): Promise<AvailabilitySlot[]> => {
    if (!supabase) return [];
    try {
        const { data, error } = await supabase
            .from('professional_availability')
            .select('*')
            .eq('professional_id', professionalId);
        
        if (error) throw error;
        
        return data.map(slot => ({
            id: slot.id,
            dayOfWeek: slot.day_of_week,
            startTime: slot.start_time,
            endTime: slot.end_time,
        }));
    } catch (error) {
        console.error("Error fetching availability:", error);
        return [];
    }
};

export const saveProfessionalAvailability = async (professionalId: string, slots: AvailabilitySlot[]): Promise<boolean> => {
    if (!supabase) return false;
    try {
        // First, clear existing availability for this professional
        const { error: deleteError } = await supabase
            .from('professional_availability')
            .delete()
            .eq('professional_id', professionalId);
        
        if (deleteError) throw deleteError;

        if (slots.length === 0) return true;

        // Map to DB schema
        const slotsToInsert = slots.map(slot => ({
            professional_id: professionalId,
            day_of_week: slot.dayOfWeek,
            start_time: slot.startTime,
            end_time: slot.endTime,
        }));

        const { error: insertError } = await supabase
            .from('professional_availability')
            .insert(slotsToInsert);
        
        if (insertError) throw insertError;
        return true;
    } catch (error) {
        console.error("Error saving availability:", error);
        return false;
    }
};

export const updateRefillRequest = async (requestId: string | number, updates: {drugName?: string, dosage?: string, status?: 'pending' | 'approved' | 'declined', scheduledTime?: string}): Promise<boolean> => {
    // If the requestId is a number, it implies it's from the mock data (constants.ts).
    // In this case, we simulate a successful update without hitting the DB to avoid UUID mismatch errors.
    if (typeof requestId === 'number') {
        console.log("Mock refill update simulated:", requestId, updates);
        return true;
    }

    if (!supabase) return false;
    try {
        const dbUpdates: any = {};
        if (updates.drugName !== undefined) dbUpdates.drug_name = updates.drugName;
        if (updates.dosage !== undefined) dbUpdates.dosage = updates.dosage;
        if (updates.status !== undefined) {
            dbUpdates.status = updates.status;
            dbUpdates.responded_at = new Date().toISOString();
        }
        if (updates.scheduledTime !== undefined) {
            // Assume we save this in 'pharmacist_notes' for now as schema doesn't have a scheduled_time column yet,
            // or we could add a column. For simplicity in this demo, appending to notes is safer without migration.
            dbUpdates.pharmacist_notes = `Scheduled for: ${updates.scheduledTime}`;
        }
        
        const { error } = await supabase
            .from('requested_drug_refills')
            .update(dbUpdates)
            .eq('id', requestId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Error updating refill request:", error);
        return false;
    }
};

export const logVideoCallSession = async (
    sessionId: string, 
    appointmentId: string, 
    professionalId: string, 
    patientId: string, 
    startedAt: string, 
    endedAt: string, 
    durationSeconds: number, 
    recordingUrl?: string
): Promise<boolean> => {
    if (!supabase) return false;
    try {
        const { error } = await supabase
            .from('video_call_sessions')
            .insert({
                id: sessionId,
                appointment_id: appointmentId,
                professional_id: professionalId,
                patient_id: patientId,
                started_at: startedAt,
                ended_at: endedAt,
                duration_seconds: durationSeconds,
                recording_url: recordingUrl,
            });
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Error logging video call session:", error);
        return false;
    }
};
