import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { WelcomeView } from './components/WelcomeView';
import { MessageItem } from './components/MessageItem';
import { ChatInput } from './components/ChatInput';
import { SystemPromptModal } from './components/SystemPromptModal';
import { Conversation, Message, Theme } from './types/chat';
import {
  loadConversations,
  saveConversations,
  loadActiveConversationId,
  saveActiveConversationId,
  createNewConversation,
  loadStoredTheme,
  saveStoredTheme,
  saveDefaultSystemPrompt,
  exportConversationToMarkdown,
  exportConversationToJson,
  triggerDownload,
} from './utils/storage';
import { AVAILABLE_MODELS } from './utils/constants';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<Theme>(() => loadStoredTheme());

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = loadConversations();
    if (saved.length > 0) return saved;
    const initial = createNewConversation();
    return [initial];
  });

  const [activeId, setActiveId] = useState<string>(() => {
    const savedId = loadActiveConversationId();
    if (savedId && conversations.some((c) => c.id === savedId)) {
      return savedId;
    }
    return conversations[0]?.id || '';
  });

  // UI States
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Active conversation helper
  const activeConversation =
    conversations.find((c) => c.id === activeId) || conversations[0] || createNewConversation();

  // Apply Theme to document root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveStoredTheme(theme);
  }, [theme]);

  // Persist conversations
  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations);
    }
  }, [conversations]);

  // Persist active ID
  useEffect(() => {
    if (activeId) {
      saveActiveConversationId(activeId);
    }
  }, [activeId]);

  // Load draft input when switching active conversation
  useEffect(() => {
    setInputMessage(activeConversation.draftInput || '');
  }, [activeId]);

  // Save draft input to conversation
  const handleInputChange = (val: string) => {
    setInputMessage(val);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, draftInput: val } : c))
    );
  };

  // Scroll to bottom smoothly
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [activeConversation.messages.length]);

  // Create New Chat
  const handleNewChat = useCallback(() => {
    // If currently streaming, stop it first
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }

    const newChat = createNewConversation();
    setConversations((prev) => [newChat, ...prev]);
    setActiveId(newChat.id);
    setInputMessage('');
  }, []);

  // Delete Conversation
  const handleDeleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (next.length === 0) {
          const fresh = createNewConversation();
          setActiveId(fresh.id);
          return [fresh];
        }
        if (id === activeId) {
          setActiveId(next[0].id);
        }
        return next;
      });
    },
    [activeId]
  );

  // Rename Conversation
  const handleRenameConversation = useCallback((id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  }, []);

  // Clear All Conversations
  const handleClearAll = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
    const fresh = createNewConversation();
    setConversations([fresh]);
    setActiveId(fresh.id);
    setInputMessage('');
  }, []);

  // Clear Current Chat Messages
  const handleClearCurrentMessages = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: [], updatedAt: Date.now() } : c))
    );
  }, [activeId]);

  // Model Selection
  const handleModelChange = (model: 'gemini-3.5-flash-lite') => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, model, updatedAt: Date.now() } : c))
    );
  };

  // System Prompt Save
  const handleSaveSystemPrompt = (prompt: string, saveAsDefault: boolean) => {
    if (saveAsDefault) {
      saveDefaultSystemPrompt(prompt);
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, systemPrompt: prompt, updatedAt: Date.now() } : c))
    );
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    // Turn off streaming flag on the last assistant message
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c;
        const msgs = [...c.messages];
        if (msgs.length > 0 && msgs[msgs.length - 1].isStreaming) {
          msgs[msgs.length - 1] = {
            ...msgs[msgs.length - 1],
            isStreaming: false,
          };
        }
        return { ...c, messages: msgs };
      })
    );
  };

  // Generate Follow-up Suggestions in background
  const fetchSuggestions = async (
    conversationId: string,
    assistantMessageId: string,
    lastUser: string,
    lastAssistant: string
  ) => {
    try {
      const res = await fetch('/api/chat/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastUserMessage: lastUser,
          lastAssistantResponse: lastAssistant,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== conversationId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId ? { ...m, suggestions: data.suggestions } : m
              ),
            };
          })
        );
      }
    } catch {
      // Non-critical background task
    }
  };

  // Generate Automatic Title for conversation
  const fetchTitle = async (
    conversationId: string,
    userText: string,
    assistantText: string
  ) => {
    try {
      const res = await fetch('/api/chat/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userText,
          assistantMessage: assistantText,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.title && typeof data.title === 'string') {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId && (c.title === 'New Conversation' || !c.title)
              ? { ...c, title: data.title }
              : c
          )
        );
      }
    } catch {
      // Non-critical
    }
  };

  // Send Message Core Workflow
  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : inputMessage;
    const text = rawText.trim();
    if (!text || isStreaming) return;

    // Reset input
    setInputMessage('');
    handleInputChange('');

    const targetConversationId = activeId;
    const currentConv =
      conversations.find((c) => c.id === targetConversationId) || activeConversation;

    const userMessageId = 'msg_user_' + Date.now();
    const assistantMessageId = 'msg_ai_' + (Date.now() + 1);

    const newUserMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const updatedMessages = [...currentConv.messages, newUserMessage, newAssistantMessage];

    // Optimistically update conversation
    setConversations((prev) =>
      prev.map((c) =>
        c.id === targetConversationId
          ? {
              ...c,
              messages: updatedMessages,
              updatedAt: Date.now(),
              draftInput: '',
            }
          : c
      )
    );

    setIsStreaming(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Prepare history payload for server
    const historyPayload = [...currentConv.messages, newUserMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          model: currentConv.model,
          systemInstruction: currentConv.systemPrompt,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        let errMessage = 'Failed to generate response';
        try {
          const errData = await response.json();
          errMessage = errData.error || errMessage;
        } catch {
          errMessage = `Request failed with status ${response.status}`;
        }
        throw new Error(errMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable response stream available');

      const decoder = new TextDecoder();
      let assistantAccumulatedText = '';
      let streamBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split('\n\n');
        streamBuffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk) {
                assistantAccumulatedText += parsed.chunk;
                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id !== targetConversationId) return c;
                    return {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === assistantMessageId
                          ? { ...m, content: assistantAccumulatedText }
                          : m
                      ),
                    };
                  })
                );
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (err: any) {
              if (err.message && !err.message.includes('JSON')) {
                throw err;
              }
            }
          }
        }
      }

      // Finish streaming successfully
      setIsStreaming(false);
      abortControllerRef.current = null;

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== targetConversationId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMessageId ? { ...m, isStreaming: false } : m
            ),
          };
        })
      );

      // Auto Title if initial message
      if (currentConv.messages.length === 0 || currentConv.title === 'New Conversation') {
        fetchTitle(targetConversationId, text, assistantAccumulatedText);
      }

      // Fetch dynamic follow-up suggestions
      fetchSuggestions(
        targetConversationId,
        assistantMessageId,
        text,
        assistantAccumulatedText
      );
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Stream aborted manually by user
        return;
      }

      console.error('Chat error:', error);
      setIsStreaming(false);
      abortControllerRef.current = null;

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== targetConversationId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    isStreaming: false,
                    error:
                      error.message ||
                      'An unexpected error occurred. Please check your connection and API key.',
                  }
                : m
            ),
          };
        })
      );
    }
  };

  // Regenerate Response
  const handleRegenerate = async () => {
    if (isStreaming || activeConversation.messages.length === 0) return;

    // Find the last assistant message
    const msgs = [...activeConversation.messages];
    const lastMsg = msgs[msgs.length - 1];

    if (lastMsg.role === 'model') {
      msgs.pop(); // Remove previous assistant reply
    }

    if (msgs.length === 0) return;

    // The preceding message is the user prompt
    const lastUserMsg = msgs[msgs.length - 1];
    if (lastUserMsg.role !== 'user') return;

    // Remove user message from conversation so handleSendMessage can re-add clean pair
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: msgs.slice(0, -1) } : c))
    );

    // Call handleSendMessage with the user text
    await handleSendMessage(lastUserMsg.content);
  };

  // Edit and Resend User Message
  const handleEditAndResend = async (messageId: string, newContent: string) => {
    if (isStreaming) return;

    const msgs = activeConversation.messages;
    const idx = msgs.findIndex((m) => m.id === messageId);
    if (idx === -1) return;

    // Keep all messages before this one
    const truncatedHistory = msgs.slice(0, idx);

    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: truncatedHistory } : c))
    );

    await handleSendMessage(newContent);
  };

  // Export handlers
  const handleExportMarkdown = (convToExport?: Conversation) => {
    const target = convToExport || activeConversation;
    const content = exportConversationToMarkdown(target);
    const filename = `${target.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.md`;
    triggerDownload(filename, content, 'text/markdown');
  };

  const handleExportJson = (convToExport?: Conversation) => {
    const target = convToExport || activeConversation;
    const content = exportConversationToJson(target);
    const filename = `${target.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.json`;
    triggerDownload(filename, content, 'application/json');
  };

  const activeModelOption =
    AVAILABLE_MODELS.find((m) => m.id === activeConversation.model) || AVAILABLE_MODELS[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={(id) => setActiveId(id)}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onClearAll={handleClearAll}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        isOpen={sidebarOpenMobile}
        onCloseMobile={() => setSidebarOpenMobile(false)}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        isCollapsed={sidebarCollapsed}
        onExport={handleExportMarkdown}
      />

      {/* Main Chat Interface */}
      <div className="flex flex-1 flex-col h-full min-w-0 bg-white dark:bg-slate-950">
        {/* Top Header */}
        <ChatHeader
          conversation={activeConversation}
          onOpenMobileSidebar={() => setSidebarOpenMobile(true)}
          onModelChange={handleModelChange}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onRenameTitle={(title) => handleRenameConversation(activeId, title)}
          onClearCurrentChat={handleClearCurrentMessages}
          onExportMarkdown={() => handleExportMarkdown()}
          onExportJson={() => handleExportJson()}
        />

        {/* Scrollable Chat Area */}
        <div
          ref={chatScrollContainerRef}
          className="flex-1 overflow-y-auto flex flex-col justify-between"
        >
          {activeConversation.messages.length === 0 ? (
            <WelcomeView
              onSelectPrompt={(prompt) => handleSendMessage(prompt)}
              activeModelName={activeModelOption.name}
            />
          ) : (
            <div className="w-full flex-1">
              {activeConversation.messages.map((msg, index) => {
                const isLastAssistant =
                  msg.role === 'model' && index === activeConversation.messages.length - 1;

                return (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    isLastAssistant={isLastAssistant}
                    onRegenerate={handleRegenerate}
                    onEditAndResend={handleEditAndResend}
                    onSelectSuggestion={(sug) => handleSendMessage(sug)}
                  />
                );
              })}
              <div ref={messagesEndRef} className="h-6" />
            </div>
          )}
        </div>

        {/* Message Input Bar */}
        <ChatInput
          value={inputMessage}
          onChange={handleInputChange}
          onSend={() => handleSendMessage()}
          onStop={handleStopGeneration}
          isStreaming={isStreaming}
        />
      </div>

      {/* System Prompt & Persona Modal */}
      <SystemPromptModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentPrompt={activeConversation.systemPrompt || ''}
        onSavePrompt={handleSaveSystemPrompt}
      />
    </div>
  );
}
