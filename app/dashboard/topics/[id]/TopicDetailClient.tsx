"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Archive,
  BookOpen,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Code2,
  FileText,
  FolderOpen,
  Plus,
  Search,
  Unlink,
  X,
} from "lucide-react";
import { Note, Topic } from "@/types";
import { cn } from "@/lib/utils";

function notePreview(note: Note) {
  const content =
    note.type === "general"
      ? note.content
      : note.type === "qa"
        ? note.qa?.content
        : note.dsa?.problemStatement || note.dsa?.notes;

  return (
    content || `${note.type === "qa" ? "Q&A" : note.type.toUpperCase()} note`
  )
    .replace(/[#*_`>[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function NoteTypeBadge({ type }: { type: Note["type"] }) {
  return (
    <span
      className={cn(
        "inline-flex rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        type === "dsa"
          ? "border-[#00A3A3]/20 bg-[#00A3A3]/5 text-[#00A3A3] dark:border-[#00E0E0]/20 dark:bg-[#00E0E0]/5 dark:text-[#00E0E0]"
          : type === "qa"
            ? "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            : "border-default bg-bg-muted text-secondary",
      )}
    >
      {type === "qa" ? "Q&A" : type}
    </span>
  );
}

function Tooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!visible || !triggerRef.current || !tipRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tipRect = tipRef.current.getBoundingClientRect();
    setOverflowing(triggerRect.right + tipRect.width > window.innerWidth);
  }, [visible, text]);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      ref={triggerRef}
    >
      {children}
      {visible && (
        <div
          ref={tipRef}
          className={`pointer-events-none absolute bottom-full mb-2 z-[100] whitespace-nowrap rounded-md px-3 py-1.5 bg-[#1A1D1E] text-[#FFFFFF] text-xs font-medium shadow-md dark:bg-[#E4E6EB] dark:text-[#111111] border border-[#E6E8EB]/10 dark:border-[#2D2D2D]/10 ${
            overflowing ? "right-0" : "left-1/2 -translate-x-1/2"
          }`}
        >
          <span
            className="absolute h-1.5 w-1.5 rotate-45 bg-[#1A1D1E] dark:bg-[#E4E6EB]"
            style={
              overflowing
                ? { right: 12, bottom: -3 }
                : { left: "50%", bottom: -3, marginLeft: -3 }
            }
          />
          {text}
        </div>
      )}
    </div>
  );
}

function NoteIcon({ type }: { type: Note["type"] }) {
  const className = cn(
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
    type === "dsa"
      ? "border-[#00A3A3]/15 bg-[#00A3A3]/5 text-[#00A3A3] dark:border-[#00E0E0]/15 dark:bg-[#00E0E0]/5 dark:text-[#00E0E0]"
      : type === "qa"
        ? "border-amber-500/15 bg-amber-500/5 text-amber-600 dark:text-amber-400"
        : "border-default bg-bg-muted text-secondary",
  );

  if (type === "dsa")
    return (
      <div className={className}>
        <Code2 className="h-4 w-4" />
      </div>
    );
  if (type === "qa")
    return (
      <div className={className}>
        <BookOpen className="h-4 w-4" />
      </div>
    );
  return (
    <div className={className}>
      <FileText className="h-4 w-4" />
    </div>
  );
}

