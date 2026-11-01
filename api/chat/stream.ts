import type { VercelRequest, VercelResponse } from '@vercel/node';
import { errorMessage, generateText } from '../gemini';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
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

    const text = await generateText(
      messages.map((message: { role: string; content: string }) => ({
        role: message.role === 'user' ? 'user' : 'model',
        parts: [{ text: message.content || '' }],
      })),
      systemInstruction
    );

    if (text) {
      res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Gemini Vercel function error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: errorMessage(error) });
      return;
    }
    res.write(`data: ${JSON.stringify({ error: errorMessage(error) })}\n\n`);
    res.end();
  }
}
