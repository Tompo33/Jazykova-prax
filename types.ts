
export interface Correction {
  originalSentence: string;
  wordPracticed: string;
  isCorrect: boolean;
  feedback: string;
  explanation: string;
  suggestion?: string;
  correctExample?: string;
}

export interface FeedbackResponse {
  summary: string;
  corrections: Correction[];
}
