"use client";

import { useEffect, useMemo, useState } from "react";
import { FolderOpen, Search, Check, ChevronDown } from "lucide-react";
import { Topic } from "@/types";
import { cn } from "@/lib/utils";

interface TopicSelectorProps {
  value: string | null;
  onChange: (topicId: string | null) => void;
  disabled?: boolean;
}

export function TopicSelector({ value, onChange, disabled = false }: TopicSelectorProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTopics = async () => {
      try {
        const response = await fetch("/api/topics?pageSize=100&includeArchived=true", { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        setTopics(data.topics || []);
      } catch (error) {
        if (!(error instanceof Error && error.name === "AbortError")) {
          console.error("Error fetching topics:", error);
        }
      }
    };

    fetchTopics();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearch("");
        setOpen(false);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-topic-selector='true']")) {
        setSearch("");
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const selectedTopic = topics.find((topic) => topic.id === value);
  const filteredTopics = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const visibleTopics = topics.filter((topic) => !topic.isArchived || topic.id === value);
    if (!normalized) return visibleTopics;
    return visibleTopics.filter((topic) =>
      [topic.title, topic.description || ""].some((part) => part.toLowerCase().includes(normalized)),
    );
  }, [search, topics, value]);

  return (
    <div className="relative" data-topic-selector="true">
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          setOpen((current) => {
            if (current) {
              setSearch("");
            }
            return !current;
          })
        }
        className="flex h-11 w-full items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-left text-[13px] font-medium text-neutral-900 outline-none transition-all hover:bg-white focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-900 dark:focus:border-neutral-600 dark:focus:bg-neutral-900 dark:focus:ring-neutral-900/50"
      >
        <span className="flex min-w-0 items-center gap-3">
          <FolderOpen className="h-4 w-4 shrink-0 text-neutral-400" />
          <span className="truncate">{selectedTopic?.title || "No Topic"}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-neutral-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 p-3 dark:border-neutral-700">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search topics..."
                className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-[13px] text-neutral-900 outline-none transition-all focus:border-neutral-400 focus:bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-600 dark:focus:bg-neutral-900"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setSearch("");
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-all",
                value === null
                  ? "bg-neutral-50 text-neutral-950 dark:bg-neutral-900 dark:text-neutral-50"
                  : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/70",
              )}
            >
              <span className="flex items-center gap-3">
                <FolderOpen className="h-4 w-4 text-neutral-400" />
                <span className="font-medium">No Topic</span>
              </span>
              {value === null && <Check className="h-4 w-4" />}
            </button>

            {filteredTopics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => {
                  onChange(topic.id);
                  setSearch("");
                  setOpen(false);
                }}
                className={cn(
                  "mt-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-all",
                  value === topic.id
                    ? "bg-neutral-50 text-neutral-950 dark:bg-neutral-900 dark:text-neutral-50"
                    : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/70",
                )}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: topic.color || "#64748b" }} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{topic.title}</span>
                    {topic.description && (
                      <span className="block truncate text-xs text-neutral-400 dark:text-neutral-500">
                        {topic.isArchived ? `${topic.description} • archived` : topic.description}
                      </span>
                    )}
                  </span>
                </span>
                {value === topic.id && <Check className="h-4 w-4 shrink-0" />}
              </button>
            ))}

            {filteredTopics.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                No topics match that search.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
