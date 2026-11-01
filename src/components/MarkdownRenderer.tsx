import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

const CodeBlock: React.FC<{ language: string; value: string }> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const lines = value.split('\n');
  const displayLang = language || 'text';

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950 shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-sky-400" />
          <span className="font-mono font-semibold uppercase tracking-wider text-slate-200">
            {displayLang}
          </span>
          <span className="text-slate-500">
            • {lines.length} {lines.length === 1 ? 'line' : 'lines'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="overflow-x-auto p-4 text-[13px] font-mono leading-relaxed text-slate-100">
        <pre className="m-0 p-0 font-mono">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-body space-y-3 leading-relaxed text-slate-800 dark:text-slate-200 text-[15px]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeContent = String(children).replace(/\n$/, '');

            // Fenced code block or multi-line
            if (match || codeContent.includes('\n')) {
              return <CodeBlock language={match ? match[1] : ''} value={codeContent} />;
            }

            // Inline code
            return (
              <code
                className="rounded-md bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 text-xs font-mono font-medium text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-slate-700/60"
                {...props}
              >
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="leading-relaxed mb-2 last:mb-0">{children}</p>;
          },
          h1({ children }) {
            return (
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-4 mb-2 pb-1 border-b border-slate-200 dark:border-slate-800">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-3 mb-2">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-2.5 mb-1.5">
                {children}
              </h3>
            );
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="pl-0.5">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 px-4 py-2 italic text-slate-700 dark:text-slate-300 rounded-r-lg my-2">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-sm border-collapse">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 font-semibold">{children}</thead>;
          },
          th({ children }) {
            return <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">{children}</th>;
          },
          td({ children }) {
            return <td className="p-2.5 border-b border-slate-100 dark:border-slate-800/60">{children}</td>;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
              >
                {children}
              </a>
            );
          },
          hr() {
            return <hr className="my-4 border-slate-200 dark:border-slate-800" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
