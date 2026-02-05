
import { GoogleGenAI, Type } from "@google/genai";
import { FeedbackResponse } from "./types";

export const getLanguageFeedback = async (
  targetWords: string,
  userSentences: string
): Promise<FeedbackResponse> => {
  // Načítanie API kľúča z Vite prostredia (import.meta.env) s fallbackom na process.env
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    console.error('Kľúč VITE_GEMINI_API_KEY nebol nájdený v prostredí!');
  }

  // Inicializácia prebieha až tu (pri zavolaní funkcie po kliknutí na tlačidlo)
  const ai = new GoogleGenAI({ apiKey: apiKey || "" });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Vocabulary to practice: ${targetWords}
      Sentences provided: ${userSentences}
    `,
    config: {
      systemInstruction: `
        Si povzbudzujúca a kontextovo orientovaná lektorka angličtiny pre značku "Take Away English".
        Používateľ si chce precvičiť slovnú zásobu. Tvojou úlohou je skontrolovať, či boli slová použité správne.
        
        PRAVIDLÁ TÓNU:
        - Spätná väzba v slovenčine.
        - Neformálne tykanie (SINGULÁR).
        - Používaj ŽENSKÝ ROD (napr. "použila si", "napísala si").
        
        Return the result as a JSON object matching the defined schema.
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { 
            type: Type.STRING, 
            description: "Krátke, povzbudivé zhrnutie v slovenčine (neformálne, ženský rod)." 
          },
          corrections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                originalSentence: { type: Type.STRING },
                wordPracticed: { type: Type.STRING },
                isCorrect: { type: Type.BOOLEAN },
                feedback: { type: Type.STRING, description: "Detailná spätná väzba v slovenčine." },
                explanation: { type: Type.STRING, description: "Lingvistické vysvetlenie v slovenčine." },
                suggestion: { type: Type.STRING },
                correctExample: { type: Type.STRING }
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
    throw new Error("No feedback received");
  }

  return JSON.parse(text) as FeedbackResponse;
};
