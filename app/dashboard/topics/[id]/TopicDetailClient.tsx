"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Archive, BookOpen, ChevronLeft, Code2, FileText, FolderOpen, Plus, Unlink } from "lucide-react";
import { Note, Topic } from "@/types";
import { cn } from "@/lib/utils";

function notePreview(note: Note) {
  const content =
    note.type === "general"
      ? note.content
      : note.type === "qa"
        ? note.qa?.content
        : note.dsa?.problemStatement || note.dsa?.notes;

  return (content || `${note.type === "qa" ? "Q&A" : note.type.toUpperCase()} note`)
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
            : "border-default bg-bg-muted text-secondary"
      )}
    >
      {type === "qa" ? "Q&A" : type}
    </span>
  );
}

function NoteIcon({ type }: { type: Note["type"] }) {
  const className = cn(
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
    type === "dsa"
      ? "border-[#00A3A3]/15 bg-[#00A3A3]/5 text-[#00A3A3] dark:border-[#00E0E0]/15 dark:bg-[#00E0E0]/5 dark:text-[#00E0E0]"
      : type === "qa"
        ? "border-amber-500/15 bg-amber-500/5 text-amber-600 dark:text-amber-400"
        : "border-default bg-bg-muted text-secondary"
  );

  if (type === "dsa") return <div className={className}><Code2 className="h-4 w-4" /></div>;
  if (type === "qa") return <div className={className}><BookOpen className="h-4 w-4" /></div>;
  return <div className={className}><FileText className="h-4 w-4" /></div>;
}

export default function TopicDetailClient({
  topic,
  notes,
  onRemoveNote,
}: {
  topic: Topic;
  notes: Note[];
  onRemoveNote: (noteId: string) => void;
}) {
  return (
    <div className="w-full px-5 pb-16 font-sans">
      <header className="sticky top-0 z-30 -mx-5 border-b border-default px-5">
        <div className="flex flex-col gap-4 py-4">
          <div
            className="h-36 overflow-hidden rounded-lg border border-default sm:h-44"
            style={{
              backgroundColor: topic.color || "#2563eb",
              ...(topic.coverImage
                ? {
                    backgroundImage: `linear-gradient(180deg, rgba(17,24,39,0.08), rgba(17,24,39,0.58)), url(${topic.coverImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {}),
            }}
          />

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
                  {topic.description || "A focused topic collection for grouping notes that belong together."}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-wide text-secondary">
                  <span>{topic.noteCount} notes</span>
                  <span>/</span>
                  <span>Updated {formatDistanceToNow(new Date(topic.updatedAt), { addSuffix: true })}</span>
                </div>
              </div>
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
      </header>

      <main className="mt-5">
        {notes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {notes.map((note) => (
              <article
                key={note.id}
                className="group rounded-lg border border-default bg-surface p-4 transition-colors duration-100 hover:border-[#00A3A3]/35 dark:hover:border-[#00E0E0]/30"
              >
                <div className="flex items-start gap-3">
                  <NoteIcon type={note.type} />
                  <Link href={`/dashboard/notes/${note.id}`} className="min-w-0 flex-1">
                    <h2 className="truncate text-[15px] font-bold tracking-tight text-primary transition-colors duration-100 group-hover:text-secondary">
                      {note.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-xs font-medium leading-6 text-secondary">
                      {notePreview(note)}
                    </p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => onRemoveNote(note.id)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-default bg-surface text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary"
                    aria-label="Remove note from topic"
                    title="Remove note from topic"
                  >
                    <Unlink className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-default pt-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <NoteTypeBadge type={note.type} />
                    <span className="truncate text-[11px] font-medium text-secondary">
                      {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/notes/${note.id}`}
                    className="text-[11px] font-medium text-secondary transition-colors duration-100 hover:text-primary"
                  >
                    Open
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-default bg-surface/60 px-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-default bg-bg-muted text-secondary">
              <FolderOpen className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-primary">No notes in this topic yet</h2>
            <p className="mt-1 max-w-sm text-sm font-medium text-secondary">
              Start the collection by creating a note directly inside this topic.
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
