'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atelierCaveLight, atelierCaveDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
}

export function CodeEditor({ language, value, onChange, placeholder = '// Your code here...' }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightLayerRef = useRef<HTMLDivElement>(null);
   const [isDark, setIsDark] = useState(false);
   const [cursorLine, setCursorLine] = useState(1);
   const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const checkDarkMode = () => {
      // Check for Tailwind dark class on documentElement
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };
    checkDarkMode();
    // Watch for class changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

   // Synchronize the scroll of the highlighter layer with the textarea
   const syncScroll = () => {
     if (textareaRef.current && highlightLayerRef.current) {
       const st = textareaRef.current.scrollTop;
       const sl = textareaRef.current.scrollLeft;
       highlightLayerRef.current.scrollTop = st;
       highlightLayerRef.current.scrollLeft = sl;
       setScrollTop(st);
     }
   };

   // Calculate line count
   const lineCount = value.split('\n').length;

   const updateCursorLine = useCallback(() => {
     const textarea = textareaRef.current;
     if (!textarea) return;
     const textUpToCursor = value.substring(0, textarea.selectionStart);
     setCursorLine(textUpToCursor.split('\n').length);
   }, [value]);

   // Track cursor position
   useEffect(() => {
     const textarea = textareaRef.current;
     if (!textarea) return;

     const handleClick = updateCursorLine;
     const handleMouseUp = updateCursorLine;
     const handleSelect = updateCursorLine;
     const handleKeyUp = () => updateCursorLine();
     const handleKeyDown = () => {
       requestAnimationFrame(updateCursorLine);
     };

     textarea.addEventListener('click', handleClick);
     textarea.addEventListener('mouseup', handleMouseUp);
     textarea.addEventListener('select', handleSelect);
     textarea.addEventListener('keyup', handleKeyUp);
     textarea.addEventListener('keydown', handleKeyDown);
     textarea.addEventListener('scroll', syncScroll);

     // Initial line
     updateCursorLine();

     return () => {
       textarea.removeEventListener('click', handleClick);
       textarea.removeEventListener('mouseup', handleMouseUp);
       textarea.removeEventListener('select', handleSelect);
       textarea.removeEventListener('keyup', handleKeyUp);
       textarea.removeEventListener('keydown', handleKeyDown);
       textarea.removeEventListener('scroll', syncScroll);
     };
   }, [updateCursorLine, value]);

   useEffect(() => {
     syncScroll();
     updateCursorLine();
   }, [updateCursorLine, value]);

  const sharedStyles: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '14px',
    lineHeight: '1.6',
    padding: '20px',
    tabSize: 2,
    whiteSpace: 'pre',
    wordBreak: 'keep-all',
  };

   // Line metrics
   const lineHeightPx = 14 * 1.6; // 22.4px
   const baseTop = 20 + (cursorLine - 1) * lineHeightPx;
   const adjustedHighlightTop = baseTop - scrollTop;

   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
     if (e.key === 'Tab') {
       e.preventDefault();
       const textarea = textareaRef.current;
       if (!textarea) return;

       const start = textarea.selectionStart;
       const end = textarea.selectionEnd;
       const newValue = value.substring(0, start) + '  ' + value.substring(end);
       onChange(newValue);

       requestAnimationFrame(() => {
         textarea.selectionStart = textarea.selectionEnd = start + 2;
       });
       return;
     }

     // Auto-indent on Enter after opening brace/bracket/paren
     if (e.key === 'Enter') {
       const textarea = textareaRef.current;
       if (!textarea) return;

       const start = textarea.selectionStart;
       const end = textarea.selectionEnd;
       if (start !== end) return;

       const lineStart = value.lastIndexOf('\n', start - 1) + 1;
       const lineBeforeCursor = value.substring(lineStart, start);
       const indentMatch = lineBeforeCursor.match(/^[ \t]*/);
       const currentIndent = indentMatch ? indentMatch[0] : '';

       const trimmed = lineBeforeCursor.trim();
       const openChars: Record<string, string> = { '{': '}', '[': ']', '(': ')' };
       const openChar = Object.keys(openChars).find(c => trimmed.endsWith(c));

       if (openChar) {
         e.preventDefault();
         const closeChar = openChars[openChar];
         const innerIndent = currentIndent + '  ';

         // Check if there's already an auto-inserted closing character right after the cursor
         const nextChar = value[start];
         const hasImmediateCloser = nextChar === closeChar;

         let newValue: string;
         if (hasImmediateCloser) {
           // Replace the immediate closer with a properly positioned one on its own line
           newValue = value.substring(0, start) + '\n' + innerIndent + '\n' + currentIndent + closeChar + value.substring(start + 1);
         } else {
           // Insert both inner content line and closing brace
           newValue = value.substring(0, start) + '\n' + innerIndent + '\n' + currentIndent + closeChar + value.substring(end);
         }

         onChange(newValue);

         requestAnimationFrame(() => {
           textarea.selectionStart = textarea.selectionEnd = start + 1 + innerIndent.length;
         });
         return;
       }
     }

     // Auto-closing pairs: opening -> closing
     const pairs: Record<string, string> = {
       '(': ')',
       '[': ']',
       '{': '}',
       '"': '"',
       "'": "'",
       '`': '`',
     };

     const closingPair = pairs[e.key];
     if (closingPair) {
       const textarea = textareaRef.current;
       if (!textarea) return;

       const start = textarea.selectionStart;
       const end = textarea.selectionEnd;
       const hasSelection = start !== end;

       if (hasSelection) {
         const selectedText = value.substring(start, end);
         const newValue = value.substring(0, start) + e.key + selectedText + closingPair + value.substring(end);
         onChange(newValue);
         requestAnimationFrame(() => {
           textarea.selectionStart = start + 1;
           textarea.selectionEnd = end + 1;
         });
       } else {
         const nextChar = value[start];
         if (nextChar !== closingPair) {
           const newValue = value.substring(0, start) + e.key + closingPair + value.substring(end);
           onChange(newValue);
           requestAnimationFrame(() => {
             textarea.selectionStart = textarea.selectionEnd = start + 1;
           });
         } else {
           requestAnimationFrame(() => {
             textarea.selectionStart = textarea.selectionEnd = start + 1;
           });
         }
       }
       e.preventDefault();
     }

     // Auto-indent on closing brace/bracket/paren when at line start
     const closingBraces: Record<string, string> = {
       '}': '{',
       ']': '[',
       ')': '(',
     };
     if (closingBraces[e.key]) {
       const textarea = textareaRef.current;
       if (!textarea) return;

       const start = textarea.selectionStart;
       const end = textarea.selectionEnd;
       if (start !== end) return;

       const lineStart = value.lastIndexOf('\n', start - 1) + 1;
       const textBeforeCursor = value.substring(lineStart, start);
       const isAtLineStart = /^\s*$/.test(textBeforeCursor);

       if (isAtLineStart) {
         const openingBrace = closingBraces[e.key];
         const textUpToCursor = value.substring(0, start);
         let indentLevel = 0;
         let matchingIndent = 0;
         for (let i = 0; i < textUpToCursor.length; i++) {
           const char = textUpToCursor[i];
           if (char === openingBrace) {
             indentLevel++;
             matchingIndent = getIndentationAt(value, i);
           } else if (char === e.key) {
             indentLevel--;
           }
         }

         if (indentLevel > 0 && matchingIndent > 0) {
           e.preventDefault();
           const indent = ' '.repeat(matchingIndent);
           const newValue = value.substring(0, start) + indent + e.key + value.substring(end);
           onChange(newValue);
           requestAnimationFrame(() => {
             textarea.selectionStart = textarea.selectionEnd = start + matchingIndent + 1;
           });
         }
       }
     }

     // Handle backspace to delete matching pair
     if (e.key === 'Backspace') {
       const textarea = textareaRef.current;
       if (!textarea) return;

       const start = textarea.selectionStart;
       const end = textarea.selectionEnd;
       if (start !== end) return;

       const pairsReverse: Record<string, string> = { ')': '(', ']': '[', '}': '{', '"': '"', "'": "'", '`': '`' };
       const prevChar = value[start - 1];
       const currentChar = value[start];

       if (pairsReverse[currentChar] && prevChar === pairsReverse[currentChar]) {
         e.preventDefault();
         const newValue = value.substring(0, start - 1) + value.substring(start + 1);
         onChange(newValue);
         requestAnimationFrame(() => {
           textarea.selectionStart = textarea.selectionEnd = start - 1;
         });
       }
     }
   };

    function getIndentationAt(text: string, position: number): number {
      const lineStart = text.lastIndexOf('\n', position - 1) + 1;
      const line = text.substring(lineStart, position);
      const match = line.match(/^[ \t]*/);
      return match ? match[0].length : 0;
    }

  return (
    <div className="relative h-[300px] w-full transition-all duration-300 bg-white dark:bg-neutral-900 overflow-hidden">
      {/* Line Numbers Column */}
      <div
        className="absolute left-0 top-0 bottom-0 w-12 overflow-hidden bg-white dark:bg-neutral-900 select-none pointer-events-none z-0"
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: '14px',
          lineHeight: '1.6',
          textAlign: 'right',
        }}
      >
        <div
          style={{
            padding: '20px 8px 20px 12px',
            transform: `translateY(-${scrollTop}px)`,
            willChange: 'transform',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => {
            const lineNum = i + 1;
            const isCurrentLine = lineNum === cursorLine;
            return (
              <div
                key={lineNum}
                className={cn(
                  "transition-colors duration-75",
                  isCurrentLine
                    ? isDark
                      ? 'text-neutral-100'
                      : 'text-neutral-900'
                    : 'text-neutral-400 dark:text-neutral-500'
                )}
                style={{ height: lineHeightPx, lineHeight: '1.6' }}
              >
                {lineNum}
              </div>
            );
          })}
        </div>
      </div>

        {/* Syntax Highlighted Layer */}
        <div
          ref={highlightLayerRef}
          className="absolute inset-0 overflow-hidden pointer-events-none z-0"
          style={{ paddingLeft: '48px' }}
          aria-hidden="true"
        >
          <SyntaxHighlighter
            language={language.toLowerCase()}
            style={isDark ? atelierCaveDark : atelierCaveLight}
            customStyle={{
              ...sharedStyles,
              margin: 0,
              background: 'transparent',
              minWidth: '100%',
              minHeight: '100%',
              paddingLeft: '4px',
            }}
            codeTagProps={{
              style: {
                fontFamily: 'inherit',
                lineHeight: 'inherit',
                paddingRight: '20px',
              }
            }}
          >
            {value || placeholder}
          </SyntaxHighlighter>
        </div>

        {/* Current line highlight - full width including gutter */}
        <div
          className="absolute pointer-events-none z-0"
          style={{
            left: '0',
            right: '0',
            top: adjustedHighlightTop,
            height: lineHeightPx,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          }}
        />

        {/* Editable Textarea Layer */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        spellCheck={false}
        className={cn(
          "absolute inset-0 w-full h-full bg-transparent outline-none resize-none z-10",
          "text-transparent selection:bg-neutral-200 selection:text-neutral-900",
          "dark:selection:bg-neutral-700 dark:selection:text-neutral-100",
          "overflow-auto",
          "caret-neutral-900 dark:caret-neutral-100",
          "pl-[48px]"
        )}
        style={{
          ...sharedStyles,
          paddingLeft: '52px',
        }}
      />
    </div>
  );
}
