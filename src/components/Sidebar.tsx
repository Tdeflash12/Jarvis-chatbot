import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Settings2,
  Moon,
  Sun,
  Bot,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Conversation, Theme } from '../types/chat';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onClearAll: () => void;
  onOpenSettings: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
  onExport: (conv: Conversation) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onClearAll,
  onOpenSettings,
  theme,
  onToggleTheme,
  isOpen,
  onCloseMobile,
  onToggleCollapse,
  isCollapsed,
  onExport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  // Group conversations by time period
  const groupedConversations = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const weekStart = todayStart - 86400000 * 7;

    const groups: {
      today: Conversation[];
      yesterday: Conversation[];
      lastWeek: Conversation[];
      older: Conversation[];
    } = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    };

    filteredConversations.forEach((conv) => {
      const time = conv.updatedAt || conv.createdAt;
      if (time >= todayStart) {
        groups.today.push(conv);
      } else if (time >= yesterdayStart) {
        groups.yesterday.push(conv);
      } else if (time >= weekStart) {
        groups.lastWeek.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  }, [filteredConversations]);

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDownRename = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveRename(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const renderConversationGroup = (title: string, list: Conversation[]) => {
    if (list.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {title}
        </div>
        <div className="space-y-1">
          {list.map((conv) => {
            const isActive = conv.id === activeId;
            const isEditing = conv.id === editingId;
            const isConfirming = conv.id === confirmDeleteId;

            return (
              <div
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv.id);
                  onCloseMobile();
                }}
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-medium border border-sky-200 dark:border-sky-800/60'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {isEditing ? (
                  <form
                    onSubmit={(e) => handleSaveRename(conv.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex w-full items-center gap-1.5"
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => handleKeyDownRename(e, conv.id)}
                      autoFocus
                      className="w-full rounded bg-white dark:bg-slate-900 px-2 py-1 text-xs border border-sky-500 focus:outline-none text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="p-1 hover:text-emerald-500 text-slate-400"
                      title="Save title"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1 hover:text-rose-500 text-slate-400"
                      title="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </form>
                ) : isConfirming ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex w-full items-center justify-between text-xs py-0.5 text-rose-500"
                  >
                    <span className="font-medium">Delete chat?</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onDeleteConversation(conv.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-2 py-0.5 rounded bg-rose-500 text-white font-medium hover:bg-rose-600"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                      <MessageSquare
                        className={`h-4 w-4 shrink-0 ${
                          isActive
                            ? 'text-sky-500'
                            : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                        }`}
                      />
                      <span className="truncate text-xs tracking-tight">
                        {conv.title || 'Untitled Conversation'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExport(conv);
                        }}
                        title="Export chat"
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleStartRename(conv, e)}
                        title="Rename chat"
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(conv.id);
                        }}
                        title="Delete chat"
                        className="p-1 text-slate-400 hover:text-rose-500 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-16' : 'w-72 md:w-72'}`}
      >
        {/* Brand & Collapse Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-sm shadow-sky-500/20">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base">
                  jarvis_abhesh
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Gemini Workspace
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action: New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className={`flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 font-medium text-xs shadow-sm hover:opacity-95 transition-all active:scale-[0.98] ${
              isCollapsed ? 'px-0' : 'px-4'
            }`}
            title="Start a new chat"
          >
            <Plus className="h-4 w-4" />
            {!isCollapsed && <span>New Chat</span>}
          </button>
        </div>

        {!isCollapsed && (
          <>
            {/* Search Input */}
            <div className="px-3 pb-2">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-800/80 pl-8 pr-7 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 border border-transparent dark:border-slate-700/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Conversation History List */}
            <div className="flex-1 overflow-y-auto px-2 py-1">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">
                    {searchQuery ? 'No conversations match search' : 'No conversations yet'}
                  </p>
                </div>
              ) : (
                <>
                  {renderConversationGroup('Today', groupedConversations.today)}
                  {renderConversationGroup('Yesterday', groupedConversations.yesterday)}
                  {renderConversationGroup('Previous 7 Days', groupedConversations.lastWeek)}
                  {renderConversationGroup('Older', groupedConversations.older)}
                </>
              )}
            </div>
          </>
        )}

        {isCollapsed && (
          <div className="flex-1 flex flex-col items-center py-2 gap-2 overflow-y-auto">
            {conversations.slice(0, 10).map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                title={c.title}
                className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${
                  c.id === activeId
                    ? 'bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-300 dark:border-sky-800'
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
              </button>
            ))}
          </div>
        )}

        {/* Footer / Settings & Theme */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-2.5">
          {!isCollapsed ? (
            <div className="flex flex-col gap-1">
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <Sliders className="h-4 w-4 text-sky-500" />
                <span>Assistant Persona</span>
              </button>

              <button
                onClick={onToggleTheme}
                className="flex items-center justify-between w-full rounded-xl px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-indigo-500" />
                  )}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <span className="text-[10px] text-slate-400 capitalize">{theme}</span>
              </button>

              {conversations.length > 0 && (
                <>
                  {showClearConfirm ? (
                    <div className="flex items-center justify-between px-3 py-1.5 text-xs bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600">
                      <span>Clear all chats?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onClearAll();
                            setShowClearConfirm(false);
                          }}
                          className="px-2 py-0.5 rounded bg-rose-500 text-white font-medium hover:bg-rose-600"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          className="px-2 py-0.5 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Clear All Conversations</span>
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onOpenSettings}
                title="Assistant Persona & Prompt"
                className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Sliders className="h-4 w-4" />
              </button>
              <button
                onClick={onToggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-500" />
                )}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
