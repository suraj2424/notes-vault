"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Archive, ChevronRight, FolderOpen, Plus, Search } from "lucide-react";
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
    <div className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600">
      <Link href={`/dashboard/topics/${topic.id}`} className="block">
        <div
          className="h-32 w-full"
          style={{
            backgroundColor: topic.color || "#1d4ed8",
            ...(topic.coverImage
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(17,24,39,0.08), rgba(17,24,39,0.45)), url(${topic.coverImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {}),
          }}
        />
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/dashboard/topics/${topic.id}`}>
              <h3 className="truncate text-[16px] font-bold tracking-tight text-neutral-950 group-hover:text-neutral-700 dark:text-neutral-50 dark:group-hover:text-neutral-200">
                {topic.title}
              </h3>
            </Link>
            <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-neutral-500 dark:text-neutral-400">
              {topic.description || "A curated collection of notes grouped under one topic."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onToggleArchive(topic)}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
              topic.isArchived
                ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700",
            )}
          >
            <Archive className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
          <div className="flex items-center gap-2">
            <span>{topic.noteCount} notes</span>
            <span className="opacity-50">•</span>
            <span>{formatDistanceToNow(new Date(topic.updatedAt), { addSuffix: true })}</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
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
      if (nextSearch.trim()) {
        params.set("search", nextSearch.trim());
      }
      if (nextShowArchived) {
        params.set("includeArchived", "true");
      }
      router.push(`/dashboard/topics?${params.toString()}`);
    },
    [router],
  );

  const fetchTopics = useCallback(
    async (nextPage: number, nextSearch: string, nextShowArchived: boolean) => {
      const params = new URLSearchParams({
        page: String(nextPage),
        pageSize: "18",
      });
      if (nextSearch.trim()) {
        params.set("search", nextSearch.trim());
      }
      if (nextShowArchived) {
        params.set("includeArchived", "true");
      }

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
    [],
  );

  useEffect(() => {
    fetchTopics(page, search, showArchived);
  }, [fetchTopics, page, search, showArchived]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        setPage(1);
        updateUrl(1, search, showArchived);
      });
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [search, showArchived, updateUrl]);

  const handleToggleArchive = async (topic: Topic) => {
    const nextArchived = !topic.isArchived;

    setTopics((current) =>
      current.map((item) => (item.id === topic.id ? { ...item, isArchived: nextArchived } : item)),
    );

    try {
      const response = await fetch(`/api/topics/${topic.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: nextArchived }),
      });

      if (!response.ok) {
        throw new Error("Failed to update topic");
      }

      if (!showArchived && nextArchived) {
        fetchTopics(page, search, showArchived);
      }
    } catch (error) {
      console.error("Error updating topic:", error);
      fetchTopics(page, search, showArchived);
    }
  };

  return (
    <div className="mx-auto max-w-7xl font-sans">
      <header className="mb-8 flex flex-col gap-6 border-b border-neutral-200 pb-8 sm:flex-row sm:items-end sm:justify-between dark:border-neutral-700">
        <div>
          <h1 className="font-serif text-[32px] leading-none tracking-tight text-neutral-950 dark:text-neutral-50">
            Topics Library
          </h1>
          <p className="mt-3 text-[14px] font-medium text-neutral-500 dark:text-neutral-400">
            Group related notes into focused collections.
          </p>
        </div>

        <Link
          href="/dashboard/topics/new"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-neutral-900 px-5 text-[13px] font-black uppercase tracking-[0.14em] text-white transition-all hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          <Plus className="h-4 w-4" />
          New Topic
        </Link>
      </header>

      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between dark:border-neutral-700 dark:bg-neutral-900">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search topics..."
            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-100 pl-10 pr-4 text-[13px] font-medium text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-600 dark:focus:bg-neutral-900 dark:focus:ring-neutral-900/50"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            const next = !showArchived;
            setShowArchived(next);
            setPage(1);
          }}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-[12px] font-black uppercase tracking-[0.14em] transition-all",
            showArchived
              ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
              : "border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
          )}
        >
          <Archive className="h-4 w-4" />
          {showArchived ? "Including archived" : "Hide archived"}
        </button>
      </div>

      {topics.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} onToggleArchive={handleToggleArchive} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-100/50 py-24 text-center dark:border-neutral-700 dark:bg-neutral-800/30">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600">
            <FolderOpen className="h-8 w-8" />
          </div>
          <h2 className="font-serif text-xl text-neutral-950 dark:text-neutral-50">No topics yet</h2>
          <p className="mt-2 max-w-sm text-[14px] font-medium text-neutral-500 dark:text-neutral-400">
            Create a topic to organize clusters of notes under one shared theme.
          </p>
          <Link
            href="/dashboard/topics/new"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            <Plus className="h-4 w-4" />
            Create Topic
          </Link>
        </div>
      )}

      {totalPagesState > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
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
                "flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold transition-all",
                page === pageNumber
                  ? "border-neutral-950 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-950"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800",
              )}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
