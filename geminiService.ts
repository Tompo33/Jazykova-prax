
import { GoogleGenAI, Type } from "@google/genai";
import { FeedbackResponse } from "./types";

// Vo Vite prostredí pristupujeme k premenným cez import.meta.env
const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || (process.env as any).API_KEY || "";

export const getLanguageFeedback = async (
  targetWords: string,
  userSentences: string
): Promise<FeedbackResponse> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Vocabulary to practice: ${targetWords}
      Sentences provided: ${userSentences}
    `,
    config: {
      systemInstruction: `
        You are an encouraging and context-aware English tutor for the "Take Away English" brand.
        The user wants to practice specific English vocabulary. 
        Your primary focus MUST be on whether the words/phrases from the "Vocabulary to practice" field were used correctly in context within the provided sentences.
        
        TONE AND LANGUAGE RULES:
        - Provide all feedback in Slovak.
        - Use an INFORMAL, SINGULAR tone (tykanie).
        - Use FEMININE grammatical forms (e.g., "použila si", "napísala si", "tvoja veta").
        - Be encouraging, like a friendly mentor.
        
        CONTENT RULES:
        If Correct Context:
        - Praise the usage.
        - Explain why it was correct (e.g., "použila si to idiomaticky", "gramaticky správne", "významovo presné").
        
        If Incorrect Context:
        - State clearly it was incorrect or awkward.
        - Provide a suggestion: either a better word for that context or a reformulated sentence that correctly uses the target word.
        - Explain why the original was wrong (e.g., "nesprávna kolokácia", "odlišný význam", "nevhodný register").
        - Provide a clear contrast example.
        
        Return the result as a JSON object matching the defined schema.
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { 
            type: Type.STRING, 
            description: "A short, encouraging summary of the student's attempt in Slovak (informal, feminine)." 
          },
          corrections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                originalSentence: { type: Type.STRING },
                wordPracticed: { type: Type.STRING },
                isCorrect: { type: Type.BOOLEAN },
                feedback: { type: Type.STRING, description: "Detailed feedback in Slovak (informal, feminine)." },
                explanation: { type: Type.STRING, description: "Detailed linguistic explanation in Slovak (informal, feminine)." },
                suggestion: { type: Type.STRING, description: "Improved version or alternative word." },
                correctExample: { type: Type.STRING, description: "A separate example showing correct usage of the target word." }
              },
              required: ["originalSentence", "wordPracticed", "isCorrect", "feedback", "explanation"]
            }
          }
        },
        required: ["summary", "corrections"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No feedback received from the AI.");
  }

  return JSON.parse(text) as FeedbackResponse;
};
