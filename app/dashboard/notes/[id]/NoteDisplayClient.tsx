'use client';
import { useState, memo } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';
import { CodeBlock } from '@/components/markdown/CodeBlock';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Star,
  Edit2,
  Trash2,
  ChevronLeft,
  Clock,
  Tag as TagIcon,
  FileText,
  Code2,
  BookOpen,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Note } from '@/types';
import Link from 'next/link';

interface NoteDisplayClientProps {
  note: Note;
  topicTitle: string | null;
  topicId: string | null;
  onEdit: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}

interface MarkdownRendererProps {
  content: string;
  resolvedTheme?: string;
}

export const MarkdownRenderer = memo(({ content, resolvedTheme }: MarkdownRendererProps) => (
  <div className={cn(
    "prose prose-neutral dark:prose-invert max-w-none font-sans",
    // Headings
    "prose-headings:tracking-tight prose-headings:font-bold prose-headings:text-[#1A1D1E] dark:prose-headings:text-[#E4E6EB]",
    "prose-h1:text-3xl prose-h1:tracking-tight prose-h2:text-2xl prose-h3:text-xl prose-h3:font-semibold",
    // Base Elements
    "prose-p:text-xs prose-p:leading-relaxed prose-p:text-[#687076] dark:prose-p:text-[#A0A0A0]",
    "prose-a:text-[#1A1D1E] dark:prose-a:text-[#E4E6EB] prose-a:underline prose-a:underline-offset-2 prose-a:transition-colors hover:prose-a:text-[#687076] dark:hover:prose-a:text-[#A0A0A0]",
    // Blockquotes
    "prose-blockquote:border-l-4 prose-blockquote:border-[#E6E8EB] dark:prose-blockquote:border-[#2D2D2D] prose-blockquote:bg-[#F4F7F6] dark:prose-blockquote:bg-[#111111] prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-md prose-blockquote:italic",
    // Tables
    "prose-table:border-collapse prose-table:w-full prose-table:my-4",
    "prose-th:border prose-th:border-[#E6E8EB] dark:prose-th:border-[#2D2D2D] prose-th:bg-[#F4F7F6] dark:prose-th:bg-[#1A1A1A] prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-bold prose-th:uppercase prose-th:tracking-wider prose-th:text-[10px] prose-th:text-[#687076] dark:prose-th:text-[#A0A0A0]",
    "prose-td:border prose-td:border-[#E6E8EB] dark:prose-td:border-[#2D2D2D] prose-td:px-4 prose-td:py-2.5 prose-td:text-xs prose-td:text-[#1A1D1E] dark:prose-td:text-[#E4E6EB]",
    "prose-tr:even:bg-[#F4F7F6]/50 dark:prose-tr:even:bg-[#111111]/20 prose-tr:hover:bg-[#F4F7F6]/30 dark:prose-tr:hover:bg-[#111111]/10",
    // Lists
    "prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5 prose-li:text-xs prose-li:text-[#687076] dark:prose-li:text-[#A0A0A0]",
    // Code structural overrides
    "prose-pre:bg-transparent prose-pre:p-0 prose-pre:border-0 prose-pre:shadow-none",
    "prose-code:before:content-none prose-code:after:content-none"
  )}>
    <ReactMarkdown
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          const isInline = !match && !className;
          
          return !isInline ? (
            <CodeBlock language={language} theme={resolvedTheme === 'dark' ? 'dark' : 'light'}>
              {String(children).replace(/\n$/, '')}
            </CodeBlock>
          ) : (
            <code 
              className="bg-[#F4F7F6] dark:bg-[#1A1A1A] border border-[#E6E8EB] dark:border-[#2D2D2D] px-1.5 py-0.5 rounded text-[11.5px] font-mono font-medium text-[#1A1D1E] dark:text-[#E4E6EB]" 
              {...props}
            >
              {children}
            </code>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto rounded-md ">
              <table className="min-w-full m-0 border-none">{children}</table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0] bg-[#F4F7F6] dark:bg-[#1A1A1A] border-b border-r border-[#E6E8EB] dark:border-[#2D2D2D] last:border-r-0">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="px-4 py-2.5 text-xs text-[#1A1D1E] dark:text-[#E4E6EB] border-b border-r border-[#E6E8EB] dark:border-[#2D2D2D] last:border-r-0 table-row:last:border-b-0">
              {children}
            </td>
          );
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-[#E6E8EB] dark:border-[#2D2D2D] bg-[#F4F7F6] dark:bg-[#111111] py-2 px-4 rounded-r-md my-4 italic text-xs text-[#687076] dark:text-[#A0A0A0]">
              {children}
            </blockquote>
          );
        },
        ul({ children }) {
          return <ul className="list-disc pl-5 my-3 space-y-1.5 text-[#687076] dark:text-[#A0A0A0]">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal pl-5 my-3 space-y-1.5 text-[#687076] dark:text-[#A0A0A0]">{children}</ol>;
        },
        li({ children }) {
          return <li className="pl-0.5">{children}</li>;
        },
        h1({ children }) {
          return <h1 className="text-3xl font-bold tracking-tight mb-4 mt-6 text-[#1A1D1E] dark:text-[#E4E6EB]">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-2xl font-bold tracking-tight mb-3 mt-5 text-[#1A1D1E] dark:text-[#E4E6EB]">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-xl font-semibold tracking-tight mb-2 mt-4 text-[#1A1D1E] dark:text-[#E4E6EB]">{children}</h3>;
        },
        p({ children }) {
          return <p className="mb-4 text-xs leading-relaxed text-[#687076] dark:text-[#A0A0A0]">{children}</p>;
        },
        a({ children, href }) {
          return (
            <a 
              href={href} 
              className="text-[#1A1D1E] dark:text-[#E4E6EB] underline underline-offset-2 hover:text-[#687076] dark:hover:text-[#A0A0A0] transition-colors duration-100 font-medium"
            >
              {children}
            </a>
          );
        },
        hr() {
          return <hr className="my-6 border-t border-[#E6E8EB] dark:border-[#2D2D2D]" />;
        },
        img({ src, alt }) {
          return (
            <span className="block my-4 not-prose border border-[#E6E8EB] dark:border-[#2D2D2D] p-1 rounded-lg bg-[#FFFFFF] dark:bg-[#1A1A1A]">
              <img src={src} alt={alt || ''} className="rounded-md max-w-full h-auto mx-auto" />
            </span>
          );
        },
      }}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  </div>
));


