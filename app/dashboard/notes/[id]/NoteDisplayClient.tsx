'use client';

import { memo, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatDistanceToNow } from 'date-fns';
import {
  BookOpen,
  ChevronLeft,
  Clock,
  Code2,
  Edit2,
  FileText,
  Star,
  Tag as TagIcon,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { CodeBlock } from '@/components/markdown/CodeBlock';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';
import { Note, NoteType } from '@/types';

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

const NOTE_TYPE_META: Record<
  NoteType,
  { label: string; icon: LucideIcon; badge: string; accent: string }
> = {
  dsa: {
    label: 'DSA',
    icon: Code2,
    badge:
      'border-[#00A3A3]/25 bg-[#00A3A3]/5 text-[#00A3A3] dark:border-[#00E0E0]/25 dark:bg-[#00E0E0]/5 dark:text-[#00E0E0]',
    accent: 'text-[#00A3A3] dark:text-[#00E0E0]',
  },
  qa: {
    label: 'Q&A',
    icon: BookOpen,
    badge:
      'border-amber-500/25 bg-amber-500/5 text-amber-600 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400',
    accent: 'text-amber-600 dark:text-amber-400',
  },
  general: {
    label: 'General',
    icon: FileText,
    badge:
      'border-default bg-bg-muted text-primary dark:bg-[#A0A0A0]/10',
    accent: 'text-secondary',
  },
};

const DIFFICULTY_STYLES = {
  Easy: 'border-green-200/60 bg-green-100/70 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400',
  Medium:
    'border-yellow-200/70 bg-yellow-100/70 text-yellow-700 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-400',
  Hard: 'border-red-200/60 bg-red-100/70 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400',
} as const;

const iconButtonClass =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-default bg-surface text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary disabled:cursor-wait disabled:opacity-50';

export const MarkdownRenderer = memo(({ content, resolvedTheme }: MarkdownRendererProps) => (
  <div
    className={cn(
      'prose prose-neutral prose-base dark:prose-invert max-w-4xl font-sans sm:prose-lg',
      'prose-headings:text-balance prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-primary',
      'prose-h1:mt-0 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h3:font-semibold',
      'prose-p:leading-7 prose-a:font-medium prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-2',
      'prose-pre:bg-transparent prose-pre:p-0 prose-pre:shadow-none',
      'prose-code:before:content-none prose-code:after:content-none prose-code:rounded prose-code:border prose-code:border-default prose-code:bg-bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[12px] prose-code:font-medium prose-code:text-primary',
      'prose-hr:border-default prose-img:m-0'
    )}
  >
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          const isInline = !match && !className;

          if (isInline) {
            return <code {...props}>{children}</code>;
          }

          return (
            <div className="not-prose my-5 w-full max-w-none overflow-x-auto">
              <CodeBlock language={language} theme={resolvedTheme === 'dark' ? 'dark' : 'light'}>
                {String(children).replace(/\n$/, '')}
              </CodeBlock>
            </div>
          );
        },
        // Explicitly format list wrappers to eliminate unexpected box rendering
        ul({ children }) {
          return <ul className="my-5 list-none space-y-2 pl-0">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="my-5 list-decimal space-y-2 pl-6 text-primary">{children}</ol>;
        },
        li({ children }) {
          // Removes accidental trailing/leading text wrapper issues inside list nodes
          return (
            <li className="flex items-start gap-2 text-base text-primary">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-600" />
              <span className="flex-1">{children}</span>
            </li>
          );
        },
        table({ children }) {
          return (
            <div className="not-prose my-6 w-full overflow-x-auto rounded-lg border border-default">
              <table className="min-w-full border-collapse bg-surface">{children}</table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="border-b border-r border-default bg-bg-muted px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-secondary last:border-r-0">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="border-b border-r border-default px-4 py-3 text-sm text-primary last:border-r-0">
              {children}
            </td>
          );
        },
        tr({ children }) {
          return (
            <tr className="even:bg-[#F5F5F5] hover:bg-[#FAFAFA] dark:even:bg-[#161616] dark:hover:bg-[#1E1E1E]">
              {children}
            </tr>
          );
        },
        a({ children, href }) {
          return (
            <a href={href} className="font-medium text-primary underline-offset-2 hover:underline">
              {children}
            </a>
          );
        },
        img({ src, alt }) {
          return (
            <span className="not-prose my-6 block w-full overflow-hidden rounded-lg border border-default bg-surface p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt || ''}
                className="mx-auto h-auto max-h-[480px] max-w-full rounded-md object-contain"
              />
            </span>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
));

MarkdownRenderer.displayName = 'MarkdownRenderer';

function TypeBadge({ type }: { type: NoteType }) {
  const meta = NOTE_TYPE_META[type];
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
        meta.badge
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

function TagList({ tags, compact = false }: { tags?: string[]; compact?: boolean }) {
  if (!tags?.length) return null;

  const visibleTags = compact ? tags.slice(0, 5) : tags;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visibleTags.map((tag) => (
        <Link
          key={tag}
          href={`/dashboard/notes?tag=${encodeURIComponent(tag)}`}
          className="rounded border border-default bg-surface px-2 py-0.5 text-[10px] font-bold text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary"
        >
          #{tag}
        </Link>
      ))}
      {compact && tags.length > visibleTags.length && (
        <Link
          href="/dashboard/tags"
          className="rounded border border-default bg-bg-muted px-1.5 py-0.5 text-[10px] font-bold text-secondary transition-colors duration-100 hover:text-primary"
        >
          +{tags.length - visibleTags.length}
        </Link>
      )}
    </div>
  );
}

function UpdatedAt({ updatedAt }: { updatedAt: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary">
      <Clock className="h-3.5 w-3.5" />
      Updated {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
    </span>
  );
}

function TopicChip({
  topicId,
  topicTitle,
  fallback,
}: {
  topicId: string | null;
  topicTitle: string | null;
  fallback?: string;
}) {
  const label = topicTitle || fallback;
  if (!label) return null;

  const className =
    'inline-flex items-center gap-1.5 rounded border border-default bg-bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary transition-colors duration-100 hover:text-primary';

  if (topicId && topicTitle) {
    return (
      <Link href={`/dashboard/topics/${topicId}`} className={className}>
        <TagIcon className="h-3 w-3" />
        {topicTitle}
      </Link>
    );
  }

  return (
    <span className={className}>
      <TagIcon className="h-3 w-3" />
      {label}
    </span>
  );
}

function SectionPanel({
  title,
  children,
  meta,
  icon: Icon,
}: {
  title: string;
  children: ReactNode;
  meta?: string;
  icon?: LucideIcon;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-default bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-default bg-bg-muted px-4 py-3">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-secondary">
          {Icon && <Icon className="h-4 w-4" />}
          {title}
        </h2>
        {meta && (
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-secondary">
            {meta}
          </span>
        )}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}

function EmptyPanel({ title, message }: { title: string; message: string }) {
  return (
    <SectionPanel title={title}>
      <div className="rounded-lg border border-dashed border-default bg-[#F5F5F5]/40 px-4 py-10 text-center dark:bg-[#161616]/40">
        <p className="text-sm font-medium text-secondary">{message}</p>
      </div>
    </SectionPanel>
  );
}

function MetadataStrip({
  items,
}: {
  items: Array<{ label: string; value?: ReactNode; className?: string }>;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-default bg-surface px-3 py-3">
          <div className="text-[10px] font-bold uppercase tracking-wide text-secondary">
            {item.label}
          </div>
          <div className={cn('mt-1 text-sm font-semibold text-primary', item.className)}>
            {item.value || '-'}
          </div>
        </div>
      ))}
    </div>
  );
}

