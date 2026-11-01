import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ai, errorMessage, model } from '../gemini';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const messages = body?.messages;
  const systemInstruction = body?.systemInstruction;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required.' });
    return;
  }
  if (!process.env.GEMINI_API_KEY) {
    res.status(401).json({ error: 'Gemini API key is not configured.', code: 'API_KEY_MISSING' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  try {
    const response = await ai.models.generateContent({
      model,
      contents: messages.map((message: { role: string; content: string }) => ({
        role: message.role === 'user' ? 'user' : 'model',
        parts: [{ text: message.content || '' }],
      })),
      config: {
        systemInstruction: systemInstruction?.trim() || undefined,
      },
    });

    if (response.text) {
      res.write(`data: ${JSON.stringify({ chunk: response.text })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Gemini Vercel function error:', error);
    res.write(`data: ${JSON.stringify({ error: errorMessage(error) })}\n\n`);
    res.end();
  }
}