MarkdownRenderer.displayName = 'MarkdownRenderer';

export default function NoteDisplayClient({
  note,
  topicTitle,
  topicId,
  onEdit,
  onDelete,
}: NoteDisplayClientProps) {
  const { resolvedTheme } = useTheme();
  const [activeImplIndex, setActiveImplIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(note.isFavorite);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Toggle favorite with optimistic update
  const handleToggleFavorite = async () => {
    if (isTogglingFavorite) return;
    const previousFavorite = isFavorite;
    const newFavorite = !previousFavorite;
    setIsFavorite(newFavorite);
    setIsTogglingFavorite(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: newFavorite }),
      });
      if (!res.ok) {
        throw new Error('Failed to update favorite');
      }
    } catch (error) {
      setIsFavorite(previousFavorite);
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const renderContent = () => {
  switch (note.type) {
    case 'general':
      return (
        <div className="space-y-5">
          {note.content && (
            <div className="rounded-lg border border-[#E6E8EB] bg-[#F4F7F6] overflow-hidden dark:border-[#2D2D2D] dark:bg-[#111111]">
              <div className="flex items-center gap-2 border-b border-[#E6E8EB] px-4 py-2.5 dark:border-[#2D2D2D]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0]">
                  Content
                </span>
                <span className="rounded-full bg-[#FFFFFF] border border-[#E6E8EB] px-2 py-0.5 text-[9px] font-medium text-[#687076] uppercase dark:bg-[#1A1A1A] dark:border-[#2D2D2D] dark:text-[#A0A0A0]">
                  Markdown
                </span>
              </div>
              <div className="p-5 bg-[#FFFFFF] dark:bg-[#1A1A1A]">
                <MarkdownRenderer content={note.content} resolvedTheme={resolvedTheme} />
              </div>
            </div>
          )}
        </div>
      );

    case 'dsa':
      const dsa = note.dsa!;
      return (
        <div className="space-y-5">
          {/* Meta Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#687076] mb-1.5 dark:text-[#A0A0A0]">
                Platform
              </label>
              <div className="h-9 rounded-lg border border-[#E6E8EB] bg-[#F4F7F6] px-3 flex items-center text-xs font-medium text-[#1A1D1E] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#E4E6EB]">
                {dsa.platform}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#687076] mb-1.5 dark:text-[#A0A0A0]">
                Difficulty
              </label>
              <div className="h-9 rounded-lg border border-[#E6E8EB] bg-[#F4F7F6] dark:bg-[#1A1A1A] dark:border-[#2D2D2D] px-3 flex items-center">
                <span
                  className={cn(
                    'rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                    dsa.difficulty === 'Easy'
                      ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200/40 dark:border-green-500/20'
                      : dsa.difficulty === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border border-yellow-200/40 dark:border-yellow-500/20'
                      : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/40 dark:border-red-500/20'
                  )}
                >
                  {dsa.difficulty}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#687076] mb-1.5 dark:text-[#A0A0A0]">
                Pattern
              </label>
              <div className="h-9 rounded-lg border border-[#E6E8EB] bg-[#F4F7F6] px-3 flex items-center text-xs font-medium text-[#1A1D1E] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#E4E6EB]">
                {dsa.pattern}
              </div>
            </div>
          </div>

          {/* Problem Statement */}
          {dsa.problemStatement && (
            <div className="rounded-lg border border-[#E6E8EB] bg-[#F4F7F6] overflow-hidden dark:border-[#2D2D2D] dark:bg-[#111111]">
              <div className="flex items-center gap-2 border-b border-[#E6E8EB] px-4 py-2.5 dark:border-[#2D2D2D]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0]">
                  Problem Statement
                </span>
                <span className="rounded-full bg-[#FFFFFF] border border-[#E6E8EB] px-2 py-0.5 text-[9px] font-medium text-[#687076] uppercase dark:bg-[#1A1A1A] dark:border-[#2D2D2D] dark:text-[#A0A0A0]">
                  Markdown
                </span>
              </div>
              <div className="p-5 bg-[#FFFFFF] dark:bg-[#1A1A1A]">
                <MarkdownRenderer content={dsa.problemStatement} resolvedTheme={resolvedTheme} />
              </div>
            </div>
          )}

          {/* Implementations */}
          {dsa.implementations && dsa.implementations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0]">
                  Implementations
                </span>
              </div>
              {/* Tabs Container */}
              <div className="flex gap-1 border-b border-[#E6E8EB] dark:border-[#2D2D2D]">
                {dsa.implementations.map((impl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImplIndex(idx)}
                    className={cn(
                      'px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide border-b-2 transition-colors duration-100 -mb-px',
                      activeImplIndex === idx
                        ? 'border-[#1A1D1E] text-[#1A1D1E] dark:border-[#E4E6EB] dark:text-[#E4E6EB]'
                        : 'border-transparent text-[#687076] hover:text-[#1A1D1E] dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB]'
                    )}
                  >
                    {impl.language}
                  </button>
                ))}
              </div>
              {/* Active Implementation Panel */}
              <div className="space-y-4 pt-1">
                <div className="rounded-lg border border-[#E6E8EB] dark:border-[#2D2D2D] overflow-hidden">
                  <CodeBlock
                    language={dsa.implementations[activeImplIndex].language}
                    theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                  >
                    {dsa.implementations[activeImplIndex].code || '// No code'}
                  </CodeBlock>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#687076] mb-1.5 block dark:text-[#A0A0A0]">
                      Time Complexity
                    </label>
                    <div className="h-9 rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] px-3 flex items-center font-mono text-xs font-medium text-[#1A1D1E] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#E4E6EB]">
                      {dsa.implementations[activeImplIndex].timeComplexity || '—'}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#687076] mb-1.5 block dark:text-[#A0A0A0]">
                      Space Complexity
                    </label>
                    <div className="h-9 rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] px-3 flex items-center font-mono text-xs font-medium text-[#1A1D1E] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#E4E6EB]">
                      {dsa.implementations[activeImplIndex].spaceComplexity || '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes Card */}
          {dsa.notes && (
            <div className="rounded-lg border border-[#E6E8EB] bg-[#F4F7F6] overflow-hidden dark:border-[#2D2D2D] dark:bg-[#111111]">
              <div className="flex items-center gap-2 border-b border-[#E6E8EB] px-4 py-2.5 dark:border-[#2D2D2D]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0]">
                  Notes
                </span>
                <span className="rounded-full bg-[#FFFFFF] border border-[#E6E8EB] px-2 py-0.5 text-[9px] font-medium text-[#687076] uppercase dark:bg-[#1A1A1A] dark:border-[#2D2D2D] dark:text-[#A0A0A0]">
                  Markdown
                </span>
              </div>
              <div className="p-5 bg-[#FFFFFF] dark:bg-[#1A1A1A]">
                <MarkdownRenderer content={dsa.notes} resolvedTheme={resolvedTheme} />
              </div>
            </div>
          )}
        </div>
      );

    case 'qa':
      const qa = note.qa!;
      const validImportantPoints = (qa.importantPoints || []).filter(
        (point) => point.trim().length > 0
      );
      return (
        <div className="space-y-5">
          {((topicId && topicTitle) || qa.topic) && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#687076] mb-1.5 dark:text-[#A0A0A0]">
                Topic
              </label>
              <div className="h-9 rounded-lg border border-[#E6E8EB] bg-[#F4F7F6] px-3 flex items-center text-xs font-medium text-[#1A1D1E] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#E4E6EB]">
                {topicId && topicTitle ? (
                  <Link href={`/dashboard/topics/${topicId}`} className="text-inherit hover:underline decoration-1 underline-offset-2">
                    {topicTitle}
                  </Link>
                ) : (
                  <span>{qa.topic}</span>
                )}
              </div>
            </div>
          )}

          {/* Detailed Answer Card */}
          {qa.content && (
            <div className="rounded-lg border border-[#E6E8EB] bg-[#F4F7F6] overflow-hidden dark:border-[#2D2D2D] dark:bg-[#111111]">
              <div className="flex items-center gap-2 border-b border-[#E6E8EB] px-4 py-2.5 dark:border-[#2D2D2D]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0]">
                  Detailed Answer
                </span>
                <span className="rounded-full bg-[#FFFFFF] border border-[#E6E8EB] px-2 py-0.5 text-[9px] font-medium text-[#687076] uppercase dark:bg-[#1A1A1A] dark:border-[#2D2D2D] dark:text-[#A0A0A0]">
                  Markdown
                </span>
              </div>
              <div className="p-5 bg-[#FFFFFF] dark:bg-[#1A1A1A]">
                <MarkdownRenderer content={qa.content} resolvedTheme={resolvedTheme} />
              </div>
            </div>
          )}

          {/* Key Takeaways Card */}
          {validImportantPoints.length > 0 && (
            <div className="rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] overflow-hidden dark:border-[#2D2D2D] dark:bg-[#1A1A1A]">
              <div className="flex items-center justify-between border-b border-[#E6E8EB] px-4 py-2.5 dark:border-[#2D2D2D]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0]">
                  Key Takeaways
                </span>
              </div>
              <div className="p-4 space-y-2.5">
                {validImportantPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <span className="h-1 w-1 rounded-full bg-[#687076] mt-2 shrink-0 dark:bg-[#A0A0A0]" />
                    <p className="text-xs leading-relaxed text-[#687076] dark:text-[#A0A0A0]">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
};

const typeBadgeClass = cn(
  'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border',
  note.type === 'dsa'
    ? 'bg-[#00A3A3]/5 text-[#00A3A3] border-[#00A3A3]/20 dark:bg-[#00E0E0]/5 dark:text-[#00E0E0] dark:border-[#00E0E0]/20'
    : note.type === 'qa'
    ? 'bg-amber-500/5 text-amber-600 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
    : 'bg-[#687076]/5 text-[#1A1D1E] border-[#E6E8EB] dark:bg-[#A0A0A0]/10 dark:text-[#E4E6EB] dark:border-[#2D2D2D]'
);

  const TypeIcon = note.type === 'dsa' ? Code2 : note.type === 'qa' ? BookOpen : FileText;

  return (
    <div className="mx-auto pb-16 font-sans">
  {/* Header */}
  <div className="flex items-center gap-3.5 mb-6">
    <Link
      href="/dashboard/notes"
      className="group flex h-9 w-9 items-center justify-center rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] transition-colors duration-100 hover:bg-[#F4F7F6] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:hover:bg-[#111111]"
    >
      <ChevronLeft className="h-4 w-4 text-[#687076] group-hover:text-[#1A1D1E] dark:text-[#A0A0A0] dark:group-hover:text-[#E4E6EB] transition-colors duration-100" />
    </Link>
    <h1 className="text-3xl font-bold tracking-tight text-[#1A1D1E] dark:text-[#E4E6EB]">
      {note.title}
    </h1>
  </div>

  {/* Meta Info Layout Block */}
  <div className="flex flex-wrap items-center gap-3 pb-5 border-b border-[#E6E8EB] dark:border-[#2D2D2D] mb-6">
    {/* Type Badge Element */}
    <span className={typeBadgeClass}>
      <TypeIcon className="h-3.5 w-3.5" />
      {note.type === 'qa' ? 'Q&A' : note.type}
    </span>

    {/* Topic Navigation Pill */}
    {topicTitle && topicId && (
      <Link
        href={`/dashboard/topics/${topicId}`}
        className="inline-flex items-center gap-1.5 rounded border border-[#E6E8EB] bg-[#F4F7F6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#687076] hover:text-[#1A1D1E] dark:bg-[#1A1A1A] dark:border-[#2D2D2D] dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB] transition-colors duration-100"
      >
        <TagIcon className="h-3 w-3 text-[#687076] dark:text-[#A0A0A0]" />
        {topicTitle}
      </Link>
    )}

    {/* Timestamp Info */}
    <span className="inline-flex items-center gap-1.5 text-xs text-[#687076] dark:text-[#A0A0A0]">
      <Clock className="h-3.5 w-3.5" />
      {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
    </span>

    {/* Favorite Action Button */}
    <button
      type="button"
      onClick={handleToggleFavorite}
      disabled={isTogglingFavorite}
      className={cn(
        'inline-flex items-center justify-center h-7 w-7 rounded bg-transparent border-0 p-0 cursor-pointer transition-opacity duration-100',
        isFavorite ? 'text-amber-500' : 'text-[#687076]/40 hover:text-[#687076] dark:text-[#A0A0A0]/40 dark:hover:text-[#A0A0A0]',
        isTogglingFavorite && 'opacity-50 cursor-wait'
      )}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star className={cn('h-4 w-4', isFavorite && 'fill-amber-500', isTogglingFavorite && 'animate-pulse')} />
    </button>

    {/* Custom Tags Loop Block */}
    {note.tags && note.tags.length > 0 && (
      <div className="flex items-center gap-1.5 flex-wrap pl-2 border-l border-[#E6E8EB] dark:border-[#2D2D2D]">
        {note.tags.slice(0, 5).map((tag, i) => (
          <Link
            key={i}
            href={`/dashboard/notes?tag=${encodeURIComponent(tag)}`}
            className="rounded border border-[#E6E8EB] bg-[#FFFFFF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#687076] hover:bg-[#F4F7F6] hover:text-[#1A1D1E] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:bg-[#111111] dark:hover:text-[#E4E6EB] transition-colors duration-100"
          >
            #{tag}
          </Link>
        ))}
        {note.tags.length > 5 && (
          <Link
            href="/dashboard/tags"
            className="rounded border border-[#E6E8EB] bg-[#F4F7F6] px-1.5 py-0.5 text-[10px] font-bold text-[#687076] hover:bg-[#E6E8EB] dark:border-[#2D2D2D] dark:bg-[#111111] dark:text-[#A0A0A0] dark:hover:bg-[#2D2D2D] transition-colors duration-100"
          >
            +{note.tags.length - 5}
          </Link>
        )}
      </div>
    )}

    {/* Alignment Separator spacer */}
    <div className="hidden sm:block flex-1" />

    {/* Primary Manipulation Interfaces */}
    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
      <button
        type="button"
        onClick={onEdit}
        className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] text-xs font-bold text-[#687076] hover:text-[#1A1D1E] hover:bg-[#F4F7F6] transition-colors duration-100 active:scale-[0.98] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB] dark:hover:bg-[#111111]"
      >
        <Edit2 className="h-3.5 w-3.5" />
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-red-200/50 bg-[#FFFFFF] text-xs font-bold text-red-600 hover:bg-red-50/50 transition-colors duration-100 active:scale-[0.98] dark:border-red-900/30 dark:bg-[#1A1A1A] dark:text-red-400 dark:hover:bg-red-950/20"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  </div>

  {/* Main Workspace Viewport Render Block */}
  <div className="mt-6">{renderContent()}</div>
</div>
  );
}