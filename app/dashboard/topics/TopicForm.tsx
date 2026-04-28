"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronLeft, ImageIcon, Archive, Trash2 } from "lucide-react";
import { TOPIC_COLOR_PALETTE } from "@/lib/topic-constants";
import { Topic } from "@/types";
import { cn } from "@/lib/utils";

interface TopicFormProps {
  mode: "create" | "edit";
  topic?: Topic;
}

export function TopicForm({ mode, topic }: TopicFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(topic?.title || "");
  const [description, setDescription] = useState(topic?.description || "");
  const [coverImage, setCoverImage] = useState(topic?.coverImage || "");
  const [color, setColor] = useState(topic?.color || TOPIC_COLOR_PALETTE[0]);
  const [isArchived, setIsArchived] = useState(topic?.isArchived || false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const previewStyle = useMemo(
    () => ({
      backgroundColor: color,
      ...(coverImage
        ? {
            backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.08), rgba(10,10,10,0.45)), url(${coverImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : {}),
    }),
    [color, coverImage],
  );

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(mode === "create" ? "/api/topics" : `/api/topics/${topic?.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          coverImage,
          color,
          ...(mode === "edit" ? { isArchived } : {}),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to save topic");
      }

      const data = await response.json();
      router.push(mode === "create" ? `/dashboard/topics/${data.topic.id}` : `/dashboard/topics/${topic?.id}`);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save topic");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!topic) return;
    const confirmed = window.confirm("Delete this topic? Notes inside it will stay, but they will be unlinked.");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/topics/${topic.id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete topic");
      }
      router.push("/dashboard/topics");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete topic");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={mode === "create" ? "/dashboard/topics" : `/dashboard/topics/${topic?.id}`}
            className="group flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white transition-all hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <ChevronLeft className="h-4 w-4 text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif tracking-tight text-neutral-900 dark:text-neutral-100">
              {mode === "create" ? "New Topic" : "Edit Topic"}
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {mode === "create" ? "Create a home for related notes." : "Update details, archive state, or cover styling."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex h-10 items-center gap-2 rounded-xl bg-neutral-950 px-5 text-[12px] font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          <Check className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="System Design, Interview Prep, React Patterns..."
                  className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-[14px] font-medium text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-700 dark:focus:bg-neutral-950 dark:focus:ring-neutral-900/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What belongs in this topic?"
                  className="min-h-[160px] w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-[14px] text-neutral-700 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:placeholder:text-neutral-600 dark:focus:border-neutral-700 dark:focus:bg-neutral-950 dark:focus:ring-neutral-900/50"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <div className="mb-4 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-neutral-400" />
              <h2 className="text-sm font-bold text-neutral-950 dark:text-neutral-100">Cover styling</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                  Cover image URL
                </label>
                <input
                  value={coverImage}
                  onChange={(event) => setCoverImage(event.target.value)}
                  placeholder="https://..."
                  className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-[13px] font-medium text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-700 dark:focus:bg-neutral-950 dark:focus:ring-neutral-900/50"
                />
              </div>

              <div>
                <label className="mb-3 block text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                  Accent color
                </label>
                <div className="flex flex-wrap gap-3">
                  {TOPIC_COLOR_PALETTE.map((swatch) => (
                    <button
                      key={swatch}
                      type="button"
                      aria-label={`Choose ${swatch}`}
                      onClick={() => setColor(swatch)}
                      className={cn(
                        "h-10 w-10 rounded-xl border-2 transition-all",
                        color === swatch ? "scale-105 border-neutral-950 dark:border-white" : "border-transparent",
                      )}
                      style={{ backgroundColor: swatch }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {mode === "edit" && topic && (
            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-neutral-950 dark:text-neutral-100">Topic status</h2>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Archiving hides the topic from regular selectors and lists without deleting it.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsArchived((current) => !current)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] transition-all",
                    isArchived
                      ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
                      : "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300",
                  )}
                >
                  <Archive className="h-4 w-4" />
                  {isArchived ? "Archived" : "Active"}
                </button>
              </div>

              <div className="mt-6 border-t border-neutral-200 pt-6 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] text-red-700 transition-all hover:bg-red-100 disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete topic"}
                </button>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <p className="mb-3 text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
              Preview
            </p>
            <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <div className="h-40 w-full" style={previewStyle} />
              <div className="p-5">
                <h3 className="text-lg font-bold tracking-tight text-neutral-950 dark:text-neutral-50">
                  {title || "Untitled Topic"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                  {description || "A clean collection for notes that belong together."}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
