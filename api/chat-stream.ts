import type { VercelRequest, VercelResponse } from '@vercel/node';
import { errorMessage, generateText } from './gemini.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const messages = body?.messages;
    const systemInstruction = body?.systemInstruction;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const text = await generateText(
      messages.map((message: { role: string; content: string }) => ({
        role: message.role === 'user' ? 'user' : 'model',
        parts: [{ text: message.content || '' }],
      })),
      systemInstruction
    );

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.end(
      `data: ${JSON.stringify({ chunk: text })}\n\n` +
        `data: ${JSON.stringify({ done: true })}\n\n`
    );
  } catch (error) {
    console.error('Gemini Vercel function error:', error);
    if (res.headersSent) {
      res.end(`data: ${JSON.stringify({ error: errorMessage(error) })}\n\n`);
    } else {
      res.status(500).json({ error: errorMessage(error) });
    }
  }
}
