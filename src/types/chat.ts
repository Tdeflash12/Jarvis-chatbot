export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  error?: string;
  isStreaming?: boolean;
  suggestions?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  model: 'gemini-3.5-flash-lite';
  systemPrompt?: string;
  draftInput?: string;
}

export interface ModelOption {
  id: 'gemini-3.5-flash-lite';
  name: string;
  shortName: string;
  description: string;
  badge: string;
  intelligence: string;
  speed: string;
}

export interface SystemPreset {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: 'General' | 'Coding' | 'Writing' | 'Reasoning' | 'Learning';
}

export type Theme = 'dark' | 'light';
