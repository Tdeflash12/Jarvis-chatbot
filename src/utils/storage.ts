import { Conversation } from '../types/chat';

const STORAGE_KEY_CONVERSATIONS = 'aether_conversations_v1';
const STORAGE_KEY_ACTIVE_ID = 'aether_active_conversation_id';
const STORAGE_KEY_THEME = 'aether_theme_preference';
const STORAGE_KEY_DEFAULT_MODEL = 'aether_default_model';
const STORAGE_KEY_DEFAULT_SYSTEM = 'aether_default_system_instruction';

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load conversations from storage:', err);
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
  } catch (err) {
    console.error('Failed to save conversations to storage:', err);
  }
}

export function loadActiveConversationId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
  } catch {
    return null;
  }
}

export function saveActiveConversationId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (err) {
    console.error('Failed to save active conversation id:', err);
  }
}

export function loadStoredTheme(): 'dark' | 'light' {
  try {
    const theme = localStorage.getItem(STORAGE_KEY_THEME);
    if (theme === 'dark' || theme === 'light') return theme;
    // Default to dark theme for modern developer feel, or check media query
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveStoredTheme(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  } catch (err) {
    console.error('Failed to save theme preference:', err);
  }
}

export function loadDefaultModel(): 'gemini-3.5-flash-lite' {
  try {
    const model = localStorage.getItem(STORAGE_KEY_DEFAULT_MODEL);
    return 'gemini-3.5-flash-lite';
  } catch {
    return 'gemini-3.5-flash-lite';
  }
}

export function saveDefaultModel(model: 'gemini-3.5-flash-lite'): void {
  try {
    localStorage.setItem(STORAGE_KEY_DEFAULT_MODEL, model);
  } catch (err) {
    console.error('Failed to save default model:', err);
  }
}

export function loadDefaultSystemPrompt(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_DEFAULT_SYSTEM) || '';
  } catch {
    return '';
  }
}

export function saveDefaultSystemPrompt(prompt: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_DEFAULT_SYSTEM, prompt);
  } catch (err) {
    console.error('Failed to save default system prompt:', err);
  }
}

export function createNewConversation(
  model?: 'gemini-3.5-flash-lite',
  systemPrompt?: string
): Conversation {
  const id = 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  return {
    id,
    title: 'New Conversation',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    model: model || loadDefaultModel(),
    systemPrompt: systemPrompt !== undefined ? systemPrompt : loadDefaultSystemPrompt(),
    draftInput: '',
  };
}

export function exportConversationToMarkdown(conv: Conversation): string {
  let md = `# ${conv.title}\n`;
  md += `*Model: ${conv.model} | Created: ${new Date(conv.createdAt).toLocaleString()}*\n\n`;

  if (conv.systemPrompt) {
    md += `> **System Prompt**: ${conv.systemPrompt}\n\n---\n\n`;
  }

  conv.messages.forEach((m) => {
    const sender = m.role === 'user' ? '👤 **User**' : '✨ **Assistant**';
    const time = new Date(m.timestamp).toLocaleTimeString();
    md += `### ${sender} (${time})\n\n${m.content}\n\n---\n\n`;
  });

  return md;
}

export function exportConversationToJson(conv: Conversation): string {
  return JSON.stringify(conv, null, 2);
}

export function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
