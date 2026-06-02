"use client";

import {
  memo,
  useEffect,
  useRef,
  useState,
  useMemo,
  type ReactNode,
  useCallback,
  Children,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDistanceToNow } from "date-fns";
import {
  type LucideIcon,
  BookOpen,
  ChevronLeft,
  Clock,
  Code2,
  Edit2,
  FileText,
  List,
  Star,
  Tag as TagIcon,
  Trash2,
  X,
} from "lucide-react";
import { CodeBlock } from "@/components/markdown/CodeBlock";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { Note, NoteType } from "@/types";

interface NoteDisplayClientProps {
  note: Note;
  topicTitle: string | null;
  topicId: string | null;
  onEdit: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  topicNotes?: Array<{ id: string; title: string; sequence?: number | null }>;
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
    label: "DSA",
    icon: Code2,
    badge:
      "border-[#00A3A3]/25 bg-[#00A3A3]/5 text-[#00A3A3] dark:border-[#00E0E0]/25 dark:bg-[#00E0E0]/5 dark:text-[#00E0E0]",
    accent: "text-[#00A3A3] dark:text-[#00E0E0]",
  },
  qa: {
    label: "Q&A",
    icon: BookOpen,
    badge:
      "border-amber-500/25 bg-amber-500/5 text-amber-600 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400",
    accent: "text-amber-600 dark:text-amber-400",
  },
  general: {
    label: "General",
    icon: FileText,
    badge: "border-default bg-bg-muted text-primary dark:bg-[#A0A0A0]/10",
    accent: "text-secondary",
  },
};

const DIFFICULTY_STYLES = {
  Easy: "border-green-200/60 bg-green-100/70 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400",
  Medium:
    "border-yellow-200/70 bg-yellow-100/70 text-yellow-700 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-400",
  Hard: "border-red-200/60 bg-red-100/70 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400",
} as const;

const iconButtonClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-default bg-surface text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary disabled:cursor-wait disabled:opacity-50";

function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]{1,3}([^`*_~]+)[`*_~]{1,3}/g, "$1")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function childrenToText(children: ReactNode): string {
  return Children.toArray(children).reduce<string>((acc, child) => {
    if (typeof child === "string" || typeof child === "number") return acc + child;
    if (typeof child === "object" && child !== null && "props" in child) {
      return acc + childrenToText((child as any).props.children);
    }
    return acc;
  }, "");
}

export function extractHeadings(content: string): Array<{ level: number; text: string; id: string }> {
  const headings: Array<{ level: number; text: string; id: string }> = [];
  const lines = content.split("\n");
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (match) {
      const level = match[1].length;
      const text = match[2];
      const id = slugify(stripMarkdown(text));
      headings.push({ level, text, id });
    }
  }

  return headings;
}

