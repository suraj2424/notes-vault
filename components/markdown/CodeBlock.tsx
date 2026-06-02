'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import type { CSSProperties } from 'react';
import { Copy, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const CODE_FONT_SIZE = '13.5px';
const CODE_LINE_HEIGHT = '1.7';
const CODE_FONT_FAMILY =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

const lightTheme: Record<string, CSSProperties> = {
  'pre[class*="language-"]': {
    background: 'transparent',
    color: '#24292e',
    fontFamily: CODE_FONT_FAMILY,
    fontSize: CODE_FONT_SIZE,
    lineHeight: CODE_LINE_HEIGHT,
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    tabSize: 2,
    hyphens: 'none',
  },
  'code[class*="language-"]': {
    background: 'transparent',
    color: '#24292e',
    fontFamily: CODE_FONT_FAMILY,
    fontSize: CODE_FONT_SIZE,
    lineHeight: CODE_LINE_HEIGHT,
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    tabSize: 2,
    hyphens: 'none',
  },
  'comment': { color: '#6a737d' },
  'prolog': { color: '#6a737d' },
  'doctype': { color: '#6a737d' },
  'cdata': { color: '#6a737d' },
  'punctuation': { color: '#24292e' },
  'property': { color: '#005cc5' },
  'tag': { color: '#22863a' },
  'boolean': { color: '#d73a49' },
  'number': { color: '#d73a49' },
  'constant': { color: '#005cc5' },
  'symbol': { color: '#005cc5' },
  'deleted': { color: '#d73a49' },
  'selector': { color: '#22863a' },
  'attr-name': { color: '#6f42c1' },
  'string': { color: '#032f62' },
  'char': { color: '#032f62' },
  'builtin': { color: '#005cc5' },
  'inserted': { color: '#22863a' },
  'operator': { color: '#d73a49' },
  'entity': { color: '#e36209' },
  'url': { color: '#032f62' },
  'atrule': { color: '#d73a49' },
  'attr-value': { color: '#032f62' },
  'keyword': { color: '#d73a49' },
  'function': { color: '#6f42c1' },
  'class-name': { color: '#6f42c1' },
  'regex': { color: '#032f62' },
  'important': { color: '#e36209' },
  'variable': { color: '#005cc5' },
  'bold': { fontWeight: 'bold' },
  'italic': { fontStyle: 'italic' },
};

const darkTheme: Record<string, CSSProperties> = {
  'pre[class*="language-"]': {
    background: 'transparent',
    color: '#e6edf3',
    fontFamily: CODE_FONT_FAMILY,
    fontSize: CODE_FONT_SIZE,
    lineHeight: CODE_LINE_HEIGHT,
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    tabSize: 2,
    hyphens: 'none',
  },
  'code[class*="language-"]': {
    background: 'transparent',
    color: '#e6edf3',
    fontFamily: CODE_FONT_FAMILY,
    fontSize: CODE_FONT_SIZE,
    lineHeight: CODE_LINE_HEIGHT,
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    tabSize: 2,
    hyphens: 'none',
  },
  'comment': { color: '#8b949e' },
  'prolog': { color: '#8b949e' },
  'doctype': { color: '#8b949e' },
  'cdata': { color: '#8b949e' },
  'punctuation': { color: '#c9d1d9' },
  'property': { color: '#f87171' },
  'tag': { color: '#7ee787' },
  'boolean': { color: '#f87171' },
  'number': { color: '#f87171' },
  'constant': { color: '#79c0ff' },
  'symbol': { color: '#79c0ff' },
  'deleted': { color: '#f87171' },
  'selector': { color: '#7ee787' },
  'attr-name': { color: '#d2a8ff' },
  'string': { color: '#a5d6ff' },
  'char': { color: '#a5d6ff' },
  'builtin': { color: '#79c0ff' },
  'inserted': { color: '#7ee787' },
  'operator': { color: '#ffa657' },
  'entity': { color: '#ffa657' },
  'url': { color: '#a5d6ff' },
  'atrule': { color: '#ff7b72' },
  'attr-value': { color: '#a5d6ff' },
  'keyword': { color: '#ff7b72' },
  'function': { color: '#d2a8ff' },
  'class-name': { color: '#d2a8ff' },
  'regex': { color: '#7ee787' },
  'important': { color: '#ffa657' },
  'variable': { color: '#79c0ff' },
  'bold': { fontWeight: 'bold' },
  'italic': { fontStyle: 'italic' },
};

interface CodeBlockProps {
  language?: string;
  children: React.ReactNode;
  theme?: 'light' | 'dark';
  minimal?: boolean;
}

export function CodeBlock({ language = 'text', children, theme = 'dark', minimal = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const codeString = String(children).replace(/\n$/, '');
  const lang = (language || 'text').toLowerCase();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- required for client-only render
    setMounted(true);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const style = theme === 'light' ? lightTheme : darkTheme;

  const renderHighlighted = () => (
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
  );

  const renderPlain = () => (
    <pre
      className="!m-0 !bg-transparent !p-0 font-mono antialiased whitespace-pre"
      style={{
        fontSize: CODE_FONT_SIZE,
        lineHeight: CODE_LINE_HEIGHT,
        fontFamily: CODE_FONT_FAMILY,
      }}
    >
      <code>{codeString}</code>
    </pre>
  );

  if (minimal) {
    return (
      <div className="relative group rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#151515] text-neutral-900 dark:text-neutral-100">
        <button
          onClick={copyToClipboard}
          className={cn(
            'absolute right-3 top-3 z-10 rounded-md border p-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-sm',
            theme === 'light'
              ? 'border-neutral-300 bg-white/90 text-neutral-600 shadow-sm hover:text-neutral-900 hover:bg-white'
              : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800',
          )}
          title="Copy code"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
        <div className="overflow-x-auto p-4">
          {mounted ? renderHighlighted() : renderPlain()}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111111] text-neutral-900 dark:text-neutral-100 rounded-lg">
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
              : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          )}
          title={copied ? "Copied" : "Copy code"}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Content Area */}
      <div className="overflow-x-auto p-4 selection:bg-neutral-200/60 dark:selection:bg-neutral-800/60">
        {mounted ? renderHighlighted() : renderPlain()}
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