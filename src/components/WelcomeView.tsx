import React from 'react';
import {
  Code2,
  ShieldCheck,
  Sparkles,
  FileText,
  Cpu,
  ArrowRight,
  Layers,
  Terminal,
} from 'lucide-react';
import { WELCOME_PROMPTS, WelcomePrompt } from '../utils/constants';

interface WelcomeViewProps {
  onSelectPrompt: (promptText: string) => void;
  activeModelName: string;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onSelectPrompt, activeModelName }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="h-5 w-5 text-sky-500" />;
      case 'ShieldCheck':
        return <ShieldCheck className="h-5 w-5 text-emerald-500" />;
      case 'Sparkles':
        return <Sparkles className="h-5 w-5 text-amber-500" />;
      case 'FileText':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <Sparkles className="h-5 w-5 text-sky-500" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 max-w-4xl mx-auto w-full select-none">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-600 dark:text-sky-400 mb-6">
        <Sparkles className="h-3.5 w-3.5 animate-pulse text-sky-500" />
        <span>Powered by {activeModelName}</span>
      </div>

      {/* Main Headline */}
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center text-slate-900 dark:text-white mb-3">
        Where ideas turn into intelligence.
      </h2>
      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 text-center max-w-lg mb-8 leading-relaxed">
        Ask complex coding challenges, architectural trade-offs, step-by-step concepts, or creative drafts with instant real-time streaming.
      </p>

      {/* Prompt Starter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
        {WELCOME_PROMPTS.map((item: WelcomePrompt) => (
          <button
            key={item.id}
            onClick={() => onSelectPrompt(item.prompt)}
            className="group flex flex-col text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-sky-300 dark:hover:border-sky-700/60 transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform">
                  {getIcon(item.icon)}
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {item.category}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
            </div>

            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              {item.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {item.prompt}
            </p>
          </button>
        ))}
      </div>

      {/* Feature Highlights Footer */}
      <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800/80 w-full flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-1.5">
          <Terminal className="h-3.5 w-3.5 text-sky-500" />
          <span>Live Code Highlight & Copy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-emerald-500" />
          <span>Server-Side SSE Streaming</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-purple-500" />
          <span>Full Multi-Turn Memory</span>
        </div>
      </div>
    </div>
  );
};
