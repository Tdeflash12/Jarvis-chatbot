import type { VercelRequest, VercelResponse } from '@vercel/node';
import { errorMessage, generateText } from './gemini';

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

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Gemini Vercel function error:', error);
    res.status(500).json({ error: errorMessage(error) });
  }
}
