'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Remove token backgrounds from prism styles
const removeBackgrounds = (style:typeof oneDark) =>
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
     <div className="relative group rounded-[10px] overflow-hidden border border-neutral-200 bg-white dark:border-[#2a2a2a] dark:bg-neutral-900">
       {/* Header bar */}
       <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100 px-4 py-2.5 text-neutral-600 dark:border-[#2a2a2a] dark:bg-[#161616] dark:text-[#555555] capitalize">
         <span className="text-[12px] font-medium">
           {lang ? lang : 'Code'}
         </span>
         <button
           onClick={copyToClipboard}
           className={cn(
             "flex items-center gap-1 text-[11px] transition-colors",
             copied ? "text-green-600 dark:text-green-400" : "text-neutral-500 hover:text-neutral-900 dark:text-[#555555] dark:hover:text-[#ededed]"
           )}
           title={copied ? "Copied" : "Copy code"}
         >
           {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
           <span>{copied ? 'Copied' : 'Copy'}</span>
         </button>
       </div>
       <div className="overflow-x-auto [&_span]:!bg-transparent">
         <SyntaxHighlighter
           language={lang}
           style={style}
           PreTag="div"
           className="!m-0 !p-4"
           customStyle={{
             margin: 0,
             padding: '1rem',
             fontSize: '0.75rem',
             lineHeight: '1.6',
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
    <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-sm font-mono text-neutral-600 dark:bg-[#1e1e1e] dark:text-[#888888]">
      {children}
    </code>
  );
}
