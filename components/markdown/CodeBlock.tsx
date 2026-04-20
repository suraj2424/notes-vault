'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Helper to remove token backgrounds so Tailwind controls the container color
const removeBackgrounds = (style: typeof oneDark) =>
  Object.fromEntries(
    Object.entries(style).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return [key, { ...value, background: 'transparent', backgroundColor: 'transparent' }];
      }
      return [key, value];
    }),
  );

const customOneDark = removeBackgrounds(oneDark);
const customOneLight = removeBackgrounds(oneLight);

interface CodeBlockProps {
  language?: string;
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}

export function CodeBlock({ language = 'text', children, theme = 'dark' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');
  const lang = language.toLowerCase();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const style = theme === 'light' ? customOneLight : customOneDark;

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      {/* Header bar: Neutral-50 for light, Neutral-900 for dark */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900/50">
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          {lang || 'Code'}
        </span>
        <button
          onClick={copyToClipboard}
          className={cn(
            "flex items-center gap-1.5 text-[11px] font-medium transition-all",
            copied 
              ? "text-green-600 dark:text-green-400" 
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          )}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Area */}
      <div className="overflow-x-auto selection:bg-neutral-200 dark:selection:bg-neutral-800">
        <SyntaxHighlighter
          language={lang}
          style={style}
          PreTag="div"
          className="!m-0 !bg-transparent !p-4"
          customStyle={{
            fontSize: '13px',
            lineHeight: '1.6',
            background: 'transparent',
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

// Inline code component for markdown
export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[13px] font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
      {children}
    </code>
  );
}