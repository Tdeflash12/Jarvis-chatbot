import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const REQUEST_TIMEOUT_MS = 15000;

app.use(express.json({ limit: '5mb' }));

export { app };

// Initialize GoogleGenAI client with required header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for retry with backoff on transient errors (503, high demand, 429)
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 1200): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const isTransient =
      err?.status === 503 ||
      err?.message?.includes('503') ||
      err?.message?.includes('high demand') ||
      err?.message?.includes('UNAVAILABLE') ||
      err?.status === 429;

    if (retries > 0 && isTransient) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return withRetry(fn, retries - 1, delayMs * 1.5);
    }
    throw err;
  }
}

// Health & Status endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    defaultModel: GEMINI_MODEL,
    supportedModels: [
      {
        id: 'gemini-3.5-flash-lite',
        name: 'Gemini 3.5 Flash Lite',
        description: 'Fast, lightweight model for responsive conversations',
        tag: 'Recommended',
      },
    ],
  });
});

// SSE Streaming chat endpoint
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  const { messages, systemInstruction } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(401).json({
      error:
        'Gemini API key is not configured. Please verify or attach your API key in the AI Studio Settings > Secrets panel.',
      code: 'API_KEY_MISSING',
    });
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let clientDisconnected = false;
  res.on('close', () => {
    clientDisconnected = true;
  });

  try {
    // Format conversation history for Gemini SDK
    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content || '' }],
    }));

    const response = await withRetry(
      () =>
        ai.models.generateContent({
          model: GEMINI_MODEL,
          contents,
          config: {
            systemInstruction: systemInstruction?.trim() ? systemInstruction.trim() : undefined,
            httpOptions: { timeout: REQUEST_TIMEOUT_MS },
          },
        }),
      0
    );

    if (!clientDisconnected && response.text) {
      res.write(`data: ${JSON.stringify({ chunk: response.text })}\n\n`);
    }

    if (!clientDisconnected) {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    }
  } catch (error: any) {
    console.error('Gemini stream error:', error);
    let errorMessage = error?.message || 'An unexpected error occurred while generating response.';

    if (
      error?.status === 503 ||
      errorMessage.includes('503') ||
      errorMessage.includes('high demand') ||
      errorMessage.includes('UNAVAILABLE')
    ) {
      errorMessage =
        'The Gemini model is temporarily experiencing peak demand. Please click "Retry" in a few seconds.';
    } else if (
      error?.status === 403 ||
      errorMessage.includes('API_KEY_INVALID') ||
      errorMessage.includes('PERMISSION_DENIED')
    ) {
      errorMessage =
        'API key invalid or permission denied. Please verify your Gemini API key in the Settings > Secrets panel.';
    } else if (error?.status === 429 || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      errorMessage =
        'Gemini rate limit or quota exceeded. Please wait a brief moment before sending another message.';
    } else if (error?.status === 404 || errorMessage.includes('NOT_FOUND')) {
      errorMessage = 'The configured Gemini model is unavailable. Please try again later.';
    }

    if (!clientDisconnected) {
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    }
  }
});

// Auto-generate conversation title
app.post('/api/chat/title', async (req: Request, res: Response) => {
  try {
    const { userMessage, assistantMessage } = req.body;
    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      const fallback = userMessage.slice(0, 28) + (userMessage.length > 28 ? '...' : '');
      return res.json({ title: fallback });
    }

    const prompt = `Summarize the topic of this conversation in 3 to 5 words max. No quotation marks, no punctuation, Title Case only.\n\nUser: ${userMessage.slice(0, 200)}\nAssistant: ${(assistantMessage || '').slice(0, 200)}`;

    const response = await withRetry(
      () =>
        ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
        }),
      1,
      1000
    );

    let title = (response.text || '').trim().replace(/^["']|["']$/g, '');
    if (!title || title.length < 2) {
      title = userMessage.slice(0, 28);
    }
    title = title.slice(0, 45);

    res.json({ title });
  } catch (err: any) {
    const fallback = (req.body?.userMessage || 'New Chat').slice(0, 28);
    res.json({ title: fallback });
  }
});

// Generate dynamic follow-up suggestions
app.post('/api/chat/suggestions', async (req: Request, res: Response) => {
  try {
    const { lastUserMessage, lastAssistantResponse } = req.body;
    if (!lastAssistantResponse || !process.env.GEMINI_API_KEY) {
      return res.json({
        suggestions: [
          'Can you provide a code example?',
          'Explain this step by step',
          'What are the key trade-offs?',
        ],
      });
    }

    const prompt = `Based on the latest user question and assistant answer, suggest 3 relevant, brief follow-up questions or prompts the user could ask next. Return strictly a JSON array of 3 strings (max 8 words each). No markdown ticks, just JSON.\n\nUser: ${lastUserMessage?.slice(0, 250)}\nAssistant: ${lastAssistantResponse?.slice(0, 400)}`;

    const response = await withRetry(
      () =>
        ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        }),
      1,
      1000
    );

    let suggestions: string[] = [];
    try {
      suggestions = JSON.parse(response.text || '[]');
    } catch {
      suggestions = [];
    }

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      suggestions = [
        'Could you elaborate on that?',
        'Can you show a practical example?',
        'What are alternative approaches?',
      ];
    }

    res.json({ suggestions: suggestions.slice(0, 3) });
  } catch (err) {
    res.json({
      suggestions: [
        'Can you give me an example?',
        'Explain that in simpler terms',
        'What are the next steps?',
      ],
    });
  }
});

// Connect Vite middleware in dev or static files in production
async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[jarvis_abhesh] Running on http://0.0.0.0:${PORT} (${isProd ? 'Production' : 'Development'})`);
  });
}

if (!process.env.VERCEL) {
  bootstrap().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
