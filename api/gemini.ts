export const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

export type GeminiMessage = {
  role: 'user' | 'model';
  parts: [{ text: string }];
};

export async function generateText(
  contents: GeminiMessage[],
  systemInstruction?: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('Gemini API key is not configured.'), { status: 401 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: systemInstruction?.trim()
            ? { parts: [{ text: systemInstruction.trim() }] }
            : undefined,
        }),
        signal: controller.signal,
      }
    );
    const payload = (await response.json()) as {
      error?: { message?: string; status?: string };
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    if (!response.ok) {
      const error = new Error(payload.error?.message || `Gemini request failed (${response.status})`);
      Object.assign(error, { status: response.status });
      throw error;
    }

    return payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
  } finally {
    clearTimeout(timeout);
  }
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
