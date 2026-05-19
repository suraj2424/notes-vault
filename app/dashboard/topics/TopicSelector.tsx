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
    if (!open) return;

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
            if (current) setSearch("");
            return !current;
          })
        }
        className="flex h-9 w-full items-center justify-between rounded border border-[#E6E8EB] bg-[#F4F7F6] px-3 text-left text-xs font-medium text-[#1A1D1E] outline-none transition-colors duration-100 hover:bg-[#E6E8EB]/50 focus:border-[#00A3A3] focus:bg-[#FFFFFF] disabled:opacity-50 dark:border-[#2D2D2D] dark:bg-[#111111] dark:text-[#E4E6EB] dark:hover:bg-[#2D2D2D]/50 dark:focus:border-[#00E0E0] dark:focus:bg-[#1A1A1A]"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-[#687076]/60 dark:text-[#A0A0A0]/60" />
          <span className="truncate">{selectedTopic?.title || "No Topic"}</span>
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-[#687076]/60 transition-transform duration-100 dark:text-[#A0A0A0]/60", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded border border-[#E6E8EB] bg-[#FFFFFF] shadow-md dark:border-[#2D2D2D] dark:bg-[#1A1A1A]">
          <div className="border-b border-[#E6E8EB] p-2 dark:border-[#2D2D2D]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#687076]/50 dark:text-[#A0A0A0]/40" />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search topics..."
                className="h-8 w-full rounded border border-[#E6E8EB] bg-[#F4F7F6] pl-8 pr-2.5 text-xs text-[#1A1D1E] outline-none transition-colors duration-100 focus:border-[#00A3A3] focus:bg-[#FFFFFF] dark:border-[#2D2D2D] dark:bg-[#111111] dark:text-[#E4E6EB] dark:focus:border-[#00E0E0] dark:focus:bg-[#1A1A1A]"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setSearch("");
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded px-2.5 py-2 text-left transition-colors duration-100 text-xs",
                value === null
                  ? "bg-[#F4F7F6] font-bold text-[#00A3A3] dark:bg-[#111111] dark:text-[#00E0E0]"
                  : "text-[#687076] hover:bg-[#F4F7F6]/60 dark:text-[#A0A0A0] dark:hover:bg-[#111111]/50",
              )}
            >
              <span className="flex items-center gap-2.5">
                <FolderOpen className="h-3.5 w-3.5 text-[#687076]/60 dark:text-[#A0A0A0]/60" />
                <span>No Topic</span>
              </span>
              {value === null && <Check className="h-3.5 w-3.5 text-[#00A3A3] dark:text-[#00E0E0]" />}
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
                  "flex w-full items-center justify-between rounded px-2.5 py-2 text-left transition-colors duration-100 text-xs",
                  value === topic.id
                    ? "bg-[#F4F7F6] font-bold text-[#00A3A3] dark:bg-[#111111] dark:text-[#00E0E0]"
                    : "text-[#687076] hover:bg-[#F4F7F6]/60 dark:text-[#A0A0A0] dark:hover:bg-[#111111]/50",
                )}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="h-2 w-2 shrink-0 rounded-full border border-black/5 dark:border-white/5" style={{ backgroundColor: topic.color || "#687076" }} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{topic.title}</span>
                    {topic.description && (
                      <span className="block truncate text-[10px] text-[#687076]/70 dark:text-[#A0A0A0]/60 mt-0.5">
                        {topic.isArchived ? `${topic.description} • archived` : topic.description}
                      </span>
                    )}
                  </span>
                </span>
                {value === topic.id && <Check className="h-3.5 w-3.5 text-[#00A3A3] dark:text-[#00E0E0] shrink-0" />}
              </button>
            ))}

            {filteredTopics.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-[#687076]/70 dark:text-[#A0A0A0]/60">
                No topics match that search.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}