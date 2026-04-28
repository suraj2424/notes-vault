"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Archive, ChevronLeft, FolderOpen, Plus, Unlink } from "lucide-react";
import { Note, Topic } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

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

  const removeFromTopic = async (noteId: string) => {
    setNotes((current) => current.filter((note) => note.id !== noteId));
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-800 dark:border-t-neutral-100" />
      </div>
    );
  }

  if (!topic) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl font-sans">
      <div className="mb-8 overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
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
                className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-all hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
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
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-neutral-950 px-5 text-[12px] font-black uppercase tracking-[0.14em] text-white transition-all hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                <Plus className="h-4 w-4" />
                New Note
              </Link>
              <Link
                href={`/dashboard/topics/${topic.id}/edit`}
                className="inline-flex h-11 items-center rounded-xl border border-neutral-200 px-5 text-[12px] font-black uppercase tracking-[0.14em] text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                Edit Topic
              </Link>
            </div>
          </div>
        </div>
      </div>

      {notes.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link href={`/dashboard/notes/${note.id}`}>
                    <h2 className="truncate text-[16px] font-bold tracking-tight text-neutral-950 hover:text-neutral-700 dark:text-neutral-50 dark:hover:text-neutral-200">
                      {note.title}
                    </h2>
                  </Link>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    {note.type === "general"
                      ? note.content || "General note"
                      : note.type === "qa"
                        ? note.qa?.content || "Q&A note"
                        : note.dsa?.problemStatement || "DSA note"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromTopic(note.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition-all hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                >
                  <Unlink className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400 dark:border-neutral-900 dark:text-neutral-500">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]",
                      note.type === "dsa"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                        : note.type === "qa"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
                    )}
                  >
                    {note.type}
                  </span>
                  <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                </div>
                <Link href={`/dashboard/notes/${note.id}`} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200">
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 py-24 text-center dark:border-neutral-800 dark:bg-neutral-950/30">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-600">
            <FolderOpen className="h-8 w-8" />
          </div>
          <h2 className="font-serif text-xl text-neutral-950 dark:text-neutral-50">No notes in this topic yet</h2>
          <p className="mt-2 max-w-sm text-[14px] font-medium text-neutral-500 dark:text-neutral-400">
            Start the collection by creating a note directly inside this topic.
          </p>
          <Link
            href={`/dashboard/notes/new?topicId=${topic.id}`}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-6 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            <Plus className="h-4 w-4" />
            Create First Note
          </Link>
        </div>
      )}
    </div>
  );
}
