'use client';

import { useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';
import { CodeBlock } from '@/components/markdown/CodeBlock';
import ReactMarkdown from 'react-markdown';
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

export default function NoteDisplayClient({
  note,
  topicTitle,
  topicId,
  onEdit,
  onDelete,
}: NoteDisplayClientProps) {
  const { resolvedTheme } = useTheme();
  const [activeImplIndex, setActiveImplIndex] = useState(0);

  // Markdown renderer with syntax highlighting
  const MarkdownRenderer = ({ content }: { content: string }) => (
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
            <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );

  const renderContent = () => {
    switch (note.type) {
      case 'general':
        return (
          <div className="space-y-6">
            {note.content && (
              <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
                  <span className="text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                    Content
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[9px] font-bold text-neutral-500 uppercase dark:bg-neutral-800 dark:text-neutral-400">
                    Markdown
                  </span>
                </div>
                <div className="p-6">
                  <MarkdownRenderer content={note.content!} />
                </div>
              </div>
            )}
          </div>
        );

      case 'dsa':
        const dsa = note.dsa!;
        return (
          <div className="space-y-6">
            {/* Meta row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 mb-2 dark:text-neutral-400">
                  Platform
                </label>
                <div className="h-10 rounded-xl border border-neutral-200 bg-neutral-50 px-4 flex items-center text-[13px] font-medium text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                  {dsa.platform}
                </div>
              </div>
              <div>
                <label className="block text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 mb-2 dark:text-neutral-400">
                  Difficulty
                </label>
                <div className="h-10 rounded-xl border border-neutral-200 bg-neutral-50 px-4 flex items-center">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider',
                      dsa.difficulty === 'Easy'
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                        : dsa.difficulty === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    )}
                  >
                    {dsa.difficulty}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 mb-2 dark:text-neutral-400">
                  Pattern
                </label>
                <div className="h-10 rounded-xl border border-neutral-200 bg-neutral-50 px-4 flex items-center text-[13px] font-medium text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                  {dsa.pattern}
                </div>
              </div>
            </div>

            {/* Problem Statement */}
            {dsa.problemStatement && (
              <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
                  <span className="text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                    Problem Statement
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[9px] font-bold text-neutral-500 uppercase dark:bg-neutral-800 dark:text-neutral-400">
                    Markdown
                  </span>
                </div>
                <div className="p-5">
                  <MarkdownRenderer content={dsa.problemStatement} />
                </div>
              </div>
            )}

            {/* Implementations */}
            {dsa.implementations && dsa.implementations.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                    Implementations
                  </span>
                </div>
                {/* Tabs */}
                <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
                  {dsa.implementations.map((impl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImplIndex(idx)}
                      className={cn(
                        'px-4 py-2 text-[11px] font-black uppercase tracking-wider border-b-2 transition-colors',
                        activeImplIndex === idx
                          ? 'border-neutral-900 text-neutral-900 dark:border-neutral-50 dark:text-neutral-50'
                          : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                      )}
                    >
                      {impl.language}
                    </button>
                  ))}
                </div>
                {/* Active implementation */}
                <div className="space-y-4">
                  <CodeBlock
                    language={dsa.implementations[activeImplIndex].language}
                    theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                  >
                    {dsa.implementations[activeImplIndex].code || '// No code'}
                  </CodeBlock>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 mb-2 block dark:text-neutral-400">
                        Time Complexity
                      </label>
                      <div className="h-10 rounded-xl border border-neutral-200 bg-neutral-50 px-4 flex items-center font-mono text-[13px] text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                        {dsa.implementations[activeImplIndex].timeComplexity || '—'}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 mb-2 block dark:text-neutral-400">
                        Space Complexity
                      </label>
                      <div className="h-10 rounded-xl border border-neutral-200 bg-neutral-50 px-4 flex items-center font-mono text-[13px] text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                        {dsa.implementations[activeImplIndex].spaceComplexity || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {dsa.notes && (
              <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
                  <span className="text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                    Notes
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[9px] font-bold text-neutral-500 uppercase dark:bg-neutral-800 dark:text-neutral-400">
                    Markdown
                  </span>
                </div>
                <div className="p-5">
                  <MarkdownRenderer content={dsa.notes} />
                </div>
              </div>
            )}
          </div>
        );

      case 'qa':
        const qa = note.qa!;
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 mb-2 dark:text-neutral-400">
                Topic
              </label>
              <div className="h-10 rounded-xl border border-neutral-200 bg-neutral-50 px-4 flex items-center text-[13px] font-medium text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                {qa.topic}
              </div>
            </div>
            {qa.content && (
              <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
                  <span className="text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                    Detailed Answer
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[9px] font-bold text-neutral-500 uppercase dark:bg-neutral-800 dark:text-neutral-400">
                    Markdown
                  </span>
                </div>
                <div className="p-6">
                  <MarkdownRenderer content={qa.content} />
                </div>
              </div>
            )}
            {qa.importantPoints && qa.importantPoints.length > 0 && (
              <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
                  <span className="text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                    Key Takeaways
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {qa.importantPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 mt-2.5 dark:bg-neutral-600" />
                      <p className="text-[13px] text-neutral-700 dark:text-neutral-300">
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

  // Type badge styles
  const typeBadgeClass = cn(
    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider',
    note.type === 'dsa'
      ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
      : note.type === 'qa'
      ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
  );

  const TypeIcon = note.type === 'dsa' ? Code2 : note.type === 'qa' ? BookOpen : FileText;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/notes"
          className="group flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white transition-all hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
        >
          <ChevronLeft className="h-4 w-4 text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100" />
        </Link>
        <h1 className="text-3xl font-serif tracking-tight text-neutral-950 dark:text-neutral-50">
          {note.title}
        </h1>
      </div>

      {/* Meta info row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Type Badge */}
        <span className={typeBadgeClass}>
          <TypeIcon className="h-3.5 w-3.5" />
          {note.type === 'qa' ? 'Q&A' : note.type}
        </span>

        {/* Topic */}
        {topicTitle && topicId && (
          <Link
            href={`/dashboard/topics/${topicId}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-200 transition-colors dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <TagIcon className="h-3 w-3" />
            {topicTitle}
          </Link>
        )}

        {/* Date */}
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-neutral-500 dark:text-neutral-400">
          <Clock className="h-3.5 w-3.5" />
          {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
        </span>

        {/* Favorite */}
        <span
          className={cn(
            'inline-flex items-center gap-1.5',
            note.isFavorite ? 'text-amber-500' : 'text-neutral-300 dark:text-neutral-600'
          )}
        >
          <Star className={cn('h-4 w-4', note.isFavorite && 'fill-amber-500')} />
        </span>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <TagIcon className="h-3.5 w-3.5 text-neutral-400" />
            {note.tags.slice(0, 5).map((tag, i) => (
              <span
                key={i}
                className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 5 && (
              <span className="rounded-full bg-neutral-50 px-2.5 py-0.5 text-[10px] font-black text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                +{note.tags.length - 5}
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Action Buttons */}
        <button
          onClick={onEdit}
          className="flex items-center gap-2 h-9 px-4 rounded-xl border border-neutral-200 bg-white text-[12px] font-bold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-95 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <Edit2 className="h-4 w-4" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-2 h-9 px-4 rounded-xl border border-red-200 bg-white text-[12px] font-bold text-red-600 transition-all hover:bg-red-50 active:scale-95 dark:border-red-900/30 dark:bg-neutral-900 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      {/* Main Content */}
      <div className="mt-8">{renderContent()}</div>
    </div>
  );
}