export const MarkdownRenderer = memo(
  ({ content, resolvedTheme }: MarkdownRendererProps) => {
    const headings = useMemo(() => extractHeadings(content), [content]);

    return (
      <div
        className={cn(
          "prose prose-neutral prose-base dark:prose-invert max-w-4xl font-sans sm:prose-lg",
          "prose-headings:text-balance prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-primary",
          "prose-h1:mt-0 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h3:font-semibold",
          "prose-p:leading-7 prose-a:font-medium prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-2",
          "prose-pre:bg-transparent prose-pre:p-0 prose-pre:shadow-none",
          "prose-code:before:content-none prose-code:after:content-none prose-code:rounded prose-code:border prose-code:border-default prose-code:bg-bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[12px] prose-code:font-medium prose-code:text-primary dark:prose-code:text-primary",
          "prose-hr:border-default prose-img:m-0",
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1({ children, ...props }) {
              return <h1 {...props} id={slugify(childrenToText(children))}>{children}</h1>;
            },
            h2({ children, ...props }) {
              return <h2 {...props} id={slugify(childrenToText(children))}>{children}</h2>;
            },
            h3({ children, ...props }) {
              return <h3 {...props} id={slugify(childrenToText(children))}>{children}</h3>;
            },
            h4({ children, ...props }) {
              return <h4 {...props} id={slugify(childrenToText(children))}>{children}</h4>;
            },
            h5({ children, ...props }) {
              return <h5 {...props} id={slugify(childrenToText(children))}>{children}</h5>;
            },
            h6({ children, ...props }) {
              return <h6 {...props} id={slugify(childrenToText(children))}>{children}</h6>;
            },
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const language = match ? match[1] : "";
              const isInline = !match && !String(children).includes("\n");

              if (isInline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <div className="not-prose my-5 w-full max-w-none overflow-x-auto">
                  <CodeBlock
                    language={language || "text"}
                    theme={resolvedTheme === "dark" ? "dark" : "light"}
                  >
                    {String(children).replace(/\n$/, "")}
                  </CodeBlock>
                </div>
              );
            },
            ul({ children }) {
            return (
              <ul className="my-5 list-none space-y-2 pl-0">{children}</ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="my-5 list-decimal space-y-2 pl-6 text-primary">
                {children}
              </ol>
            );
          },
          li({ children, ...props }) {
            // Check if this list item lives inside an ordered list context
            const isOrdered = props.className?.includes("ordered") || false;

            if (isOrdered) {
              return (
                <li className="text-base text-primary pl-1 marker:font-medium marker:text-neutral-500">
                  {children}
                </li>
              );
            }

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
                <table className="min-w-full border-collapse bg-surface">
                  {children}
                </table>
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
              <tr className="even:bg-neutral-100/50 hover:bg-neutral-50 dark:even:bg-neutral-900/40 dark:hover:bg-neutral-900/80 transition-colors">
                {children}
              </tr>
            );
          },
          a({ children, href }) {
            return (
              <a
                href={href}
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
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
                  alt={alt || ""}
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
    );
  },
);

MarkdownRenderer.displayName = "MarkdownRenderer";

interface TocNode {
  heading: { level: number; text: string; id: string };
  children: TocNode[];
}

interface SectionProgress {
  id: string;
  progress: number; // 0 to 1
}

function buildTocTree(
  headings: Array<{ level: number; text: string; id: string }>
): TocNode[] {
  const root: TocNode[] = [];
  const stack: TocNode[] = [{ heading: { level: 0, text: "", id: "" }, children: root }];

  for (const heading of headings) {
    const node: TocNode = { heading, children: [] };

    while (stack.length > 1 && stack[stack.length - 1].heading.level >= heading.level) {
      stack.pop();
    }

    stack[stack.length - 1].children.push(node);
    stack.push({ heading, children: node.children });
  }

  return root;
}

function TocContentNode({
  node,
  activeId,
  sectionProgress,
}: {
  node: TocNode;
  activeId?: string;
  sectionProgress: Map<string, number>;
}) {
  const { heading } = node;
  const progress = sectionProgress.get(heading.id);
  const isActive = heading.id === activeId;
  const isCompleted = progress === 1;
  const isInProgress = progress !== undefined && progress > 0 && progress < 1;

  return (
    <li className="group">
      <div className="flex items-center gap-2.5">
        {/* Indicator */}
        <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
          {isActive && isInProgress ? (
            /* Progress ring for active section being read */
            <svg className="h-4 w-4 -rotate-90" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-default" />
              <circle
                cx="8" cy="8" r="6" fill="none" stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray={`${progress! * 37.7} 37.7`}
                className="text-[#00A3A3] dark:text-[#00E0E0]"
              />
            </svg>
          ) : isActive ? (
            /* Solid teal dot for active at section start */
            <div className="h-2 w-2 rounded-full bg-[#00A3A3] dark:bg-[#00E0E0] shadow-[0_0_6px_rgba(0,163,163,0.5)]" />
          ) : isCompleted ? (
            /* Checkmark for completed */
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#00A3A3] dark:bg-[#00E0E0]">
              <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : (
            /* Gray dot for not reached */
            <div className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />
          )}
        </div>
        <a
          href={`#${heading.id}`}
          className={cn(
            "block truncate transition-colors duration-100 flex-1 py-0.5",
            isActive
              ? "text-[#00A3A3] dark:text-[#00E0E0] font-semibold"
              : isCompleted
                ? "text-primary"
                : "text-secondary hover:text-primary",
            heading.level === 1 && "text-sm font-bold",
            heading.level === 2 && "text-xs font-semibold",
            heading.level >= 3 && "text-[11px]"
          )}
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById(heading.id);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
        >
          {stripMarkdown(heading.text)}
        </a>
      </div>
      {node.children.length > 0 && (
        <ul className="space-y-0.5 pl-[7px] mt-0.5 border-l border-default ml-[3px]">
          {node.children.map((child) => (
            <TocContentNode
              key={child.heading.id}
              node={child}
              activeId={activeId}
              sectionProgress={sectionProgress}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function TableOfContents({
  headings,
  activeId,
  sectionProgress,
  overallProgress,
}: {
  headings: Array<{ level: number; text: string; id: string }>;
  activeId?: string;
  sectionProgress: Map<string, number>;
  overallProgress: number;
}) {
  if (!headings.length) return null;
  const tree = buildTocTree(headings);

  return (
    <nav className="sticky top-24 w-56 shrink-0 self-start hidden lg:block">
      <div className="rounded-lg border border-default bg-surface p-4">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-secondary mb-4">
          <List className="h-3.5 w-3.5" />
          On this page
        </div>

        {/* Overall reading progress */}
        <div className="mb-4 pb-4 border-b border-default">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-secondary">
              Read
            </span>
            <span className="text-[11px] font-bold text-[#00A3A3] dark:text-[#00E0E0]">
              {Math.round(overallProgress * 100)}%
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-default overflow-hidden">
            <div
              className="h-full rounded-full bg-[#00A3A3] dark:bg-[#00E0E0] transition-all duration-200"
              style={{ width: `${overallProgress * 100}%` }}
            />
          </div>
        </div>

        <ul className="space-y-1">
          {tree.map((node) => (
            <TocContentNode
              key={node.heading.id}
              node={node}
              activeId={activeId}
              sectionProgress={sectionProgress}
            />
          ))}
        </ul>
      </div>
    </nav>
  );
}

function TypeBadge({ type }: { type: NoteType }) {
  const meta = NOTE_TYPE_META[type];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
        meta.badge,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

function TagList({
  tags,
  compact = false,
}: {
  tags?: string[];
  compact?: boolean;
}) {
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
    "inline-flex items-center gap-1.5 rounded border border-default bg-bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary transition-colors duration-100 hover:text-primary";
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
        <div
          key={item.label}
          className="rounded-lg border border-default bg-surface px-3 py-3"
        >
          <div className="text-[10px] font-bold uppercase tracking-wide text-secondary">
            {item.label}
          </div>
          <div
            className={cn(
              "mt-1 text-sm font-semibold text-primary",
              item.className,
            )}
          >
            {item.value || "-"}
          </div>
        </div>
      ))}
    </div>
  );
}

function TopicNav({
  currentNoteId,
  topicNotes,
}: {
  currentNoteId: string;
  topicNotes: Array<{ id: string; title: string; sequence?: number | null }>;
}) {
  const sorted = [...topicNotes]
    .filter((n) => n.sequence != null)
    .sort((a, b) => (a.sequence ?? 9999) - (b.sequence ?? 9999));
  if (sorted.length < 2) return null;
  const currentIndex = sorted.findIndex((n) => n.id === currentNoteId);
  if (currentIndex < 0) return null;
  const prev = currentIndex > 0 ? sorted[currentIndex - 1] : null;
  const next =
    currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;

  if (!prev && !next) return null;

  const linkClass =
    "inline-flex items-center gap-2 rounded-lg border border-default bg-surface px-4 py-2 text-sm font-medium text-secondary transition-colors duration-100 hover:border-[#00A3A3]/35 hover:text-primary dark:hover:border-[#00E0E0]/30";
  const titleClass = "truncate max-w-[40ch]";

  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      {prev ? (
        <Link
          href={`/dashboard/notes/${prev.id}`}
          className={linkClass}
          title={prev.title}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="flex flex-col leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-wide text-secondary/70">
              Previous
            </span>
            <span className={titleClass}>{prev.title}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/dashboard/notes/${next.id}`}
          className={linkClass}
          title={next.title}
        >
          <span className="flex flex-col items-end leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-wide text-secondary/70">
              Next
            </span>
            <span className={titleClass}>{next.title}</span>
          </span>
          <ChevronLeft className="h-4 w-4 rotate-180" />
        </Link>
      ) : (
        <span />
      )}
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
  onBack,
  onDeleteClick,
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
  onBack?: () => void;
  onDeleteClick?: () => void;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b transition-all duration-150",
        isCompact
          ? "border-default shadow-sm bg-[#FFFFFF] dark:bg-[#1A1A1A]"
          : "border-transparent bg-[#FFFFFF] dark:bg-[#1A1A1A]",
      )}
    >
      <div className="mx-auto max-w-4xl px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className={iconButtonClass}
            aria-label="Go back"
            title="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1
            className={cn(
              "min-w-0 flex-1 truncate font-bold tracking-tight text-primary transition-all duration-150",
              isCompact ? "text-lg" : "text-2xl leading-tight",
            )}
            title={note.title}
          >
            {note.title}
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onToggleFavorite}
              disabled={isTogglingFavorite}
              className={cn(
                iconButtonClass,
                isFavorite
                  ? "border-amber-500/20 bg-amber-500/5 text-amber-500"
                  : "text-secondary",
              )}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              title={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Star
                className={cn("h-4 w-4", isFavorite && "fill-amber-500")}
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
              onClick={onDeleteClick}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200/60 bg-surface px-3 text-xs font-bold text-red-600 transition-colors duration-100 hover:bg-red-50/70 active:scale-[0.98] dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {!isCompact && (
          <div className="mt-3 flex flex-wrap items-center gap-2 pl-12">
            <TypeBadge type={note.type} />
            <UpdatedAt updatedAt={note.updatedAt} />
            <TopicChip
              topicId={topicId}
              topicTitle={topicTitle}
              fallback={qaTopic}
            />
            <TagList tags={note.tags} compact />
          </div>
        )}
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
    return (
      <EmptyPanel
        title="Content"
        message="This note does not have any content yet."
      />
    );
  }
  return (
    <SectionPanel title="Content" icon={FileText}>
      <div className=" bg-surface">
        <MarkdownRenderer
          content={note.content}
          resolvedTheme={resolvedTheme}
        />
        <div className="mt-4 text-right">
          <span className="text-[10px] font-bold uppercase tracking-wide text-secondary">
            Markdown
          </span>
        </div>
      </div>
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
  if (!dsa)
    return (
      <EmptyPanel title="DSA Details" message="No DSA details are available." />
    );
  const implementations = dsa.implementations || [];
  const safeActiveIndex = Math.min(
    activeImplIndex,
    Math.max(implementations.length - 1, 0),
  );
  const activeImplementation = implementations[safeActiveIndex];

  return (
    <div className="space-y-5">
      <MetadataStrip
        items={[
          { label: "Platform", value: dsa.platform },
          {
            label: "Difficulty",
            value: (
              <span
                className={cn(
                  "inline-flex rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  DIFFICULTY_STYLES[dsa.difficulty],
                )}
              >
                {dsa.difficulty}
              </span>
            ),
          },
          { label: "Pattern", value: dsa.pattern },
        ]}
      />
      {dsa.problemStatement ? (
        <SectionPanel title="Problem Statement" icon={FileText}>
          <div className="bg-surface">
            <MarkdownRenderer
              content={dsa.problemStatement}
              resolvedTheme={resolvedTheme}
            />
            <div className="mt-4 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wide text-secondary">
                Markdown
              </span>
            </div>
          </div>
        </SectionPanel>
      ) : (
        <EmptyPanel
          title="Problem Statement"
          message="No problem statement has been added."
        />
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
                    "-mb-px shrink-0 border-b-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition-colors duration-100",
                    safeActiveIndex === idx
                      ? "border-[#1A1D1E] text-primary dark:border-[#E4E6EB]"
                      : "border-transparent text-secondary hover:text-primary",
                  )}
                >
                  {impl.language || `Code ${idx + 1}`}
                </button>
              ))}
            </div>

            <div className="w-full max-w-none overflow-x-auto">
              <CodeBlock
                language={activeImplementation.language}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
              >
                {activeImplementation.code || "// No code"}
              </CodeBlock>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-default bg-surface-hover-subtle px-3 py-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-secondary">
                  Time Complexity
                </div>
                <div className="mt-1 font-mono text-sm font-semibold text-primary">
                  {activeImplementation.timeComplexity ||
                    dsa.timeComplexity ||
                    "-"}
                </div>
              </div>
              <div className="rounded-lg border border-default bg-surface-hover-subtle px-3 py-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-secondary">
                  Space Complexity
                </div>
                <div className="mt-1 font-mono text-sm font-semibold text-primary">
                  {activeImplementation.spaceComplexity ||
                    dsa.spaceComplexity ||
                    "-"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-default bg-[#F5F5F5]/40 px-4 py-10 text-center dark:bg-[#161616]/40">
            <p className="text-sm font-medium text-secondary">
              No implementations have been added.
            </p>
          </div>
        )}
      </SectionPanel>
      {dsa.notes && (
        <SectionPanel title="Notes" icon={BookOpen}>
          <div className="bg-surface">
            <MarkdownRenderer
              content={dsa.notes}
              resolvedTheme={resolvedTheme}
            />
            <div className="mt-4 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wide text-secondary">
                Markdown
              </span>
            </div>
          </div>
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
  if (!qa)
    return (
      <EmptyPanel title="Q&A Details" message="No Q&A details are available." />
    );
  const validImportantPoints = (qa.importantPoints || []).filter(
    (point) => point.trim().length > 0,
  );

  return (
    <div className="space-y-5">
      {qa.content ? (
        <SectionPanel title="Detailed Answer" icon={BookOpen}>
          <div className="bg-surface">
            <MarkdownRenderer
              content={qa.content}
              resolvedTheme={resolvedTheme}
            />
            <div className="mt-4 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wide text-secondary">
                Markdown
              </span>
            </div>
          </div>
        </SectionPanel>
      ) : (
        <EmptyPanel
          title="Detailed Answer"
          message="No detailed answer has been added."
        />
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
  topicNotes = [],
}: NoteDisplayClientProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [activeImplIndex, setActiveImplIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(note.isFavorite);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");
  const [sectionProgress, setSectionProgress] = useState<Map<string, number>>(new Map());
  const [overallProgress, setOverallProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLElement | Window>(null);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard/notes");
    }
  }, [router]);

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

    scrollContainerRef.current = scrollParent;

    // Cache heading positions to avoid recalculation
    let cachedHeadings: Array<{ id: string; top: number; level: number; end: number }> = [];
    let lastScrollTop = -1;

    const getScrollTop = () => {
      return scrollParent === window
        ? window.scrollY
        : (scrollParent as HTMLElement).scrollTop;
    };

    const getDimensions = () => {
      const isWindow = scrollParent === window;
      return {
        scrollTop: isWindow ? window.scrollY : (scrollParent as HTMLElement).scrollTop,
        scrollHeight: isWindow
          ? document.documentElement.scrollHeight
          : (scrollParent as HTMLElement).scrollHeight,
        clientHeight: isWindow
          ? window.innerHeight
          : (scrollParent as HTMLElement).clientHeight,
        containerTop: isWindow
          ? 0
          : (scrollParent as HTMLElement).getBoundingClientRect().top,
      };
    };

    const recalcHeadingPositions = () => {
      const { scrollTop, scrollHeight, containerTop } = getDimensions();
      const headingsElements = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const positions: Array<{ id: string; top: number; level: number; end: number }> = [];

      headingsElements.forEach((element) => {
        const id = element.getAttribute("id");
        if (!id) return;
        const level = parseInt(element.tagName.toLowerCase().charAt(1));
        const rect = element.getBoundingClientRect();
        const top = scrollTop + (rect.top - containerTop);
        positions.push({ id, top, level, end: 0 });
      });

      positions.sort((a, b) => a.top - b.top);

      // Calculate each heading's section end (next heading at same or higher level)
      for (let i = 0; i < positions.length; i++) {
        const current = positions[i];
        let end = scrollHeight; // default: end of content
        for (let j = i + 1; j < positions.length; j++) {
          if (positions[j].level <= current.level) {
            end = positions[j].top;
            break;
          }
        }
        current.end = end;
      }

      cachedHeadings = positions;
    };

    const updateScrollStates = () => {
      const { scrollTop, scrollHeight, clientHeight } = getDimensions();

      // Only recalc heading positions on significant scroll or first run
      if (lastScrollTop === -1 || Math.abs(scrollTop - lastScrollTop) > 50) {
        recalcHeadingPositions();
        lastScrollTop = scrollTop;
      }

      // Header compact state
      setIsHeaderCompact(scrollTop > 16);

      // Overall reading progress
      const totalScrollable = scrollHeight - clientHeight;
      const overallProg = totalScrollable > 0 ? Math.min(scrollTop / totalScrollable, 1) : 0;
      setOverallProgress(overallProg);

      if (cachedHeadings.length === 0) {
        setSectionProgress(new Map());
        setActiveHeadingId("note-title");
        return;
      }

      // Find active heading: the last heading whose top is at or above current scroll
      const scrollTrigger = scrollTop + clientHeight * 0.3; // trigger at 30% from top of viewport
      let activeIdx = -1;
      for (let i = cachedHeadings.length - 1; i >= 0; i--) {
        if (scrollTrigger >= cachedHeadings[i].top) {
          activeIdx = i;
          break;
        }
      }

      if (activeIdx < 0) {
        // Before all headings
        setActiveHeadingId("note-title");
        setSectionProgress(new Map());
        return;
      }

      const activeHeading = cachedHeadings[activeIdx];
      setActiveHeadingId(activeHeading.id);

      // Calculate progress only for the active heading's section
      const sectionStart = activeHeading.top;
      const sectionEnd = activeHeading.end;
      const sectionHeight = sectionEnd - sectionStart;

      const newSectionProgress = new Map<string, number>();

      if (sectionHeight > 0) {
        const scrolledInSection = scrollTop - sectionStart;
        const progress = Math.max(0, Math.min(1, scrolledInSection / sectionHeight));
        newSectionProgress.set(activeHeading.id, progress);
      }

      // Mark all headings before active as completed
      for (let i = 0; i < activeIdx; i++) {
        newSectionProgress.set(cachedHeadings[i].id, 1);
      }

      setSectionProgress(newSectionProgress);
    };

    updateScrollStates();
    scrollParent.addEventListener("scroll", updateScrollStates, { passive: true });

    // Also recalc on resize
    const resizeObserver = new ResizeObserver(() => {
      lastScrollTop = -1; // force recalc
      updateScrollStates();
    });
    resizeObserver.observe(document.body);

    return () => {
      scrollParent.removeEventListener("scroll", updateScrollStates);
      resizeObserver.disconnect();
    };
  }, []);

  const handleToggleFavorite = async () => {
    if (isTogglingFavorite) return;
    const previousFavorite = isFavorite;
    const newFavorite = !previousFavorite;
    setIsFavorite(newFavorite);
    setIsTogglingFavorite(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: newFavorite }),
      });
      if (!res.ok) {
        throw new Error("Failed to update favorite");
      }
    } catch (error) {
      setIsFavorite(previousFavorite);
      console.error("Failed to toggle favorite:", error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

const renderContent = () => {
    switch (note.type) {
      case "general":
        return <GeneralContent note={note} resolvedTheme={resolvedTheme} />;
      case "dsa":
        return (
          <DSAContent
            note={note}
            resolvedTheme={resolvedTheme}
            activeImplIndex={activeImplIndex}
            setActiveImplIndex={setActiveImplIndex}
          />
        );
      case "qa":
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

  const content = useMemo(() => {
    if (note.type === "general") return note.content || "";
    if (note.type === "qa") return note.qa?.content || "";
    if (note.type === "dsa") return [note.dsa?.problemStatement, note.dsa?.notes].filter(Boolean).join("\n\n");
    return "";
  }, [note]);

  const headings = useMemo(() => {
    const contentHeadings = extractHeadings(content);
    return [{ level: 1, text: note.title, id: "note-title" }, ...contentHeadings];
  }, [content, note.title]);

  return (
    <div ref={rootRef} className="w-full pt-4 pb-16 font-sans">
      {/* Overall reading progress bar at top */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-default/50">
        <div
          className="h-full bg-gradient-to-r from-[#00A3A3] to-[#00E0E0] transition-all duration-150 ease-out"
          style={{ width: `${overallProgress * 100}%` }}
        />
      </div>

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
        onBack={handleBack}
        onDeleteClick={() => setShowDeleteModal(true)}
      />

      <div className="mx-auto mt-6 max-w-7xl px-5">
        <h1 id="note-title" className="hidden">{note.title}</h1>
        <div className="flex gap-8">
          <main className="flex-1 max-w-4xl">
            <div className="space-y-5">{renderContent()}</div>
            {topicId && topicNotes.length > 1 && (
              <TopicNav currentNoteId={note.id} topicNotes={topicNotes} />
            )}
          </main>
          {headings.length > 0 && (
            <TableOfContents
              headings={headings}
              activeId={activeHeadingId}
              sectionProgress={sectionProgress}
              overallProgress={overallProgress}
            />
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-[#E6E8EB] bg-[#FFFFFF] p-6 shadow-xl dark:border-[#2D2D2D] dark:bg-[#1A1A1A]">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#687076] hover:text-[#1A1D1E] hover:bg-[#F4F7F6] transition-colors duration-100 dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB] dark:hover:bg-[#111111]"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/30">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mb-1 text-center text-lg font-bold text-[#1A1D1E] dark:text-[#E4E6EB]">
              Delete Note
            </h3>
            <p className="mb-6 text-center text-sm text-[#687076] dark:text-[#A0A0A0]">
              Are you sure you want to delete &ldquo;{note.title}&rdquo;? This
              action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 h-10 rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] text-sm font-bold text-[#1A1D1E] transition-colors duration-100 hover:bg-[#F4F7F6] disabled:opacity-50 dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#E4E6EB] dark:hover:bg-[#111111]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await onDelete();
                    setShowDeleteModal(false);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="flex-1 h-10 rounded-lg bg-red-600 text-sm font-bold text-white transition-colors duration-100 hover:bg-red-700 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
