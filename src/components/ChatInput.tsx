import React, { useRef, useEffect } from 'react';
import { Send, Square, CornerDownLeft } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const nextHeight = Math.min(el.scrollHeight, 180);
    el.style.height = `${Math.max(nextHeight, 44)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="sticky bottom-0 z-10 w-full bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 dark:to-transparent px-4 pb-4 pt-2">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/40 dark:shadow-black/40 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500 transition-all">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              isStreaming
                ? 'Gemini is generating response...'
                : 'Message jarvis_abhesh (Enter to send, Shift + Enter for new line)...'
            }
            rows={1}
            className="w-full resize-none bg-transparent px-4 py-3.5 pr-24 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none max-h-48 leading-relaxed"
          />

          {/* Right action button */}
          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-rose-600 px-3 text-xs font-semibold text-white shadow-xs hover:bg-rose-500 transition-all active:scale-95"
                title="Stop generating"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onSend}
                disabled={!value.trim() || disabled}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  value.trim() && !disabled
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30 hover:bg-sky-500 active:scale-95'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Input footer hints */}
        <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-slate-400 dark:text-slate-500 select-none">
          <div className="flex items-center gap-2">
            <span>Press ↵ to send</span>
            <span>•</span>
            <span>⇧↵ for newline</span>
          </div>
          <div className="flex items-center gap-2">
            {value.length > 0 && <span>{value.length} characters</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