function StickyNoteHeader({
  note,
  topicTitle,
  topicId,
  qaTopic,
  isCompact,
  isFavorite,
  isTogglingFavorite,
  onToggleFavorite,
  onEdit,
  onDelete,
}: {
  note: Note;
  topicTitle: string | null;
  topicId: string | null;
  qaTopic?: string;
  isCompact: boolean;
  isFavorite: boolean;
  isTogglingFavorite: boolean;
  onToggleFavorite: () => void;
  onEdit: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 w-full border-b transition-all duration-150',
        isCompact
          ? 'border-default shadow-sm bg-[#FFFFFF] dark:bg-[#1A1A1A]'
          : 'border-transparent bg-[#FFFFFF] dark:bg-[#1A1A1A]'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-3">
        <Link
          href="/dashboard/notes"
          className={cn(iconButtonClass, 'mt-0.5')}
          aria-label="Back to notes"
          title="Back to notes"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        <div className="min-w-0 flex-1">
          <h1
            className={cn(
              'font-bold tracking-tight text-primary transition-all duration-150',
              isCompact ? 'truncate text-base leading-9' : 'text-2xl leading-tight sm:text-3xl'
            )}
          >
            {note.title}
          </h1>

          {!isCompact && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <TypeBadge type={note.type} />
              <UpdatedAt updatedAt={note.updatedAt} />
              <TopicChip topicId={topicId} topicTitle={topicTitle} fallback={qaTopic} />
              <TagList tags={note.tags} compact />
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleFavorite}
            disabled={isTogglingFavorite}
            className={cn(
              iconButtonClass,
              isFavorite
                ? 'border-amber-500/20 bg-amber-500/5 text-amber-500'
                : 'text-secondary'
            )}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star
              className={cn(
                'h-4 w-4',
                isFavorite && 'fill-amber-500'
              )}
            />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-default bg-surface px-3 text-xs font-bold text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary active:scale-[0.98]"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200/60 bg-surface px-3 text-xs font-bold text-red-600 transition-colors duration-100 hover:bg-red-50/70 active:scale-[0.98] dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function GeneralContent({
  note,
  resolvedTheme,
}: {
  note: Note;
  resolvedTheme?: string;
}) {
  if (!note.content) {
    return <EmptyPanel title="Content" message="This note does not have any content yet." />;
  }

  return (
    <SectionPanel title="Content" meta="Markdown" icon={FileText}>
      <MarkdownRenderer content={note.content} resolvedTheme={resolvedTheme} />
    </SectionPanel>
  );
}

