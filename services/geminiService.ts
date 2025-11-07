import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Student } from '../types';

/**
 * Recognizes a student's face by comparing a live camera frame against a list of
 * registered student profile pictures using the Gemini API.
 *
 * @param liveFrameBase64 The base64 encoded image frame from the webcam (without data: URL prefix).
 * @param students The list of registered students, including their base64-encoded image URLs.
 * @returns A promise that resolves to the recognized Student object or null if no match is found.
 */
export const recognizeStudentFace = async (
  liveFrameBase64: string,
  students: Student[]
): Promise<Student | null> => {
  if (!process.env.API_KEY || !students || students.length === 0) {
    return null;
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const parts: any[] = [
      { text: "You are a highly accurate face recognition system. Your task is to identify if the person in the 'LIVE_FRAME' image matches any of the provided 'STUDENT_PROFILE' images. Compare the face in the LIVE_FRAME to each student's profile. Respond with ONLY the matching student's ID (e.g., 's001'). If no confident match is found, respond with 'NONE'." },
      { text: "--- START OF DATA ---" },
      { text: "LIVE_FRAME:" },
      { inlineData: { mimeType: 'image/jpeg', data: liveFrameBase64 } },
      { text: "STUDENT_PROFILES:" },
    ];

    students.forEach(student => {
      // student.imageUrl is a data URL, so we need to strip the prefix
      if (student.imageUrl && student.imageUrl.includes(',')) {
        const studentImageBase64 = student.imageUrl.split(',')[1];
        const mimeType = student.imageUrl.split(';')[0].split(':')[1] || 'image/jpeg';
        parts.push({ text: `Student ID: ${student.id}` });
        parts.push({ inlineData: { mimeType, data: studentImageBase64 } });
      }
    });
    
    parts.push({ text: "--- END OF DATA ---" });
    parts.push({ text: "Question: Based on the images, which student ID does the person in LIVE_FRAME match? Respond with only the ID or 'NONE'." });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
    });

    const recognizedId = response.text.trim();

    if (recognizedId === 'NONE' || !recognizedId.startsWith('s')) {
      return null;
    }

    const recognizedStudent = students.find(s => s.id === recognizedId);
    return recognizedStudent || null;

  } catch (error) {
    console.error("Error recognizing student face:", error);
    return null;
  }
};