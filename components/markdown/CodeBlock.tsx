'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

const CODE_FONT_SIZE = '13.5px';
const CODE_LINE_HEIGHT = '1.7';
const CODE_FONT_FAMILY =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

// Strips syntax highlighter base styles and forces strict minimalist token coloring overrides
const removeBackgrounds = (style: Record<string, CSSProperties>, isDark: boolean) =>
  Object.fromEntries(
    Object.entries(style).map(([key, value]) => {
      const isRoot = key.startsWith('pre[') || key.startsWith('code[');
      
      // Inject unified structural tokens for custom keywords, strings, and operators
      let structuralOverrides: CSSProperties = {};
      if (key.includes('keyword') || key.includes('operator')) {
        structuralOverrides = { color: isDark ? '#E5E5E5' : '#171717', fontWeight: '600' };
      } else if (key.includes('string') || key.includes('char')) {
        structuralOverrides = { color: isDark ? '#A3A3A3' : '#525252' };
      } else if (key.includes('comment')) {
        structuralOverrides = { color: isDark ? '#737373' : '#888888', fontStyle: 'italic' };
      } else if (key.includes('function')) {
        structuralOverrides = { color: isDark ? '#F5F5F5' : '#262626' };
      }

      return [
        key,
        {
          ...value,
          ...structuralOverrides,
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

const customDark = removeBackgrounds(vscDarkPlus, true);
const customLight = removeBackgrounds(vs, false);

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
      <div className="relative group rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#151515]">
        <button
          onClick={copyToClipboard}
          className={cn(
            'absolute right-3 top-3 z-10 rounded-md border p-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-sm',
            theme === 'light'
              ? 'border-neutral-300 bg-white/90 text-neutral-600 shadow-sm hover:text-neutral-900 hover:bg-white'
              : 'border-neutral-800 bg-neutral-950/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950',
          )}
          title="Copy code"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
        <div className="overflow-x-auto p-4">
          <SyntaxHighlighter
            language={lang}
            style={style}
            PreTag="div"
            className="!m-0 !bg-transparent !p-0 font-mono antialiased"
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

  return (
    <div className="group relative overflow-hidden bg-neutral-50 dark:bg-[#111111] rounded-lg">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100/70 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900/50">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          {lang || 'Code'}
        </span>
        <button
          onClick={copyToClipboard}
          className={cn(
            "flex items-center gap-1.5 text-[11px] font-medium transition-colors duration-150 py-0.5 px-1.5 rounded-md",
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

      {/* Code Content Area */}
      <div className="overflow-x-auto p-4 selection:bg-neutral-200/60 dark:selection:bg-neutral-800/60">
        <SyntaxHighlighter
          language={lang}
          style={style}
          PreTag="div"
          className="!m-0 !bg-transparent !p-0 font-mono antialiased"
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
    <code className="rounded bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 font-mono text-[13px] font-semibold text-neutral-800 dark:text-neutral-200 break-words">
      {children}
    </code>
  );
}