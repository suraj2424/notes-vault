"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { NoteType, DSAData, QAData } from "@/types";
import { X, Plus, ChevronLeft, Star, Tag, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopicSelector } from "@/app/dashboard/topics/TopicSelector";
import { NoteTypeSelector } from "./components/NoteTypeSelector";
import { SectionDivider } from "./components/SectionDivider";
import { InlineLabel } from "./components/InlineLabel";
import { InputField } from "./components/InputField";
import { Dropdown } from "./components/Dropdown";
import { GeneralWorkspace } from "./components/GeneralWorkspace";
import { DSAWorkspace } from "./components/DSAWorkspace";
import { QAWorkspace } from "./components/QAWorkspace";

const TYPE_PILL_STYLES = {
  general: {
    active: "bg-[#FFFFFF] text-[#1A1D1E] border-[#687076]/30 shadow-sm dark:bg-[#1A1A1A] dark:text-[#E4E6EB] dark:border-[#A0A0A0]/30",
    inactive: "bg-transparent text-[#687076] hover:text-[#1A1D1E] border-transparent dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB]",
  },
  dsa: {
    active: "bg-[#FFFFFF] text-[#00A3A3] border-[#00A3A3]/30 shadow-sm dark:bg-[#1A1A1A] dark:text-[#00E0E0] dark:border-[#00E0E0]/30",
    inactive: "bg-transparent text-[#687076] hover:text-[#1A1D1E] border-transparent dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB]",
  },
  qa: {
    active: "bg-[#FFFFFF] text-amber-600 border-amber-500/30 shadow-sm dark:bg-[#1A1A1A] dark:text-amber-400 dark:border-amber-500/30",
    inactive: "bg-transparent text-[#687076] hover:text-[#1A1D1E] border-transparent dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB]",
  },
} as const;

const initialDsa: DSAData = {
  platform: "",
  difficulty: "Medium",
  pattern: "",
  problemStatement: "",
  implementations: [
    { language: "Java", code: "", timeComplexity: "", spaceComplexity: "" },
  ],
  notes: "",
};

const initialQa: QAData = {
  topic: "",
  content: "",
  importantPoints: [""],
};

export function NewNoteForm() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as NoteType) || "general";
  const initialTopicId = searchParams.get("topicId");

  const [type, setType] = useState<NoteType>(initialType);
  const [title, setTitle] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [topicId, setTopicId] = useState<string | null>(initialTopicId);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState("");
  const [dsa, setDsa] = useState<DSAData>(initialDsa);
const [qa, setQa] = useState<QAData>(initialQa);
const [nextSequence, setNextSequence] = useState<number | null>(null);

useEffect(() => {
let cancelled = false;
if (!topicId) { setNextSequence(null); return; }
  fetch(`/api/topics/${topicId}/notes?pageSize=1&sort=desc`)
  .then((r) => r.ok ? r.json() : null)
  .then((data) => {
    if (cancelled || !data) return;
    const maxSeq = data.notes?.[0]?.sequence ?? null;
    setNextSequence(maxSeq !== null && typeof maxSeq === 'number' ? maxSeq + 1 : 0);
  });
return () => { cancelled = true; };
}, [topicId]);