function DSAContent({
  note,
  resolvedTheme,
  activeImplIndex,
  setActiveImplIndex,
}: {
  note: Note;
  resolvedTheme?: string;
  activeImplIndex: number;
  setActiveImplIndex: (index: number) => void;
}) {
  const dsa = note.dsa;
  if (!dsa) return <EmptyPanel title="DSA Details" message="No DSA details are available." />;

  const implementations = dsa.implementations || [];
  const safeActiveIndex = Math.min(activeImplIndex, Math.max(implementations.length - 1, 0));
  const activeImplementation = implementations[safeActiveIndex];

  return (
    <div className="space-y-5">
      <MetadataStrip
        items={[
          { label: 'Platform', value: dsa.platform },
          {
            label: 'Difficulty',
            value: (
              <span
                className={cn(
                  'inline-flex rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                  DIFFICULTY_STYLES[dsa.difficulty]
                )}
              >
                {dsa.difficulty}
              </span>
            ),
          },
          { label: 'Pattern', value: dsa.pattern },
        ]}
      />

      {dsa.problemStatement ? (
        <SectionPanel title="Problem Statement" meta="Markdown" icon={BookOpen}>
          <MarkdownRenderer content={dsa.problemStatement} resolvedTheme={resolvedTheme} />
        </SectionPanel>
      ) : (
        <EmptyPanel title="Problem Statement" message="No problem statement has been added." />
      )}

      <SectionPanel title="Implementations" icon={Code2}>
        {implementations.length > 0 && activeImplementation ? (
          <div className="space-y-4">
            <div className="flex gap-1 overflow-x-auto border-b border-default">
              {implementations.map((impl, idx) => (
                <button
                  key={`${impl.language}-${idx}`}
                  type="button"
                  onClick={() => setActiveImplIndex(idx)}
                  className={cn(
                    '-mb-px shrink-0 border-b-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition-colors duration-100',
                    safeActiveIndex === idx
                      ? 'border-[#1A1D1E] text-primary dark:border-[#E4E6EB]'
                      : 'border-transparent text-secondary hover:text-primary'
                  )}
                >
                  {impl.language || `Code ${idx + 1}`}
                </button>
              ))}
            </div>

            <div className="w-full max-w-none overflow-x-auto rounded-lg border border-default">
              <CodeBlock
                language={activeImplementation.language}
                theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
              >
                {activeImplementation.code || '// No code'}
              </CodeBlock>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-default bg-bg-muted px-3 py-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-secondary">
                  Time Complexity
                </div>
                <div className="mt-1 font-mono text-sm font-semibold text-primary">
                  {activeImplementation.timeComplexity || dsa.timeComplexity || '-'}
                </div>
              </div>
              <div className="rounded-lg border border-default bg-bg-muted px-3 py-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-secondary">
                  Space Complexity
                </div>
                <div className="mt-1 font-mono text-sm font-semibold text-primary">
                  {activeImplementation.spaceComplexity || dsa.spaceComplexity || '-'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-default bg-[#F5F5F5]/40 px-4 py-10 text-center dark:bg-[#161616]/40">
            <p className="text-sm font-medium text-secondary">No implementations have been added.</p>
          </div>
        )}
      </SectionPanel>

      {dsa.notes && (
        <SectionPanel title="Notes" meta="Markdown" icon={FileText}>
          <MarkdownRenderer content={dsa.notes} resolvedTheme={resolvedTheme} />
        </SectionPanel>
      )}
    </div>
  );
}

function QAContent({
  note,
  topicId,
  topicTitle,
  resolvedTheme,
}: {
  note: Note;
  topicId: string | null;
  topicTitle: string | null;
  resolvedTheme?: string;
}) {
  const qa = note.qa;
  if (!qa) return <EmptyPanel title="Q&A Details" message="No Q&A details are available." />;

  const validImportantPoints = (qa.importantPoints || []).filter(
    (point) => point.trim().length > 0
  );

  return (
    <div className="space-y-5">
      {((topicId && topicTitle) || qa.topic) && (
        <MetadataStrip
          items={[
            {
              label: 'Topic',
              value:
                topicId && topicTitle ? (
                  <Link
                    href={`/dashboard/topics/${topicId}`}
                    className="underline-offset-2 hover:underline"
                  >
                    {topicTitle}
                  </Link>
                ) : (
                  qa.topic
                ),
            },
          ]}
        />
      )}

      {qa.content ? (
        <SectionPanel title="Detailed Answer" meta="Markdown" icon={BookOpen}>
          <MarkdownRenderer content={qa.content} resolvedTheme={resolvedTheme} />
        </SectionPanel>
      ) : (
        <EmptyPanel title="Detailed Answer" message="No detailed answer has been added." />
      )}

      {validImportantPoints.length > 0 && (
        <SectionPanel title="Key Takeaways">
          <div className="space-y-3">
            {validImportantPoints.map((point, index) => (
              <div key={`${point}-${index}`} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-default bg-bg-muted text-[10px] font-bold text-secondary">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-secondary">{point}</p>
              </div>
            ))}
          </div>
        </SectionPanel>
      )}
    </div>
  );
}

export default function NoteDisplayClient({
  note,
  topicTitle,
  topicId,
  onEdit,
  onDelete,
}: NoteDisplayClientProps) {
  const { resolvedTheme } = useTheme();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [activeImplIndex, setActiveImplIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(note.isFavorite);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let scrollParent: HTMLElement | Window = window;
    let parent = root.parentElement;

    while (parent) {
      const style = window.getComputedStyle(parent);
      if (/(auto|scroll)/.test(`${style.overflowY}${style.overflow}`)) {
        scrollParent = parent;
        break;
      }
      parent = parent.parentElement;
    }

    const updateCompactState = () => {
      const scrollTop =
        scrollParent === window
          ? window.scrollY
          : (scrollParent as HTMLElement).scrollTop;
      setIsHeaderCompact(scrollTop > 16);
    };

    updateCompactState();
    scrollParent.addEventListener('scroll', updateCompactState, { passive: true });

    return () => scrollParent.removeEventListener('scroll', updateCompactState);
  }, []);

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
        return <GeneralContent note={note} resolvedTheme={resolvedTheme} />;
      case 'dsa':
        return (
          <DSAContent
            note={note}
            resolvedTheme={resolvedTheme}
            activeImplIndex={activeImplIndex}
            setActiveImplIndex={setActiveImplIndex}
          />
        );
      case 'qa':
        return (
          <QAContent
            note={note}
            topicId={topicId}
            topicTitle={topicTitle}
            resolvedTheme={resolvedTheme}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div ref={rootRef} className="w-full pt-4 pb-16 font-sans">
      <StickyNoteHeader
        note={note}
        topicTitle={topicTitle}
        topicId={topicId}
        qaTopic={note.qa?.topic}
        isCompact={isHeaderCompact}
        isFavorite={isFavorite}
        isTogglingFavorite={isTogglingFavorite}
        onToggleFavorite={handleToggleFavorite}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <main className="mx-auto mt-6 max-w-5xl px-5">
        <div className="space-y-5">{renderContent()}</div>
      </main>
    </div>
  );
}
