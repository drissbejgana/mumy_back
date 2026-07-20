import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

export const GEMINI_MODEL = 'gemini-3.5-flash';

let aiClient: GoogleGenAI | null = null;

// Lazy-initialized singleton; returns null when no key is configured so every
// route can fall back to a simulated response instead of crashing.
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = env.geminiApiKey;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'mumy-backend' } },
    });
  }
  return aiClient;
}

export function logGeminiError(context: string, error: any): void {
  const errMsg = error?.message || String(error);
  const isQuota =
    errMsg.toLowerCase().includes('quota') ||
    errMsg.toLowerCase().includes('resource_exhausted') ||
    error?.status === 429;
  const isUnavailable =
    errMsg.toLowerCase().includes('unavailable') ||
    errMsg.toLowerCase().includes('503') ||
    error?.status === 503;

  if (isQuota) {
    console.warn(`[Gemini API Warning] Quota exceeded (429) for ${context}. Switching to local simulation fallback.`);
  } else if (isUnavailable) {
    console.warn(`[Gemini API Warning] Service temporarily unavailable (503) for ${context}. Switching to local simulation fallback.`);
  } else {
    console.warn(`[Gemini API Warning] ${context} status update: ${errMsg}. Switching to local simulation fallback.`);
  }
}