const handleCreateTopic = useCallback(async (newTitle: string) => {
    const res = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.topic;
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  const handleAddTag = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && tagInput.trim()) {
        e.preventDefault();
        if (!tags.includes(tagInput.trim())) {
          setTags([...tags, tagInput.trim()]);
        }
        setTagInput("");
      }
    },
    [tagInput, tags]
  );

  const updateDsa = useCallback((fields: Partial<DSAData>) => {
    setDsa((prev) => ({ ...prev, ...fields }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return alert("Title is required");
    if (!user) return;
    setIsSaving(true);
    try {
      const noteData = {
        type,
        title,
        isFavorite,
        tags,
        topicId,
        ...(type === "general" && { content }),
        ...(type === "dsa" && { dsa }),
        ...(type === "qa" && { qa }),
      };
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      });
        if (res.ok) router.back();
    } catch (err) {
      alert("Failed to save note.");
    } finally {
      setIsSaving(false);
    }
  }, [type, title, isFavorite, tags, topicId, content, dsa, qa, user, router]);

  if (loading || !user) return null;

  return (
    <div className="mx-6 lg:mx-10 font-sans text-[#1A1D1E] dark:text-[#E4E6EB]">
      <div className="sticky top-0 z-30 -mx-6 lg:-mx-10 px-6 lg:px-10 bg-[#FFFFFF]/95 dark:bg-[#1A1A1A]/95 border-b border-[#E6E8EB] dark:border-[#2D2D2D]">
        <div className="py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => router.back()}
          className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E6E8EB] bg-[#FFFFFF] transition-colors duration-100 hover:bg-[#F4F7F6] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:hover:bg-[#111111]"
        >
              <ChevronLeft className="h-4 w-4 text-[#687076] group-hover:text-[#1A1D1E] dark:text-[#A0A0A0] dark:group-hover:text-[#E4E6EB] transition-colors duration-100" />
            </button>
            <h1 className="text-lg font-bold tracking-tight text-[#1A1D1E] dark:text-[#E4E6EB] truncate">
              {title.trim() || "New Note"}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <NoteTypeSelector type={type} onTypeChange={setType} isSaving={isSaving} />

            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-full border transition-colors duration-100",
                isFavorite
                  ? "bg-amber-500/5 border-amber-500/20 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/30 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400"
                  : "bg-[#FFFFFF] border-[#E6E8EB] text-[#687076] hover:text-[#1A1D1E] hover:bg-[#F4F7F6] dark:bg-[#1A1A1A] dark:border-[#2D2D2D] dark:hover:text-[#E4E6EB] dark:hover:bg-[#111111]"
              )}
            >
              <Star className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 h-8 px-4 rounded-full bg-[#1A1D1E] text-white text-[12px] font-bold uppercase tracking-wide hover:bg-[#687076] transition-colors duration-100 disabled:opacity-50 dark:bg-[#E4E6EB] dark:text-[#111111] dark:hover:bg-[#A0A0A0]"
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="py-6 space-y-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note"
          className="w-full bg-transparent text-3xl font-bold tracking-tight text-[#1A1D1E] dark:text-[#E4E6EB] placeholder:text-[#687076]/40 dark:placeholder:text-[#A0A0A0]/30 outline-none border-b border-[#E6E8EB] dark:border-[#2D2D2D] pb-3"
        />

<div className="flex flex-col md:flex-row md:items-start gap-6"> 
<div className="w-full md:w-64 shrink-0 space-y-1.5"> 
<InlineLabel htmlFor="topic">Topic</InlineLabel> 
<TopicSelector value={topicId} onChange={setTopicId} onCreate={handleCreateTopic} /> 
{topicId && nextSequence !== null && (
<p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-secondary">
<Info className="h-3.5 w-3.5 shrink-0 text-[#687076]" />
This note will be added as Step {nextSequence}
</p>
)} 
</div> 

          <div className="flex-1 space-y-1.5">
            <InlineLabel>Tags</InlineLabel>
            <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-[#E6E8EB] bg-[#FFFFFF] px-3 py-[5px] transition-colors duration-100 focus-within:border-[#687076]/40 dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:focus-within:border-[#A0A0A0]/40">
              <Tag className="h-3.5 w-3.5 text-[#687076]/40 dark:text-[#A0A0A0]/40 shrink-0" />
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-[#F4F7F6] dark:bg-[#111111] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#687076] dark:text-[#A0A0A0] rounded border border-[#E6E8EB] dark:border-[#2D2D2D]"
                >
                  #{tag}
                  <button
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    disabled={isSaving}
                    className="text-[#687076] hover:text-red-500 dark:text-[#A0A0A0] dark:hover:text-red-400 transition-colors duration-100 disabled:opacity-50"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag..."
                className="flex-1 min-w-[100px] bg-transparent outline-none text-sm text-[#1A1D1E] placeholder:text-[#687076]/50 dark:text-[#E4E6EB] dark:placeholder:text-[#A0A0A0]/40 py-0.5"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          {type === "general" && (
          <div>
            <SectionDivider>Content</SectionDivider>
            <GeneralWorkspace content={content} onContentChange={setContent} isSaving={isSaving} />
          </div>
        )}
          {type === "dsa" && <DSAWorkspace dsa={dsa} updateDsa={updateDsa} isSaving={isSaving} />}
          {type === "qa" && <QAWorkspace qa={qa} setQa={setQa} isSaving={isSaving} />}
        </div>
      </div>
    </div>
  );
}
