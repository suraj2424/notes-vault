"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Archive, ChevronRight, FolderOpen, Plus, Search, X } from "lucide-react";
import { Topic } from "@/types";
import { cn } from "@/lib/utils";

interface TopicsLibraryClientProps {
  initialTopics: Topic[];
  totalPages: number;
  currentPage: number;
}

function TopicCard({
  topic,
  onToggleArchive,
}: {
  topic: Topic;
  onToggleArchive: (topic: Topic) => Promise<void>;
}) {
  return (
    <Link
      href={`/dashboard/topics/${topic.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-default bg-surface transition-colors duration-100 hover:border-[#00A3A3]/40 dark:hover:border-[#00E0E0]/30"
    >
      {/* <div
        className="h-32 w-full shrink-0 bg-[#F4F7F6] dark:bg-[#111111]"
      /> */}

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[16px] font-bold tracking-tight text-primary transition-colors duration-100 group-hover:text-secondary">
              {topic.title}
            </h3>
            <p className="mt-2 line-clamp-2 min-h-12 text-xs font-medium leading-6 text-secondary">
              {topic.description || "A curated collection of notes grouped under one topic."}
            </p>
          </div>

          <button
            type="button"
            onClick={async (event) => {
              event.preventDefault();
              event.stopPropagation();
              await onToggleArchive(topic);
            }}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-100",
              topic.isArchived
                ? "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400"
                : "border-default bg-surface text-secondary hover:bg-bg-muted hover:text-primary"
            )}
            aria-label={topic.isArchived ? "Unarchive topic" : "Archive topic"}
            title={topic.isArchived ? "Unarchive topic" : "Archive topic"}
          >
            <Archive className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-3 border-t border-default pt-3">
            <div className="flex min-w-0 items-center gap-2 text-[11px] font-medium text-secondary">
              <span className="shrink-0">{topic.noteCount} notes</span>
              <span>/</span>
              <span className="truncate">
                {formatDistanceToNow(new Date(topic.updatedAt), { addSuffix: true })}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-secondary transition-colors duration-100 group-hover:text-primary" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="h-[157px] rounded-lg border border-default bg-surface dark:bg-[#161616]"
        />
      ))}
    </div>
  );
}

export function TopicsLibraryClient({
  initialTopics,
  totalPages,
  currentPage,
}: TopicsLibraryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [showArchived, setShowArchived] = useState(searchParams.get("includeArchived") === "true");
  const [page, setPage] = useState(currentPage);
  const [totalPagesState, setTotalPagesState] = useState(totalPages);

  const updateUrl = useCallback(
    (nextPage: number, nextSearch: string, nextShowArchived: boolean) => {
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      if (nextSearch.trim()) params.set("search", nextSearch.trim());
      if (nextShowArchived) params.set("includeArchived", "true");

      const query = params.toString();
      router.push(query ? `/dashboard/topics?${query}` : "/dashboard/topics");
    },
    [router]
  );

  const fetchTopics = useCallback(
    async (nextPage: number, nextSearch: string, nextShowArchived: boolean) => {
      const params = new URLSearchParams({
        page: String(nextPage),
        pageSize: "18",
      });
      if (nextSearch.trim()) params.set("search", nextSearch.trim());
      if (nextShowArchived) params.set("includeArchived", "true");

      try {
        const response = await fetch(`/api/topics?${params.toString()}`);
        if (!response.ok) return;
        const data = await response.json();
        setTopics(data.topics || []);
        setTotalPagesState(data.pagination?.totalPages || 1);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTopics(page, search, showArchived);
  }, [fetchTopics, page, search, showArchived]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      startTransition(() => {
        setPage(1);
        updateUrl(1, search, showArchived);
      });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [search, showArchived, updateUrl]);

  const handleToggleArchive = async (topic: Topic) => {
    const nextArchived = !topic.isArchived;

    setTopics((current) =>
      current.map((item) => (item.id === topic.id ? { ...item, isArchived: nextArchived } : item))
    );

    try {
      const response = await fetch(`/api/topics/${topic.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: nextArchived }),
      });

      if (!response.ok) throw new Error("Failed to update topic");

      if (!showArchived && nextArchived) {
        fetchTopics(page, search, showArchived);
      }
    } catch (error) {
      console.error("Error updating topic:", error);
      fetchTopics(page, search, showArchived);
    }
  };

  const clearSearch = () => {
    setSearch("");
    setPage(1);
    updateUrl(1, "", showArchived);
  };

  return (
    <div className="mx-auto max-w-7xl px-8 py-6 font-sans">
      <header className="sticky top-0 z-30 -mx-5 border-b border-default px-5">
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-secondary">
                <FolderOpen className="h-3.5 w-3.5" />
                Topic Workspace
              </div>
              <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight text-primary sm:text-3xl">
                Topics Library
              </h1>
              <p className="mt-1 text-xs font-medium text-secondary">
                Group related notes into focused collections.
              </p>
            </div>

            <Link
              href="/dashboard/topics/new"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1A1D1E] px-4 text-xs font-bold text-white transition-colors duration-100 hover:bg-[#00A3A3] dark:bg-[#E4E6EB] dark:text-[#111111] dark:hover:bg-[#00E0E0]"
            >
              <Plus className="h-4 w-4" />
              New Topic
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-3 rounded-lg border border-default bg-surface p-3 lg:flex-row lg:items-center">
            <div className="group relative min-w-0 flex-1 lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary/60 transition-colors group-focus-within:text-primary" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search topics..."
                className="h-10 w-full rounded-lg border border-default bg-bg-muted pl-9 pr-9 text-sm font-medium text-primary outline-none transition-colors duration-100 placeholder:text-secondary/50 focus:border-[#00A3A3] focus:bg-surface dark:focus:border-[#00E0E0]"
              />
              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !showArchived;
                setShowArchived(next);
                setPage(1);
              }}
              className={cn(
                "flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 text-[10px] font-bold uppercase tracking-wide transition-colors duration-100",
                showArchived
                  ? "border-amber-500/25 bg-amber-500/5 text-amber-600 dark:text-amber-400"
                  : "border-default bg-surface text-secondary hover:bg-bg-muted hover:text-primary"
              )}
            >
              <Archive className="h-3.5 w-3.5" />
              {showArchived ? "Including archived" : "Hide archived"}
            </button>
          </div>
        </div>
      </header>

      <main className="mt-5">
        {isPending ? (
          <SkeletonGrid />
        ) : topics.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} onToggleArchive={handleToggleArchive} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-default bg-surface/60 px-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-default bg-bg-muted text-secondary">
              <FolderOpen className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-primary">No topics yet</h2>
            <p className="mt-1 max-w-sm text-sm font-medium text-secondary">
              Create a topic to organize clusters of notes under one shared theme.
            </p>
            <Link
              href="/dashboard/topics/new"
              className="mt-6 inline-flex h-9 items-center gap-2 rounded-lg bg-[#1A1D1E] px-4 text-xs font-bold text-white transition-colors duration-100 hover:bg-[#00A3A3] dark:bg-[#E4E6EB] dark:text-[#111111] dark:hover:bg-[#00E0E0]"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Topic
            </Link>
          </div>
        )}

        {totalPagesState > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: totalPagesState }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                disabled={isPending}
                onClick={() => {
                  setPage(pageNumber);
                  startTransition(() => updateUrl(pageNumber, search, showArchived));
                }}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition-colors duration-100 disabled:opacity-40",
                  page === pageNumber
                    ? "border-[#1A1D1E] bg-[#1A1D1E] text-white dark:border-[#E4E6EB] dark:bg-[#E4E6EB] dark:text-[#111111]"
                    : "border-default bg-surface text-secondary hover:bg-bg-muted hover:text-primary"
                )}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
