"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Archive, ChevronLeft, ChevronDown, ChevronRight, FolderOpen, Plus, Unlink, Loader2, FileText, BookOpen, Code2, Star, Tag } from "lucide-react";
import { Note, Topic, NoteType } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "@/components/markdown/CodeBlock";
import { useTheme } from "@/components/providers/ThemeProvider";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface NoteMarkdownProps {
  content: string;
  resolvedTheme: string;
}

const NoteMarkdown = ({ content, resolvedTheme }: NoteMarkdownProps) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm, remarkBreaks]}
    components={{
      hr: () => (
        <hr className="my-6 border-t border-neutral-200 dark:border-neutral-700/60" />
      ),
      h1: ({ children }) => (
        <h1 className="mb-4 mt-2 text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="mb-3 mt-6 text-lg font-bold tracking-tight text-neutral-800 dark:text-neutral-200">
          {children}
        </h2>
      ),
      p: ({ children }) => (
        <p className="mb-4 leading-6 text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
          {children}
        </p>
      ),
      ul: ({ children }) => (
        <ul className="mb-4 ml-4 list-disc space-y-2 text-neutral-600 dark:text-neutral-400">
          {children}
        </ul>
      ),
      li: ({ children }) => <li className="pl-1">{children}</li>,
      strong: ({ children }) => (
        <strong className="font-semibold text-neutral-950 dark:text-neutral-100">
          {children}
        </strong>
      ),
      code: ({ className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || "");
        const codeString = String(children).replace(/\n$/, "");

        if (!match && !codeString.includes("\n")) {
          return (
            <code className="rounded-md bg-neutral-50 px-1.5 py-0.5 font-mono text-[12px] font-medium text-indigo-600 dark:bg-neutral-800/50 dark:text-indigo-400 break-words border border-neutral-200/50 dark:border-neutral-700/50">
              {children}
            </code>
          );
        }

        return (
          <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700/70 shadow-sm bg-neutral-50 dark:bg-neutral-900">
            <CodeBlock
              language={match?.[1] || "text"}
              theme={resolvedTheme === "light" ? "light" : "dark"}
            >
              {codeString}
            </CodeBlock>
          </div>
        );
      },
      table: ({ children }) => (
        <div className="my-6 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700/80 shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            {children}
          </table>
        </div>
      ),
      th: ({ children }) => (
        <th className="border-b border-neutral-200 p-3 font-semibold text-neutral-900 dark:border-neutral-700 dark:text-neutral-100 bg-neutral-50/50 dark:bg-neutral-900/50">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="border-b border-neutral-100/50 p-3 text-neutral-600 dark:border-neutral-700/50 dark:text-neutral-400">
          {children}
        </td>
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);

function NoteAccordionItem({
  note,
  isExpanded,
  onToggleExpand,
  onRemoveFromTopic,
  isLoading,
  error,
}: {
  note: Note;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRemoveFromTopic: (noteId: string) => void;
  isLoading: boolean;
  error: string | null;
}) {
  const { resolvedTheme } = useTheme();

  const getNoteIcon = (type: NoteType) => {
    switch (type) {
      case 'dsa':
        return <Code2 className="h-3.5 w-3.5" />;
      case 'qa':
        return <BookOpen className="h-3.5 w-3.5" />;
      default:
        return <FileText className="h-3.5 w-3.5" />;
    }
  };

  const getNoteContent = (note: Note) => {
    if (note.type === "general") return note.content || "General note";
    if (note.type === "qa") return note.qa?.content || "Q&A note";
    if (note.type === "dsa") return note.dsa?.problemStatement || "DSA note";
    return "";
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          {getNoteIcon(note.type)}
        </div>

        <div className="flex min-w-0 flex-1">
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex min-w-0 flex-1 items-start gap-3 text-left"
          >
            <div className="mt-1 shrink-0">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-neutral-400 transition-transform" />
              ) : (
                <ChevronRight className="h-4 w-4 text-neutral-400 transition-transform" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[15px] font-bold tracking-tight text-neutral-950 dark:text-neutral-50">
                {note.title}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em]",
                    note.type === "dsa"
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                      : note.type === "qa"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
                  )}
                >
                  {note.type}
                </span>
                {note.isFavorite && (
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                )}
                {note.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-2.5 w-2.5 text-neutral-400" />
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      {note.tags.slice(0, 2).join(', ')}
                      {note.tags.length > 2 && ` +${note.tags.length - 2}`}
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/dashboard/notes/${note.id}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-50 text-neutral-500 hover:bg-neutral-100 transition-all dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            title="View note"
          >
            <FolderOpen className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => onRemoveFromTopic(note.id)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-all dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
            title="Remove from topic"
          >
            <Unlink className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
              <span className="ml-2 text-[13px] text-neutral-500 dark:text-neutral-400">Loading note details...</span>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-800/50 dark:bg-red-900/20">
              <p className="text-[13px] font-medium text-red-700 dark:text-red-300">{error}</p>
              <button
                type="button"
                onClick={onToggleExpand}
                className="mt-2 text-[12px] font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-[13px] leading-6 text-neutral-700 dark:text-neutral-300">
                <NoteMarkdown content={getNoteContent(note)} resolvedTheme={resolvedTheme} />
              </div>
              <Link
                href={`/dashboard/notes/${note.id}`}
                className="inline-flex items-center gap-2 text-[12px] font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                View full note <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [noteDetails, setNoteDetails] = useState<Record<string, Note>>({});
  const [isLoadingNoteDetails, setIsLoadingNoteDetails] = useState<Record<string, boolean>>({});
  const [noteErrors, setNoteErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user || !id) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchTopic = async () => {
      try {
        const [topicResponse, notesResponse] = await Promise.all([
          fetch(`/api/topics/${id}`, { signal }),
          fetch(`/api/topics/${id}/notes?pageSize=50`, { signal }),
        ]);

        if (!topicResponse.ok) {
          router.push("/dashboard/topics");
          return;
        }

        const topicData = await topicResponse.json();
        const notesData = notesResponse.ok ? await notesResponse.json() : { notes: [] };

        setTopic(topicData.topic);
        setNotes(notesData.notes || []);
      } catch (error) {
        if (!(error instanceof Error && error.name === "AbortError")) {
          router.push("/dashboard/topics");
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchTopic();

    return () => controller.abort();
  }, [id, router, user]);

  const fetchNoteDetails = useCallback(
    async (noteId: string, retryCount = 0) => {
      setIsLoadingNoteDetails((prev) => ({ ...prev, [noteId]: true }));
      setNoteErrors((prev) => ({ ...prev, [noteId]: null }));

      try {
        const response = await fetch(`/api/notes/${noteId}?fields=type,title,isFavorite,tags,createdAt,updatedAt,content,dsa,qa`);
        if (!response.ok) {
          throw new Error(`Failed to fetch note details: ${response.status}`);
        }
        const data = await response.json();
        setNoteDetails((prev) => ({ ...prev, [noteId]: data.note }));
      } catch (error) {
        console.error(`Error fetching note details for ${noteId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load note details";
        setNoteErrors((prev) => ({ ...prev, [noteId]: errorMessage }));

        // Retry logic for resilience
        if (retryCount < 2) {
          setTimeout(() => {
            fetchNoteDetails(noteId, retryCount + 1);
          }, 1000 * (retryCount + 1));
        }
      } finally {
        setIsLoadingNoteDetails((prev) => ({ ...prev, [noteId]: false }));
      }
    },
    [],
  );

  const handleToggleExpand = (noteId: string) => {
    if (expandedNoteId === noteId) {
      setExpandedNoteId(null);
    } else {
      setExpandedNoteId(noteId);
      if (!noteDetails[noteId] && !isLoadingNoteDetails[noteId]) {
        fetchNoteDetails(noteId);
      }
    }
  };

  const removeFromTopic = async (noteId: string) => {
    setNotes((current) => current.filter((note) => note.id !== noteId));
    setExpandedNoteId((current) => (current === noteId ? null : current));
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: null }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove note from topic");
      }

      setTopic((current) => (current ? { ...current, noteCount: Math.max(0, current.noteCount - 1) } : current));
    } catch (error) {
      console.error("Error removing note from topic:", error);
      const notesResponse = await fetch(`/api/topics/${id}/notes?pageSize=50`);
      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        setNotes(notesData.notes || []);
      }
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100" />
      </div>
    );
  }

  if (!topic) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl font-sans">
      <div className="mb-8 overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <div
          className="h-48 w-full"
          style={{
            backgroundColor: topic.color || "#2563eb",
            ...(topic.coverImage
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(17,24,39,0.08), rgba(17,24,39,0.55)), url(${topic.coverImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {}),
          }}
        />

        <div className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <Link
                href="/dashboard/topics"
                className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif text-[34px] leading-none tracking-tight text-neutral-950 dark:text-neutral-50">
                    {topic.title}
                  </h1>
                  {topic.isArchived && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                      <Archive className="h-3.5 w-3.5" />
                      Archived
                    </span>
                  )}
                </div>
                <p className="mt-3 max-w-3xl text-[15px] leading-7 text-neutral-500 dark:text-neutral-400">
                  {topic.description || "A focused topic collection for grouping notes that belong together."}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
                  <span>{topic.noteCount} notes</span>
                  <span>•</span>
                  <span>Updated {formatDistanceToNow(new Date(topic.updatedAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/dashboard/notes/new?topicId=${topic.id}`}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-neutral-900 px-5 text-[12px] font-black uppercase tracking-[0.14em] text-white transition-all hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                <Plus className="h-4 w-4" />
                New Note
              </Link>
              <Link
                href={`/dashboard/topics/${topic.id}/edit`}
                className="inline-flex h-11 items-center rounded-xl border border-neutral-200 px-5 text-[12px] font-black uppercase tracking-[0.14em] text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                Edit Topic
              </Link>
            </div>
          </div>
        </div>
      </div>

      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteAccordionItem
              key={note.id}
              note={noteDetails[note.id] || note}
              isExpanded={expandedNoteId === note.id}
              onToggleExpand={() => handleToggleExpand(note.id)}
              onRemoveFromTopic={removeFromTopic}
              isLoading={isLoadingNoteDetails[note.id] || false}
              error={noteErrors[note.id] || null}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 py-24 text-center dark:border-neutral-700 dark:bg-neutral-900/30">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-50 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600">
            <FolderOpen className="h-8 w-8" />
          </div>
          <h2 className="font-serif text-xl text-neutral-950 dark:text-neutral-50">No notes in this topic yet</h2>
          <p className="mt-2 max-w-sm text-[14px] font-medium text-neutral-500 dark:text-neutral-400">
            Start the collection by creating a note directly inside this topic.
          </p>
          <Link
            href={`/dashboard/notes/new?topicId=${topic.id}`}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            <Plus className="h-4 w-4" />
            Create First Note
          </Link>
        </div>
      )}
    </div>
  );
}
