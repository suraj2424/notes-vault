"use client";

import React from "react";
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
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDistanceToNow } from "date-fns";
import {
  type LucideIcon,
  BookOpen,
  ChevronLeft,
  ChevronRight,
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
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import { Note, NoteType } from "@/types";
import { NOTE_TYPE_META, DIFFICULTY_STYLES } from "@/lib/note-styles";
import { useToggleFavorite } from "@/hooks/use-toggle-favorite";

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

const iconButtonClass =
"inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-default bg-surface text-secondary transition-all duration-150 hover:bg-bg-muted hover:text-primary disabled:cursor-wait disabled:opacity-50";

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
    if (typeof child === "string" || typeof child === "number")
      return acc + child;
    if (typeof child === "object" && child !== null && "props" in child) {
      return acc + childrenToText((child as any).props.children);
    }
    return acc;
  }, "");
}

export function extractHeadings(
  content: string
): Array<{ level: number; text: string; id: string }> {
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

const HEADING_COMPONENTS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const createHeadingComponent = (tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") => {
  return function HeadingComponent({ children, ...props }: { children?: ReactNode } & React.HTMLAttributes<HTMLHeadingElement>) {
    return React.createElement(tag, { ...props, id: slugify(childrenToText(children)) }, children);
  };
};

export const MarkdownRenderer = memo(
  ({ content, resolvedTheme }: MarkdownRendererProps) => {
    const themeRef = useRef(resolvedTheme);
    // eslint-disable-next-line react-hooks/refs
    themeRef.current = resolvedTheme;

    const components = useMemo<Components>(() => {
      const headingComponents: Partial<Components> = {};
      HEADING_COMPONENTS.forEach((tag) => {
        headingComponents[tag] = createHeadingComponent(tag);
      });

      return {
        ...headingComponents,
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const language = match ? match[1] : "";
          const isInline = !match && !String(children).includes("\n");
          const theme = themeRef.current === "dark" ? "dark" : "light";

          if (isInline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
          return (
            <div className="not-prose my-5 w-full max-w-none overflow-x-auto rounded-lg">
              <CodeBlock
                language={language || "text"}
                theme={theme}
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
          const isOrdered = props.className?.includes("ordered") || false;

          if (isOrdered) {
            return (
              <li className="text-sm text-primary pl-1 marker:font-medium marker:text-neutral-500">
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
        a({ href, children }) {
          return (
            <a
              href={href}
              onClick={(e) => {
                if (href?.startsWith("#")) {
                  e.preventDefault();
                  const element = document.getElementById(href.slice(1));
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }
              }}
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
                loading="lazy"
                decoding="async"
                className="mx-auto h-auto max-h-[480px] max-w-full rounded-md object-contain"
                style={{ minHeight: "200px" }}
              />
            </span>
          );
        },
      };
    }, []);

    return (
      <div
        className={cn(
          "prose prose-neutral prose-sm dark:prose-invert max-w-4xl font-sans",
          "prose-headings:text-balance prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-primary",
          "prose-h1:mt-0 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base prose-h3:font-semibold",
          "prose-p:leading-7 prose-a:font-medium prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-2",
          "prose-pre:bg-transparent prose-pre:p-0 prose-pre:shadow-none",
          "prose-code:before:content-none prose-code:after:content-none prose-code:rounded prose-code:border prose-code:border-default prose-code:bg-bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[11px] prose-code:font-medium prose-code:text-primary dark:prose-code:text-primary",
          "prose-hr:border-default prose-img:m-0"
        )}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }
);

MarkdownRenderer.displayName = "MarkdownRenderer";

interface TocNode {
  heading: { level: number; text: string; id: string };
  children: TocNode[];
}

function buildTocTree(
  headings: Array<{ level: number; text: string; id: string }>
): TocNode[] {
  const root: TocNode[] = [];
  const stack: { node: TocNode; level: number }[] = [];

  headings.forEach((heading) => {
    const node: TocNode = { heading, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].node.children.push(node);
    }

    stack.push({ node, level: heading.level });
  });

  return root;
}

interface TocContentNodeProps {
  node: TocNode;
  activeId?: string;
  sectionProgress: Map<string, number>;
}

const TocContentNode = memo(
  function TocContentNode({
    node,
    activeId,
    sectionProgress,
  }: TocContentNodeProps) {
    const { id, text, level } = node.heading;
    const progress = sectionProgress.get(id) ?? 0;

    const indentClass =
      level <= 2 ? "pl-3" : level === 3 ? "pl-6" : "pl-9";

    const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", `#${id}`);
      }
    }, [id]);

    const isActive = activeId === id;
    const itemStyle = cn(
      "block text-xs py-1 transition-colors duration-150 truncate",
      indentClass,
      isActive
        ? "text-[#00A3A3] dark:text-[#00E0E0] font-medium"
        : progress === 1
          ? "text-primary/90"
          : "text-secondary hover:text-primary"
    );

    return (
      <li className="relative my-1">
        <a
          href={`#${id}`}
          onClick={handleClick}
          className={itemStyle}
          title={text}
        >
          {text}
        </a>

        {node.children.length > 0 && (
          <ul className="space-y-1">
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
  },
  (prev, next) => {
    if (prev.activeId !== next.activeId) return false;
    const prevProgress = prev.sectionProgress.get(prev.node.heading.id) ?? 0;
    const nextProgress = next.sectionProgress.get(next.node.heading.id) ?? 0;
    if (Math.abs(prevProgress - nextProgress) > 0.05) return false;
    return true;
  }
);

interface ScrollState {
  activeId: string;
  sectionProgress: Map<string, number>;
  overallProgress: number;
}

interface TableOfContentsProps {
  headings: Array<{ level: number; text: string; id: string }>;
  contentRef: React.RefObject<HTMLElement | null>;
}

function TableOfContentsWithScroll({ headings, contentRef }: TableOfContentsProps) {
  const [scrollState, setScrollState] = useState<ScrollState>({
    activeId: "note-title",
    sectionProgress: new Map(),
    overallProgress: 0,
  });
  const scrollContainerRef = useRef<HTMLElement | Window | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastScrollTopRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);
  const cachedHeadingsRef = useRef<Array<{ id: string; top: number; level: number; end: number }>>([]);
  const headingsRecalculatedRef = useRef(false);

  const tree = useMemo(() => buildTocTree(headings), [headings]);
  const percentage = useMemo(() => Math.round(scrollState.overallProgress * 100), [scrollState.overallProgress]);

  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    let scrollParent: HTMLElement | Window = window;
    let parent = contentEl.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      if (/(auto|scroll)/.test(`${style.overflowY}${style.overflow}`)) {
        scrollParent = parent;
        break;
      }
      parent = parent.parentElement;
    }

    scrollContainerRef.current = scrollParent;

    const getDimensions = (): { scrollTop: number; scrollHeight: number; clientHeight: number; containerTop: number } => {
      const isWindow = scrollParent === window;
      return {
        scrollTop: isWindow ? window.scrollY : (scrollParent as HTMLElement).scrollTop,
        scrollHeight: isWindow ? document.documentElement.scrollHeight : (scrollParent as HTMLElement).scrollHeight,
        clientHeight: isWindow ? window.innerHeight : (scrollParent as HTMLElement).clientHeight,
        containerTop: isWindow ? 0 : (scrollParent as HTMLElement).getBoundingClientRect().top,
      };
    };

    const recalcHeadingPositions = () => {
      if (headingsRecalculatedRef.current && cachedHeadingsRef.current.length > 0) {
        return;
      }
      
      const { scrollTop, containerTop } = getDimensions();
      const headingsElements = contentEl.querySelectorAll("h1, h2, h3, h4, h5, h6");
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

      for (let i = 0; i < positions.length; i++) {
        const current = positions[i];
        positions.sort((a, b) => a.top - b.top);
        let end = positions[i + 1]?.top ?? scrollTop + getDimensions().clientHeight;
        for (let j = i + 1; j < positions.length; j++) {
          if (positions[j].level <= current.level) {
            end = positions[j].top;
            break;
          }
        }
        current.end = end;
      }

      cachedHeadingsRef.current = positions;
      headingsRecalculatedRef.current = true;
    };

    const updateScrollStates = () => {
      const { scrollTop, scrollHeight, clientHeight } = getDimensions();

      if (scrollTop === lastScrollTopRef.current) return;
      lastScrollTopRef.current = scrollTop;

      const totalScrollable = scrollHeight - clientHeight;
      const overallProg = totalScrollable > 0 ? Math.min(scrollTop / totalScrollable, 1) : 0;

      if (cachedHeadingsRef.current.length === 0) {
        setScrollState((prev) => {
          if (prev.activeId !== "note-title" || prev.sectionProgress.size !== 0 || prev.overallProgress !== overallProg) {
            return { activeId: "note-title", sectionProgress: new Map(), overallProgress: overallProg };
          }
          return prev;
        });
        return;
      }

      const scrollTrigger = scrollTop + clientHeight * 0.3;
      let activeIdx = -1;
      for (let i = cachedHeadingsRef.current.length - 1; i >= 0; i--) {
        if (scrollTrigger >= cachedHeadingsRef.current[i].top) {
          activeIdx = i;
          break;
        }
      }

      const positions = cachedHeadingsRef.current;
      if (activeIdx < 0) {
        if (scrollState.activeId !== "note-title") {
          setScrollState((prev) => ({ ...prev, activeId: "note-title", sectionProgress: new Map() }));
        }
        return;
      }

      const activeHeading = positions[activeIdx];
      const sectionStart = activeHeading.top;
      const sectionEnd = activeHeading.end;
      const sectionHeight = sectionEnd - sectionStart;

      const newSectionProgress = new Map<string, number>();

      if (sectionHeight > 0) {
        const scrolledInSection = scrollTop - sectionStart;
        const progress = Math.max(0, Math.min(1, scrolledInSection / sectionHeight));
        newSectionProgress.set(activeHeading.id, progress);
      }

      for (let i = 0; i < activeIdx; i++) {
        newSectionProgress.set(cachedHeadingsRef.current[i].id, 1);
      }

      setScrollState((prev) => {
        const progressChanged = (() => {
          if (prev.sectionProgress.size !== newSectionProgress.size) return true;
          for (const [k, v] of newSectionProgress) {
            const oldV = prev.sectionProgress.get(k) ?? 0;
            if (Math.abs(oldV - v) > 0.05) return true;
          }
          return false;
        })();

        if (!progressChanged && prev.activeId === activeHeading.id && Math.abs(prev.overallProgress - overallProg) < 0.001) {
          return prev;
        }

        return {
          activeId: activeHeading.id,
          sectionProgress: newSectionProgress,
          overallProgress: overallProg,
        };
      });
    };

    const onScroll = () => {
      const now = Date.now();
      if (now - lastUpdateTimeRef.current < 50) {
        return;
      }
      lastUpdateTimeRef.current = now;

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          updateScrollStates();
          rafIdRef.current = null;
        });
      }
    };

    recalcHeadingPositions();
    updateScrollStates();

    scrollParent.addEventListener("scroll", onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      headingsRecalculatedRef.current = false;
      recalcHeadingPositions();
      updateScrollStates();
    });

    resizeObserver.observe(contentEl);

    return () => {
      scrollParent.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [contentRef, headings, scrollState.activeId]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", `#${id}`);
    }
  }, []);

  if (!headings.length) return null;

  return (
    <nav className="sticky top-22 w-56 shrink-0 self-start hidden lg:block max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent">
      <div className="rounded-lg border border-default bg-surface p-4">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-secondary mb-4">
          <List className="h-3.5 w-3.5" />
          On this page
        </div>

        <div className="mb-4 pb-4 border-b border-default">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-secondary">
              Read
            </span>
            <span className="text-[11px] font-bold text-[#00A3A3] dark:text-[#00E0E0]">
              {percentage}%
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 bg-default overflow-hidden">
            <div
              className="h-full rounded-full bg-[#00A3A3] dark:bg-[#00E0E0] transition-[width] duration-150 ease-out"
              style={{ width: `${scrollState.overallProgress * 100}%` }}
            />
          </div>
        </div>

        <ul className="space-y-11">
          {tree.map((node) => (
            <TocContentNode
              key={node.heading.id}
              node={node}
              activeId={scrollState.activeId}
              sectionProgress={scrollState.sectionProgress}
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
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
        meta.badge
      )}
    >
      <Icon className="h-3 w-3" />
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
    <div className="flex !flex-nowrap items-center gap-1 overflow-hidden">
      {visibleTags.map((tag) => (
        <Link
          key={tag}
          href={`/dashboard/notes?tag=${encodeURIComponent(tag)}`}
          className="shrink-0 rounded-full border border-default bg-surface px-1.5 py-0.5 text-[9px] font-bold text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary"
        >
          #{tag}
        </Link>
      ))}
      {compact && tags.length > visibleTags.length && (
        <Link
          href="/dashboard/tags"
          className="shrink-0 rounded-full border border-default bg-bg-muted px-1 py-0 text-[9px] font-bold text-secondary transition-colors duration-100 hover:text-primary"
        >
          +{tags.length - visibleTags.length}
        </Link>
      )}
    </div>
  );
}

