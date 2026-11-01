import { GoogleGenAI } from '@google/genai';

export const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

export function getAi(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      timeout: 15000,
      headers: { 'User-Agent': 'jarvis_abhesh' },
    },
  });
}

export function errorMessage(error: unknown): string {
  const value = error as { status?: number; message?: string } | null;
  const message = value?.message || 'An unexpected error occurred while generating a response.';

  if (value?.status === 401 || value?.status === 403 || /API_KEY_INVALID|PERMISSION_DENIED/i.test(message)) {
    return 'Gemini API key is invalid or does not have permission to use this model.';
  }
  if (value?.status === 404 || /NOT_FOUND/i.test(message)) {
    return 'The configured Gemini model is unavailable.';
  }
  if (value?.status === 429 || /RESOURCE_EXHAUSTED/i.test(message)) {
    return 'Gemini rate limit or quota exceeded. Please try again shortly.';
  }
  if (value?.status === 503 || /UNAVAILABLE|high demand/i.test(message)) {
    return 'Gemini is temporarily experiencing high demand. Please try again shortly.';
  }
  if (/timeout|timed out/i.test(message)) {
    return 'Gemini request timed out. Please try again.';
  }
  return message;
}