export default function TopicDetailClient({
  topic,
  notes: serverNotes,
  onRemoveNote,
  onReorder,
}: {
  topic: Topic;
  notes: Note[];
  onRemoveNote: (noteId: string) => void;
  onReorder?: (noteId: string, direction: "up" | "down") => void;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(serverNotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [isReordering, setIsReordering] = useState<string | null>(null);

  const reorderingRef = useRef<string | null>(null);
  const notesRef = useRef<Note[]>(notes);
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    if (!reorderingRef.current) {
      setNotes(serverNotes);
    }
  }, [serverNotes]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        notePreview(note).toLowerCase().includes(query),
    );
  }, [notes, searchQuery]);

  const sorted = useMemo(() => {
    return [...filteredNotes].sort(
      (a, b) => (a.sequence ?? 9999) - (b.sequence ?? 9999),
    );
  }, [filteredNotes]);

  const handleMove = useCallback(
    async (noteId: string, direction: "up" | "down") => {
      if (!onReorder) return;
      if (reorderingRef.current) return;

      const currentNotes = notesRef.current;
      const sortedNow = [...currentNotes].sort(
        (a, b) => (a.sequence ?? 9999) - (b.sequence ?? 9999),
      );
      const currentIndex = sortedNow.findIndex((n) => n.id === noteId);
      if (currentIndex < 0) return;
      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= sortedNow.length) return;

      const curr = sortedNow[currentIndex];
      const next = sortedNow[targetIndex];
      const currSeq = curr.sequence ?? currentIndex;
      const nextSeq = next.sequence ?? targetIndex;
      const swap = {
        currId: curr.id,
        nextId: next.id,
        currSeq,
        nextSeq,
      };

      reorderingRef.current = noteId;
      setIsReordering(noteId);
      setNotes((prev) =>
        prev.map((n) =>
          n.id === swap.currId
            ? { ...n, sequence: swap.nextSeq }
            : n.id === swap.nextId
              ? { ...n, sequence: swap.currSeq }
              : n,
        ),
      );

      try {
        await onReorder(noteId, direction);
        router.refresh();
      } catch {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === swap.currId
              ? { ...n, sequence: swap.currSeq }
              : n.id === swap.nextId
                ? { ...n, sequence: swap.nextSeq }
                : n,
          ),
        );
      } finally {
        reorderingRef.current = null;
        setIsReordering(null);
      }
    },
    [onReorder, router],
  );

  return (
    <div className="mx-auto max-w-7xl px-5 p-8 font-sans">
      <header className="sticky top-0 z-30 -mx-5 border-b border-default bg-[#FFFFFF] dark:bg-[#1A1A1A] px-5 pb-2">
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="flex min-w-0 items-start gap-3">
              <Link
                href="/dashboard/topics"
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-default bg-surface text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary"
                aria-label="Back to topics"
                title="Back to topics"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-bold leading-tight tracking-tight text-primary sm:text-3xl">
                    {topic.title}
                  </h1>
                  {topic.isArchived && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                      <Archive className="h-3.5 w-3.5" />
                      Archived
                    </span>
                  )}
                </div>
                <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-secondary">
                  {topic.description ||
                    "A focused topic collection for grouping notes that belong together."}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-wide text-secondary">
                  <span>{topic.noteCount} notes</span>
                  <span>/</span>
                  <span>
                    Updated{" "}
                    {formatDistanceToNow(new Date(topic.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="group relative min-w-0 flex-1 sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary/60 transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-default bg-surface pl-9 pr-9 text-sm font-medium text-primary outline-none transition-colors duration-100 placeholder:text-secondary/50 focus:bg-[#FFFFFF] dark:focus:bg-[#1A1A1A]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary"
                aria-label="Clear search"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/dashboard/notes/new?topicId=${topic.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1A1D1E] px-4 text-xs font-bold text-white transition-colors duration-100 hover:bg-[#00A3A3] dark:bg-[#E4E6EB] dark:text-[#111111] dark:hover:bg-[#00E0E0]"
            >
              <Plus className="h-4 w-4" />
              New Note
            </Link>
            <Link
              href={`/dashboard/topics/${topic.id}/edit`}
              className="inline-flex h-10 items-center rounded-lg border border-default bg-surface px-4 text-xs font-bold text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary"
            >
              Edit Topic
            </Link>
          </div>
        </div>
      </div>
        </div>
      </header>

      <main className="mt-5">
        {sorted.length > 0 ? (
          <div className="space-y-3 ">
            {sorted.map((note, index) => (
              <div key={note.id} className="relative flex items-center gap-4">
                {(index > 0 || sorted.length > 1) && (
                  <div className="absolute left-5 top-9 h-full w-px bg-border -z-10" />
                )}
                <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-default bg-surface text-xs font-bold text-secondary">
                  {note.sequence ?? index + 1}
                </div>
                <article className="group flex-1 rounded-lg border border-default bg-surface p-4 transition-colors duration-100 hover:border-[#00A3A3]/35 dark:hover:border-[#00E0E0]/30">
                  <div className="flex items-start gap-3">
                    <Link
                      href={`/dashboard/notes/${note.id}`}
                      className="flex flex-1 items-start gap-3"
                    >
                      <NoteIcon type={note.type} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate text-base font-bold tracking-tight text-primary transition-colors duration-100 hover:text-secondary">
                            {note.title}
                          </h2>
                        </div>
                      </div>
                    </Link>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Tooltip text="Move up">
                        <button
                          type="button"
                          disabled={index === 0 || isReordering === note.id}
                          onClick={() => handleMove(note.id, "up")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-default bg-surface text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary disabled:opacity-40 disabled:hover:bg-surface"
                          aria-label="Move up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip>
                      <Tooltip text="Move down">
                        <button
                          type="button"
                          disabled={
                            index === sorted.length - 1 ||
                            isReordering === note.id
                          }
                          onClick={() => handleMove(note.id, "down")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-default bg-surface text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary disabled:opacity-40 disabled:hover:bg-surface"
                          aria-label="Move down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip>
                      <Tooltip text="Open note">
                        <Link
                          href={`/dashboard/notes/${note.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-default bg-surface text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary"
                          aria-label="Open note"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Link>
                      </Tooltip>
                      <Tooltip text="Remove note from topic">
                        <button
                          type="button"
                          onClick={() => onRemoveNote(note.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-default bg-surface text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary"
                          aria-label="Remove note from topic"
                          disabled={false}
                        >
                          <Unlink className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-default pt-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <NoteTypeBadge type={note.type} />
                      <span className="truncate text-[11px] font-medium text-secondary">
                        {formatDistanceToNow(new Date(note.updatedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-default bg-surface/60 px-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-default bg-bg-muted text-secondary">
              <FolderOpen className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-primary">
              No notes in this topic yet
            </h2>
            <p className="mt-1 max-w-sm text-sm font-medium text-secondary">
            {searchQuery
              ? "No notes match your search. Try a different term."
              : "Start the collection by creating a note directly inside this topic."}
            </p>
            <Link
              href={`/dashboard/notes/new?topicId=${topic.id}`}
              className="mt-6 inline-flex h-9 items-center gap-2 rounded-lg bg-[#1A1D1E] px-4 text-xs font-bold text-white transition-colors duration-100 hover:bg-[#00A3A3] dark:bg-[#E4E6EB] dark:text-[#111111] dark:hover:bg-[#00E0E0]"
            >
              <Plus className="h-3.5 w-3.5" />
              Create First Note
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