function UpdatedAt({ updatedAt }: { updatedAt: string }) {
  const formatted = useMemo(
    () => formatDistanceToNow(new Date(updatedAt), { addSuffix: true }),
    [updatedAt]
  );
  return (
    <span className="inline-flex underline items-center gap-1 text-[9px] font-medium text-secondary whitespace-nowrap">
      <Clock className="h-3 w-3" />
      Updated {formatted}
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
    "inline-flex items-center gap-1 whitespace-nowrap rounded-full border-t border-cyan-400 dark:border-cyan-600 bg-cyan-200 dark:bg-cyan-800 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-secondary transition-colors duration-100 hover:text-primary";
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
      <div className="rounded-lg border border-dashed border-default bg-bg-muted/40 px-4 py-10 text-center">
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
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
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
              item.className
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
  const { prev, next } = useMemo(() => {
    const sorted = [...topicNotes]
      .filter((n) => n.sequence != null)
      .sort((a, b) => (a.sequence ?? 9999) - (b.sequence ?? 9999));
    
    if (sorted.length < 2) return { prev: null, next: null };
    
    const currentIndex = sorted.findIndex((n) => n.id === currentNoteId);
    if (currentIndex < 0) return { prev: null, next: null };
    
    return {
      prev: currentIndex > 0 ? sorted[currentIndex - 1] : null,
      next: currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null,
    };
  }, [topicNotes, currentNoteId]);

  if (!prev && !next) return null;

  const linkClass =
    "inline-flex items-center gap-2 rounded-lg border border-default bg-surface px-4 py-2.5 text-sm font-medium text-secondary transition-all duration-150 hover:border-[#00A3A3]/35 hover:text-primary hover:shadow-sm dark:hover:border-[#00E0E0]/30";
  const titleClass = "truncate max-w-[30ch] sm:max-w-[40ch]";

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {prev ? (
        <Link
          href={`/dashboard/notes/${prev.id}`}
          className={linkClass}
          title={prev.title}
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-wide text-secondary/70">
              Previous
            </span>
            <span className={titleClass}>{prev.title}</span>
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next ? (
        <Link
          href={`/dashboard/notes/${next.id}`}
          className={linkClass}
          title={next.title}
        >
          <span className="flex min-w-0 flex-col items-end leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-wide text-secondary/70">
              Next
            </span>
            <span className={titleClass}>{next.title}</span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
    </div>
  );
}

const StickyNoteHeader = memo(function StickyNoteHeader({
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
        "sticky top-0 z-30 w-full border-b will-change-transform border-border bg-surface/95",
        
      )}
    >
      <div className="mx-auto px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Tooltip placement="bottom" text="Go back">
            <button
              type="button"
              onClick={onBack}
              className={cn(
                iconButtonClass,
                "will-change-transform"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </Tooltip>
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <h1
              className={cn(
                "min-w-0 flex-1 truncate font-bold tracking-tight text-primary will-change-transform",
                isCompact ? "text-base sm:text-lg" : "text-xl leading-tight sm:text-2xl"
              )}
              title={note.title}
            >
              {note.title}
            </h1>
            {!isCompact && (
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 overflow-hidden">
                <UpdatedAt updatedAt={note.updatedAt} />
                <TypeBadge type={note.type} />
                <TopicChip
                  topicId={topicId}
                  topicTitle={topicTitle}
                  fallback={qaTopic}
                />
                <div className="flex !flex-nowrap items-center overflow-hidden">
                  <TagList tags={note.tags} compact />
                </div>
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Tooltip placement="bottom" text={isFavorite ? "Remove from favorites" : "Add to favorites"}>
              <button
                type="button"
                onClick={onToggleFavorite}
                disabled={isTogglingFavorite}
                className={cn(
                  iconButtonClass,
                  "will-change-transform",
                  isFavorite
                    ? "border-amber-500/20 bg-amber-500/5 text-amber-500"
                    : "text-secondary"
                )}
              >
                <Star
                  className={cn("h-4 w-4", isFavorite && "fill-amber-500")}
                />
              </button>
            </Tooltip>
            <Tooltip placement="bottom" text="Edit note">
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex h-7 items-center gap-1 rounded-full border border-default bg-surface p-1 text-[11px] font-bold text-secondary transition-all duration-150 hover:bg-bg-muted hover:text-primary active:scale-[0.98] sm:px-2.5 will-change-transform"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip placement="bottom" text="Delete note">
              <button
                type="button"
                onClick={onDeleteClick}
                className="inline-flex h-7 items-center gap-1 rounded-full border border-red-200/60 bg-surface p-1 text-[11px] font-bold text-red-600 transition-all duration-150 hover:bg-red-50/70 active:scale-[0.98] dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20 sm:px-2.5 will-change-transform"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
});

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
      <div className="bg-surface">
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

const DSAContent = memo(function DSAContent({
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
      <EmptyPanel
        title="DSA Details"
        message="No DSA details are available."
      />
    );
  const implementations = dsa.implementations || [];
  const safeActiveIndex = Math.min(
    activeImplIndex,
    Math.max(implementations.length - 1, 0)
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
                  DIFFICULTY_STYLES[dsa.difficulty]
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
            <div className="flex gap-1 overflow-x-auto border-b border-default scrollbar-none">
              {implementations.map((impl, idx) => (
                <button
                  key={`${impl.language}-${idx}`}
                  type="button"
                  onClick={() => setActiveImplIndex(idx)}
                  className={cn(
                    "-mb-px shrink-0 border-b-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition-colors duration-100",
                    safeActiveIndex === idx
                      ? "border-[#1A1D1E] text-primary dark:border-[#E4E6EB]"
                      : "border-transparent text-secondary hover:text-primary"
                  )}
                >
                  {impl.language || `Code ${idx + 1}`}
                </button>
              ))}
            </div>

            <div className="w-full max-w-none overflow-x-auto rounded-lg">
              <CodeBlock
                language={activeImplementation.language}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
              >
                {activeImplementation.code || "// No code"}
              </CodeBlock>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
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
          <div className="rounded-lg border border-dashed border-default bg-bg-muted/40 px-4 py-10 text-center">
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
});

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
      <EmptyPanel
        title="Q&A Details"
        message="No Q&A details are available."
      />
    );
  const validImportantPoints = (qa.importantPoints || []).filter(
    (point) => point.trim().length > 0
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
              <div
                key={`${point}-${index}`}
                className="flex items-start gap-3"
              >
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
  const {
    isFavorite,
    isToggling: isTogglingFavorite,
    toggleFavorite: handleToggleFavorite,
  } = useToggleFavorite(note.id, note.isFavorite);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (showDeleteModal && e.key === "Escape") {
        setShowDeleteModal(false);
      }
    };

    if (showDeleteModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [showDeleteModal]);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard/notes");
    }
  }, [router]);

  const handleDeleteConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }, [onDelete]);

  const handleDeleteClick = useCallback(() => setShowDeleteModal(true), []);

  const renderContent = useCallback(() => {
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
  }, [note, resolvedTheme, activeImplIndex, topicId, topicTitle]);

  const content = useMemo(() => {
    if (note.type === "general") return note.content || "";
    if (note.type === "qa") return note.qa?.content || "";
    if (note.type === "dsa")
      return [note.dsa?.problemStatement, note.dsa?.notes]
        .filter(Boolean)
        .join("\n\n");
    return "";
  }, [note]);

  const headings = useMemo(() => extractHeadings(content), [content]);

  return (
    <div ref={rootRef} className="w-full pb-16 font-sans">
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
        onDeleteClick={handleDeleteClick}
      />

      <div className="mx-auto mt-4 max-w-7xl px-4 sm:mt-6 sm:px-5">
        <h1 id="note-title" className="hidden">
          {note.title}
        </h1>
        <div className="flex flex-col gap-6 lg:flex-row justify-center lg:gap-8">
          <main className="min-w-0 flex-1 max-w-4xl">
            <div className="space-y-5">{renderContent()}</div>
            {topicId && topicNotes.length > 1 && (
              <TopicNav currentNoteId={note.id} topicNotes={topicNotes} />
            )}
          </main>
          {headings.length > 0 && (
            <TableOfContentsWithScroll
              headings={headings}
              contentRef={rootRef}
            />
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDeleteModal(false);
              }
            }}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-default bg-surface p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-secondary transition-colors duration-150 hover:bg-bg-muted hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/30">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mb-1 text-center text-lg font-bold text-primary">
              Delete Note
            </h3>
            <p className="mb-6 text-center text-sm text-secondary">
              Are you sure you want to delete &ldquo;{note.title}&rdquo;? This
              action cannot be undone.
            </p>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex h-10 flex-1 items-center justify-center rounded-lg border border-default bg-surface text-sm font-bold text-primary transition-colors duration-150 hover:bg-bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="flex h-10 flex-1 items-center justify-center rounded-lg bg-red-600 text-sm font-bold text-white transition-colors duration-150 hover:bg-red-700 disabled:opacity-50"
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
