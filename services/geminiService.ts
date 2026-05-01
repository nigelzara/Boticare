
import { GoogleGenAI, Modality, GenerateContentResponse, Part } from "@google/genai";
import { Appointment, ChatMessage, AvailabilitySlot, PrescriptionRefillRequest } from "../types";
import { supabase } from "./supabaseClient"; // Import supabase

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    // Updated to gemini-3-flash-preview for general text tasks
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
  if (!inputText.trim()) {
    return [];
  }
  try {
    const relevantHistory = chatHistory.length > 1 ? chatHistory.slice(-4) : [];
    const historyText = relevantHistory
      .map(msg => `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`)
      .join('\n');

    const prompt = `You are a predictive text assistant. Suggest 3-4 short, relevant words or phrases the user might type next, based on their input and the conversation history.

Conversation History:
${historyText}

User is typing: "${inputText}"

Provide suggestions as a single, comma-separated string. Example: is normal,about my medication,the side effects are,I feel dizzy when`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: { parts: [{ text: prompt }] },
    });

    const suggestionsText = response.text?.trim();
    if (!suggestionsText) return [];
    
    return suggestionsText.split(',').map(s => s.trim()).filter(s => s);
  } catch (error) {
    console.error("Error generating word suggestions:", error);
    return [];
  }
};

export const getAppointmentSummary = async (appointment: Appointment): Promise<string> => {
  try {
    const prompt = `Generate a professional medical summary of a patient's consultation (~300 words).
    
    Patient: Jane Doe
    Professional: ${appointment.doctorName} (${appointment.specialty})
    Date: ${appointment.date}, ${appointment.time}
    
    Notes: "${appointment.notes}"
    
    The summary should cover key discussion points, diagnoses, treatment plans, and next steps, in an easy-to-understand format for the patient.`;

    // Updated to gemini-3-flash-preview
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
        
        // Iterating through parts as per guidelines for nano banana models
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

const extractFrames = (videoFile: File): Promise<string[]> => {
    const FRAME_SAMPLE_RATE = 1; // frames per second
    const MAX_FRAMES = 50;
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(videoFile);
        video.muted = true;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const frames: string[] = [];

        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const duration = video.duration;
            const interval = 1 / FRAME_SAMPLE_RATE;
            let currentTime = 0;

            video.play();

            const captureFrame = () => {
                if (currentTime > duration || frames.length >= MAX_FRAMES) {
                    video.pause();
                    resolve(frames);
                    return;
                }

                video.currentTime = currentTime;
            };

            video.onseeked = () => {
                if (context) {
                    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                    const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
                    frames.push(base64Data);
                }
                currentTime += interval;
                captureFrame();
            };

            captureFrame();
        };

        video.onerror = (err) => {
            reject('Error loading video file.');
        };
    });
};

export const analyzeVideo = async (videoFile: File, prompt: string): Promise<string> => {
    try {
        const frames = await extractFrames(videoFile);
         if (frames.length === 0) {
            throw new Error("Could not extract any frames from the video.");
        }
        const frameParts = frames.map(frame => ({
            inlineData: {
                mimeType: 'image/jpeg',
                data: frame,
            },
        }));

        // Updated to gemini-3-pro-preview for complex multimodal analysis
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [...frameParts, { text: prompt }] },
        });

        return response.text || "No analysis available.";
    } catch (error) {
        console.error("Error analyzing video:", error);
        return "Sorry, I was unable to analyze the video at this time.";
    }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return audioData || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
};

export const generateHealthReport = async (healthData: any, startDate: string, endDate: string): Promise<string> => {
    try {
        const prompt = `As a medical professional AI, analyze the following patient health data for the period from ${startDate} to ${endDate} and generate a comprehensive, easy-to-understand health report. The report should highlight key trends, potential areas of concern, and suggest lifestyle improvements or questions for their doctor.

Patient Data:
- Health Metrics: ${JSON.stringify(healthData.metrics)}
- Recent Alerts: ${JSON.stringify(healthData.alerts)}
- Medications: ${JSON.stringify(healthData.medications)}
- Upcoming Appointments: ${JSON.stringify(healthData.appointments)}

Generate a detailed report.`;

        // Updated to gemini-3-pro-preview
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

// --- Supabase Interaction Functions ---

export const getProfessionalAvailability = async (professionalId: string): Promise<AvailabilitySlot[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('professional_availability')
        .select('*')
        .eq('professional_id', professionalId);

    if (error) {
        console.error("Error fetching professional availability:", error);
        return [];
    }
    return data.map(slot => ({
        id: slot.id,
        dayOfWeek: slot.day_of_week,
        startTime: slot.start_time,
        endTime: slot.end_time,
        isEnabled: true, // Assuming fetched slots are enabled
    }));
};

export const saveProfessionalAvailability = async (professionalId: string, slots: AvailabilitySlot[]): Promise<boolean> => {
    if (!supabase) return false;

    // First, delete existing availability for the professional to avoid conflicts
    const { error: deleteError } = await supabase
        .from('professional_availability')
        .delete()
        .eq('professional_id', professionalId);

    if (deleteError) {
        console.error("Error deleting old availability:", deleteError);
        return false;
    }

    const enabledSlotsToInsert = slots
        .filter(slot => slot.isEnabled)
        .map(slot => ({
            professional_id: professionalId,
            day_of_week: slot.dayOfWeek,
            start_time: slot.startTime,
            end_time: slot.endTime,
        }));
    
    if (enabledSlotsToInsert.length === 0) return true; // No slots to insert, consider it a success.

    const { error: insertError } = await supabase
        .from('professional_availability')
        .insert(enabledSlotsToInsert);

    if (insertError) {
        console.error("Error saving professional availability:", insertError);
        return false;
    }
    return true;
};

export const updateRefillRequest = async (requestId: number, updates: {drugName?: string, dosage?: string, status?: 'pending' | 'approved' | 'declined'}): Promise<boolean> => {
    if (!supabase) return false;
    
    const dbUpdates: { drug_name?: string, dosage?: string, status?: string, responded_at?: string } = {};
    if (updates.drugName !== undefined) dbUpdates.drug_name = updates.drugName;
    if (updates.dosage !== undefined) dbUpdates.dosage = updates.dosage;
    if (updates.status !== undefined) {
        dbUpdates.status = updates.status;
        dbUpdates.responded_at = new Date().toISOString(); // Set response time on status change
    }

    const { error } = await supabase
        .from('requested_drug_refills')
        .update(dbUpdates)
        .eq('id', requestId);

    if (error) {
        console.error("Error updating refill request:", error);
        return false;
    }
    return true;
};

export const logVideoCallSession = async (
    sessionId: string,
    appointmentId: string,
    professionalId: string,
    patientId: string,
    startTime: string,
    endTime: string,
    durationSeconds: number,
    recordingUrl?: string
): Promise<boolean> => {
    if (!supabase) return false;

    const { error } = await supabase
        .from('video_call_sessions')
        .insert({
            id: sessionId,
            appointment_id: appointmentId,
            professional_id: professionalId, // Assuming professional_id column exists
            patient_id: patientId, // Assuming patient_id column exists
            started_at: startTime,
            ended_at: endTime,
            duration_seconds: durationSeconds,
            recording_url: recordingUrl,
        });

    if (error) {
        console.error("Error logging video call session:", error);
        return false;
    }
    return true;
};
