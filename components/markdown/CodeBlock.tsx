'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

const CODE_FONT_SIZE = '14px';
const CODE_LINE_HEIGHT = '1.65';
const CODE_FONT_FAMILY =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

// Helper to remove token backgrounds/shadows so Tailwind controls the container color
const removeBackgrounds = (style: Record<string, CSSProperties>) =>
  Object.fromEntries(
    Object.entries(style).map(([key, value]) => {
      const isRoot = key.startsWith('pre[') || key.startsWith('code[');
      return [
        key,
        {
          ...value,
          ...(isRoot
            ? {
                fontSize: CODE_FONT_SIZE,
                lineHeight: CODE_LINE_HEIGHT,
                fontFamily: CODE_FONT_FAMILY,
              }
            : null),
          background: 'transparent',
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
          textShadow: 'none',
        },
      ];
    }),
  ) as Record<string, CSSProperties>;

const customDark = removeBackgrounds(vscDarkPlus);
const customLight = removeBackgrounds(vs);

interface CodeBlockProps {
  language?: string;
  children: React.ReactNode;
  theme?: 'light' | 'dark';
  minimal?: boolean;
}

export function CodeBlock({ language = 'text', children, theme = 'dark', minimal = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');
  const lang = language.toLowerCase();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const style = theme === 'light' ? customLight : customDark;

  if (minimal) {
    return (
      <div className="relative group bg-white dark:bg-neutral-900 ">
        <button
          onClick={copyToClipboard}
          className={cn(
            'absolute right-4 top-4 z-10 rounded-md border p-2 opacity-0 transition-opacity group-hover:opacity-100',
            theme === 'light'
              ? 'border-neutral-200 bg-white/80 text-neutral-600 shadow-sm hover:text-neutral-900'
              : 'border-neutral-700 bg-neutral-900/50 text-neutral-400 hover:text-white',
          )}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
        <SyntaxHighlighter
          language={lang}
          style={style}
          PreTag="div"
          className="!m-0 !bg-transparent !p-4 font-mono"
          customStyle={{
            fontSize: CODE_FONT_SIZE,
            lineHeight: CODE_LINE_HEIGHT,
            fontFamily: CODE_FONT_FAMILY,
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden bg-white dark:bg-neutral-900">
      {/* Header bar: Consistent Neutral Scale */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900">
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          {lang || 'Code'}
        </span>
        <button
          onClick={copyToClipboard}
          className={cn(
            "flex items-center gap-1.5 text-[11px] font-medium transition-all",
            copied 
              ? "text-emerald-600 dark:text-emerald-400" 
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          )}
          title={copied ? "Copied" : "Copy code"}
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
          className="!m-0 !bg-transparent !p-4 font-mono"
          customStyle={{
            fontSize: CODE_FONT_SIZE,
            lineHeight: CODE_LINE_HEIGHT,
            fontFamily: CODE_FONT_FAMILY,
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
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
