import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  ChevronDown,
  Sparkles,
  Zap,
  Sliders,
  Download,
  Trash2,
  FileCode,
  FileJson,
  Check,
  Edit2,
} from 'lucide-react';
import { Conversation, ModelOption } from '../types/chat';
import { AVAILABLE_MODELS } from '../utils/constants';

interface ChatHeaderProps {
  conversation: Conversation;
  onOpenMobileSidebar: () => void;
  onModelChange: (model: 'gemini-3.5-flash-lite') => void;
  onOpenSettings: () => void;
  onRenameTitle: (title: string) => void;
  onClearCurrentChat: () => void;
  onExportMarkdown: () => void;
  onExportJson: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  onOpenMobileSidebar,
  onModelChange,
  onOpenSettings,
  onRenameTitle,
  onClearCurrentChat,
  onExportMarkdown,
  onExportJson,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(conversation.title);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleDraft(conversation.title);
  }, [conversation.title]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setModelDropdownOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeModel =
    AVAILABLE_MODELS.find((m) => m.id === conversation.model) || AVAILABLE_MODELS[0];

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleDraft.trim()) {
      onRenameTitle(titleDraft.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 px-4 backdrop-blur-md">
      {/* Left section: Mobile menu + Title */}
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          onClick={onOpenMobileSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 md:hidden"
          title="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {isEditingTitle ? (
          <form onSubmit={handleTitleSubmit} className="flex items-center gap-1.5">
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleSubmit}
              autoFocus
              className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-sm font-semibold text-slate-800 dark:text-slate-100 border border-sky-500 focus:outline-none"
            />
            <button type="submit" className="text-emerald-500 hover:text-emerald-600 p-1">
              <Check className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <div
            onClick={() => setIsEditingTitle(true)}
            className="group flex items-center gap-1.5 cursor-pointer truncate"
            title="Click to rename conversation"
          >
            <h1 className="truncate text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
              {conversation.title || 'New Conversation'}
            </h1>
            <Edit2 className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>

      {/* Right section: Model dropdown, Persona trigger, Export, Clear */}
      <div className="flex items-center gap-2">
        {/* Model Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setModelDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all border border-slate-200 dark:border-slate-700/60 shadow-xs"
          >
            {activeModel.id === 'gemini-3.5-flash-lite' ? (
              <Sparkles className="h-3.5 w-3.5 text-sky-500" />
            ) : (
              <Zap className="h-3.5 w-3.5 text-amber-500" />
            )}
            <span className="hidden sm:inline">{activeModel.name}</span>
            <span className="sm:hidden">{activeModel.shortName}</span>
            <span className="rounded bg-sky-500/10 px-1 py-0.2 text-[9px] font-semibold text-sky-600 dark:text-sky-400">
              {activeModel.badge}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {modelDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Select Gemini Model
              </div>
              <div className="space-y-1">
                {AVAILABLE_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onModelChange(m.id);
                      setModelDropdownOpen(false);
                    }}
                    className={`flex flex-col text-left w-full rounded-xl p-2.5 transition-colors ${
                      conversation.model === m.id
                        ? 'bg-sky-50 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-800/80'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800 dark:text-slate-200">
                        {m.id === 'gemini-3.5-flash-lite' ? (
                          <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                        ) : (
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        <span>{m.name}</span>
                      </div>
                      <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 dark:text-slate-300">
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[11px] leading-tight text-slate-500 dark:text-slate-400">
                      {m.description}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400">
                      <span>Speed: {m.speed}</span>
                      <span>•</span>
                      <span>Reasoning: {m.intelligence}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Persona / Instructions Quick Button */}
        <button
          onClick={onOpenSettings}
          title="Configure System Prompt & Persona"
          className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors border border-slate-200 dark:border-slate-700/60"
        >
          <Sliders className="h-3.5 w-3.5 text-sky-500" />
          <span className="hidden md:inline">Persona</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setExportDropdownOpen((prev) => !prev)}
            title="Export conversation"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700/60"
          >
            <Download className="h-4 w-4" />
          </button>

          {exportDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl z-50">
              <button
                onClick={() => {
                  onExportMarkdown();
                  setExportDropdownOpen(false);
                }}
                className="flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FileCode className="h-4 w-4 text-sky-500" />
                <span>Export as Markdown</span>
              </button>
              <button
                onClick={() => {
                  onExportJson();
                  setExportDropdownOpen(false);
                }}
                className="flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FileJson className="h-4 w-4 text-emerald-500" />
                <span>Export as JSON</span>
              </button>
            </div>
          )}
        </div>

        {/* Clear Messages in Current Chat */}
        {conversation.messages.length > 0 && (
          <button
            onClick={onClearCurrentChat}
            title="Clear current messages"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
};
