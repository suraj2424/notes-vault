"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronLeft, Archive, Trash2 } from "lucide-react";
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
  const [isArchived, setIsArchived] = useState(topic?.isArchived || false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        mode === "create" ? "/api/topics" : `/api/topics/${topic?.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            ...(mode === "edit" ? { isArchived } : {}),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to save topic");
      }

      const data = await response.json();
      router.push(
        mode === "create"
          ? `/dashboard/topics/${data.topic.id}`
          : `/dashboard/topics/${topic?.id}`
      );
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save topic");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!topic) return;
    const confirmed = window.confirm(
      "Delete this topic? Notes inside it will stay, but they will be unlinked."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/topics/${topic.id}`, {
        method: "DELETE",
      });
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
    <div className="mx-6 lg:mx-10 font-sans text-[#1A1D1E] dark:text-[#E4E6EB]">
      <div className="sticky top-0 z-30 -mx-6 lg:-mx-10 px-6 lg:px-10 bg-[#FFFFFF]/95 dark:bg-[#1A1A1A]/95 border-b border-[#E6E8EB] dark:border-[#2D2D2D]">
        <div className="py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={
                mode === "create"
                  ? "/dashboard/topics"
                  : `/dashboard/topics/${topic?.id}`
              }
              className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E6E8EB] bg-[#FFFFFF] transition-colors duration-100 hover:bg-[#F4F7F6] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:hover:bg-[#111111]"
            >
              <ChevronLeft className="h-4 w-4 text-[#687076] group-hover:text-[#1A1D1E] dark:text-[#A0A0A0] dark:group-hover:text-[#E4E6EB] transition-colors duration-100" />
            </Link>
            <h1 className="text-lg font-bold tracking-tight text-[#1A1D1E] dark:text-[#E4E6EB] truncate">
              {mode === "create" ? "New Topic" : "Edit Topic"}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-1.5 h-8 px-4 rounded-full bg-[#1A1D1E] text-white text-[12px] font-bold uppercase tracking-wide hover:bg-[#687076] transition-colors duration-100 disabled:opacity-50 dark:bg-[#E4E6EB] dark:text-[#111111] dark:hover:bg-[#A0A0A0]"
          >
            <Check className="h-3.5 w-3.5" />
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="py-6 space-y-6 max-w-2xl mx-auto">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Untitled Topic"
          className="w-full bg-transparent text-3xl font-bold tracking-tight text-[#1A1D1E] dark:text-[#E4E6EB] placeholder:text-[#687076]/40 dark:placeholder:text-[#A0A0A0]/30 outline-none border-b border-[#E6E8EB] dark:border-[#2D2D2D] pb-3"
        />

        <div className="space-y-1.5">
          <label className="block text-[10.5px] font-black uppercase tracking-[0.1em] text-[#687076] dark:text-[#A0A0A0]">
            Description
          </label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What belongs in this topic?"
            className="min-h-[120px] w-full rounded-xl border border-[#E6E8EB] bg-[#F4F7F6] px-4 py-4 text-[14px] text-[#687076] outline-none transition-colors duration-100 placeholder:text-[#687076]/50 focus:border-[#687076]/40 focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#E6E8EB]/60 dark:border-[#2D2D2D] dark:bg-[#111111] dark:text-[#A0A0A0] dark:placeholder:text-[#A0A0A0]/40 dark:focus:border-[#A0A0A0]/40 dark:focus:bg-[#1A1A1A] dark:focus:ring-[#2D2D2D]/50"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-[10.5px] font-black uppercase tracking-[0.1em] text-[#687076] dark:text-[#A0A0A0]">
            Preview
          </label>
          <div className="overflow-hidden rounded-2xl border border-[#E6E8EB] dark:border-[#2D2D2D] bg-[#F4F7F6] dark:bg-[#111111]">
            <div className="p-5">
              <h3 className="text-lg font-bold tracking-tight text-[#1A1D1E] dark:text-[#E4E6EB]">
                {title || "Untitled Topic"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#687076] dark:text-[#A0A0A0]">
                {description || "A clean collection for notes that belong together."}
              </p>
            </div>
          </div>
        </div>

        {mode === "edit" && topic && (
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsArchived((c) => !c)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] transition-colors duration-100",
                isArchived
                  ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
                  : "border-[#E6E8EB] bg-[#F4F7F6] text-[#687076] dark:border-[#2D2D2D] dark:bg-[#111111] dark:text-[#A0A0A0]"
              )}
            >
              <Archive className="h-4 w-4" />
              {isArchived ? "Archived" : "Active"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] text-red-700 transition-colors duration-100 hover:bg-red-100 disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete topic"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
