import React, { useState } from 'react';
import {
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Edit2,
  X,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Message } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageItemProps {
  message: Message;
  isLastAssistant: boolean;
  onRegenerate?: () => void;
  onEditAndResend?: (messageId: string, newContent: string) => void;
  onSelectSuggestion?: (suggestion: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLastAssistant,
  onRegenerate,
  onEditAndResend,
  onSelectSuggestion,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editContent.trim() && editContent !== message.content && onEditAndResend) {
      onEditAndResend(message.id, editContent.trim());
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`group w-full py-4 px-4 sm:px-6 transition-colors ${
        isUser ? 'bg-transparent' : 'bg-slate-50/70 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800/40'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-3.5 sm:gap-4 items-start">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
              <User className="h-4 w-4" />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-sm shadow-sky-500/20">
              <Bot className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Content & Actions */}
        <div className="flex-1 min-w-0">
          {/* Header info */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                {isUser ? 'You' : 'jarvis_abhesh'}
              </span>
              <span className="text-[11px] text-slate-400">{formattedTime}</span>
            </div>

            {/* Hover Actions Bar */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>

              {isUser && onEditAndResend && !isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditContent(message.content);
                  }}
                  className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                  title="Edit and resend"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              )}

              {!isUser && isLastAssistant && onRegenerate && !isStreaming && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                  title="Regenerate response"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Message Body or Edit Mode */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-sky-500 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs"
                >
                  Save & Resend
                </button>
              </div>
            </form>
          ) : (
            <div className="relative">
              {isUser ? (
                <div className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {message.content}
                </div>
              ) : (
                <div className="space-y-2">
                  <MarkdownRenderer content={message.content} />

                  {/* Blinking streaming cursor */}
                  {isStreaming && (
                    <span className="inline-block h-4 w-1.5 bg-sky-500 animate-cursor-blink ml-1 rounded-xs" />
                  )}

                  {/* Error Notification */}
                  {message.error && (
                    <div className="mt-3 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/30 p-3.5 text-xs text-rose-700 dark:text-rose-300">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <p className="font-semibold">Unable to complete response</p>
                          <p className="leading-relaxed opacity-90">{message.error}</p>
                          {onRegenerate && (
                            <button
                              onClick={onRegenerate}
                              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium px-2.5 py-1 text-xs"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>Retry now</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Follow-up Suggestions */}
                  {!isStreaming &&
                    message.suggestions &&
                    message.suggestions.length > 0 &&
                    onSelectSuggestion && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-2">
                          <Sparkles className="h-3 w-3 text-sky-500" />
                          <span>Suggested follow-ups</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.map((sug, idx) => (
                            <button
                              key={idx}
                              onClick={() => onSelectSuggestion(sug)}
                              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-sky-400 dark:hover:border-sky-600 hover:text-sky-600 dark:hover:text-sky-400 transition-colors shadow-xs"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
