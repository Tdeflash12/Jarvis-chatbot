import { ModelOption, SystemPreset } from '../types/chat';

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash Lite',
    shortName: 'Flash Lite 3.5',
    description: 'Fast, lightweight model for responsive conversations.',
    badge: 'Recommended',
    intelligence: 'Fast & Capable',
    speed: 'Very Fast',
  },
];

export const SYSTEM_PRESETS: SystemPreset[] = [
  {
    id: 'default',
    name: 'Helpful AI Partner',
    category: 'General',
    description: 'Warm, highly capable, balanced, and articulate across all subjects.',
    prompt:
      'You are jarvis_abhesh, a brilliant, thoughtful, and highly skilled AI assistant. Provide accurate, structured, and easy-to-understand responses. When answering technical or complex questions, explain concepts clearly, provide practical examples, and format code with appropriate syntax.',
  },
  {
    id: 'senior-engineer',
    name: 'Senior Software Engineer',
    category: 'Coding',
    description: 'Production-ready code, strict types, architecture patterns, and optimization.',
    prompt:
      'You are a Principal Software Engineer and Staff Architect. Write clean, idiomatic, and modern code adhering to industry best practices. Include concise explanations of performance, type safety, security, and edge cases. Never write sloppy or placeholder code unless explicitly asked.',
  },
  {
    id: 'concise-architect',
    name: 'Concise & Direct',
    category: 'Reasoning',
    description: 'Zero fluff, laser-focused answers, structured bullets, and actionable conclusions.',
    prompt:
      'You are a direct, high-efficiency advisor. Omit conversational filler, disclaimers, or excessive introductory pleasantries. Give clear, succinct answers, structured checklists, bullet points, and exact solutions immediately.',
  },
  {
    id: 'socratic-tutor',
    name: 'Socratic Tutor',
    category: 'Learning',
    description: 'Deep explanations, step-by-step intuition, analogies, and guided questions.',
    prompt:
      'You are a world-class academic tutor. Help the user build true conceptual understanding. Break down complex topics into intuitive steps, provide illuminating analogies, and periodically ask gentle check-in questions to reinforce learning.',
  },
  {
    id: 'creative-writer',
    name: 'Creative Wordsmith',
    category: 'Writing',
    description: 'Compelling narratives, persuasive copy, nuanced rhetoric, and engaging tone.',
    prompt:
      'You are an exceptional writer and copy strategist. Craft vivid, compelling, and memorable prose. Pay close attention to rhythm, clarity, evocative imagery, and emotional resonance based on the user’s target audience.',
  },
];

export interface WelcomePrompt {
  id: string;
  category: 'Coding' | 'System Design' | 'Learning' | 'Writing';
  icon: string;
  title: string;
  prompt: string;
}

export const WELCOME_PROMPTS: WelcomePrompt[] = [
  {
    id: 'ts-debounce',
    category: 'Coding',
    icon: 'Code2',
    title: 'Debounce with TypeScript',
    prompt: 'Write a type-safe generic debounce function in TypeScript with immediate execution option and cancellation support.',
  },
  {
    id: 'auth-jwt',
    category: 'System Design',
    icon: 'ShieldCheck',
    title: 'JWT vs Session Auth',
    prompt: 'Compare stateless JWTs with stateful Redis session stores for microservices. Highlight latency, invalidation, and scaling.',
  },
  {
    id: 'vector-search',
    category: 'Learning',
    icon: 'Sparkles',
    title: 'How Vector Embeddings Work',
    prompt: 'Explain how high-dimensional vector embeddings and cosine similarity enable semantic search, using an intuitive library metaphor.',
  },
  {
    id: 'tech-memo',
    category: 'Writing',
    icon: 'FileText',
    title: 'Architecture RFC Memo',
    prompt: 'Draft an RFC memo proposing a migration from client-side REST polling to Server-Sent Events (SSE) for real-time dashboards.',
  },
];
