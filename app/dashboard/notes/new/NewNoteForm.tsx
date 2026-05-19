"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { NoteType, DSAData, QAData } from "@/types";
import {
  X, Plus, Trash2, ChevronLeft, Code2, BookOpen, FileText, Star, Tag, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CodeEditor } from "@/components/CodeEditor";
import { TopicSelector } from "@/app/dashboard/topics/TopicSelector";

// --- REUSABLE UI SUB-COMPONENTS ---

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[10px] font-bold uppercase tracking-wide text-[#687076] mb-1.5 dark:text-[#A0A0A0]">
    {children}
  </label>
);

interface FormSectionProps {
  title: string;
  badge?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const FormSection = ({ title, badge, children, action }: FormSectionProps) => (
  <div className="rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] overflow-hidden dark:border-[#2D2D2D] dark:bg-[#1A1A1A]">
    <div className="flex items-center justify-between border-b border-[#E6E8EB] px-4 py-2.5 dark:border-[#2D2D2D] bg-[#F4F7F6]/50 dark:bg-[#111111]/30">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-[#687076] dark:text-[#A0A0A0]">
          {title}
        </span>
        {badge && (
          <span className="rounded bg-[#E6E8EB] px-1.5 py-0.5 text-[9px] font-bold text-[#687076] uppercase dark:bg-[#2D2D2D] dark:text-[#A0A0A0]">
            {badge}
          </span>
        )}
      </div>
      {action}
    </div>
    {children}
  </div>
);

const InputField = ({ ...props }) => (
  <input
    {...props}
    className={cn(
      "h-9 w-full rounded border px-3 text-xs font-medium outline-none transition-colors duration-100",
      "border-[#E6E8EB] bg-[#F4F7F6] text-[#1A1D1E] placeholder:text-[#687076]/50",
      "focus:border-[#687076]/40 focus:bg-[#FFFFFF]",
      "dark:border-[#2D2D2D] dark:bg-[#111111] dark:text-[#E4E6EB] dark:placeholder:text-[#A0A0A0]/40 dark:focus:border-[#A0A0A0]/40 dark:focus:bg-[#1A1A1A]",
      props.className
    )}
  />
);

type DropdownOption<T extends string> = { label: string; value: T };

function Dropdown<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: DropdownOption<T>[];
  onChange: (next: T) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const root = target.closest("[data-dropdown-root='true']");
      if (!root) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = options.find(o => o.value === value)?.label ?? value;

  return (
    <div className="relative" data-dropdown-root="true">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className={cn(
          "h-9 w-full rounded border px-3 text-xs font-medium outline-none text-left transition-colors duration-100",
          "border-[#E6E8EB] bg-[#F4F7F6] text-[#1A1D1E]",
          "hover:bg-[#E6E8EB]/50",
          "dark:border-[#2D2D2D] dark:bg-[#111111] dark:text-[#E4E6EB] dark:hover:bg-[#2D2D2D]/50"
        )}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="truncate">{current}</span>
          <ChevronLeft className={cn("h-3.5 w-3.5 rotate-[-90deg] text-[#687076]/60 transition-transform duration-100", open && "rotate-[90deg]")} />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          tabIndex={-1}
          className={cn(
            "absolute z-20 mt-1 w-full overflow-hidden rounded border bg-[#FFFFFF] shadow-md",
            "border-[#E6E8EB]",
            "dark:border-[#2D2D2D] dark:bg-[#1A1A1A]"
          )}
        >
          {options.map(opt => (
            <button
              type="button"
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "w-full px-3 py-2 text-left text-xs font-medium transition-colors duration-100",
                opt.value === value
                  ? "bg-[#F4F7F6] font-bold text-[#1A1D1E] dark:bg-[#111111] dark:text-[#E4E6EB]"
                  : "text-[#687076] hover:bg-[#F4F7F6]/60 dark:text-[#A0A0A0] dark:hover:bg-[#111111]/50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function NewNoteForm() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as NoteType) || "general";
  const initialTopicId = searchParams.get("topicId");

  // State
  const [type, setType] = useState<NoteType>(initialType);
  const [title, setTitle] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState("");
  const [topicId, setTopicId] = useState<string | null>(initialTopicId);
  const [isSaving, setIsSaving] = useState(false);

  const [dsa, setDsa] = useState<DSAData>({
    platform: "", difficulty: "Medium", pattern: "", problemStatement: "",
    implementations: [{ language: "Java", code: "", timeComplexity: "", spaceComplexity: "" }],
    notes: "",
  });

  const [qa, setQa] = useState<QAData>({ topic: "", content: "", importantPoints: [""] });

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  // Handlers
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const updateDsa = (fields: Partial<DSAData>) => setDsa(prev => ({ ...prev, ...fields }));
  
  const handleSave = async () => {
    if (!title.trim()) return alert("Title is required");
    if (!user) return;
    setIsSaving(true);
    try {
      const noteData = { type, title, isFavorite, tags, topicId,
        ...(type === "general" && { content }),
        ...(type === "dsa" && { dsa }),
        ...(type === "qa" && { qa })
      };
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      });
      if (res.ok) router.push("/dashboard");
    } catch (err) { alert("Failed to save note."); }
    finally { setIsSaving(false); }
  };

  if (loading || !user) return null;

  return (
    <div className="mx-auto max-w-4xl pb-16 font-sans">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/notes" className="group flex h-8 w-8 items-center justify-center rounded border border-[#E6E8EB] bg-[#FFFFFF] transition-colors duration-100 hover:bg-[#F4F7F6] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:hover:bg-[#111111]">
            <ChevronLeft className="h-4 w-4 text-[#687076] group-hover:text-[#1A1D1E] dark:text-[#A0A0A0] dark:group-hover:text-[#E4E6EB] transition-colors duration-100" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-[#1A1D1E] dark:text-[#E4E6EB]">New Note</h1>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsFavorite(!isFavorite)} className={cn("h-8 w-8 flex items-center justify-center rounded border transition-colors duration-100", isFavorite ? "bg-amber-500/5 border-amber-500/20 text-amber-500 dark:bg-amber-500/10" : "bg-[#FFFFFF] border-[#E6E8EB] text-[#687076]/60 hover:text-[#1A1D1E] dark:bg-[#1A1A1A] dark:border-[#2D2D2D]")}>
            <Star className={cn("h-3.5 w-3.5 transition-colors duration-100", isFavorite && "fill-current")} />
          </button>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 h-8 px-4 rounded bg-[#1A1D1E] text-white text-[10px] font-bold uppercase tracking-wide hover:bg-[#687076] transition-colors duration-100 disabled:opacity-50 dark:bg-[#E4E6EB] dark:text-[#111111] dark:hover:bg-[#A0A0A0]">
            {isSaving ? "Saving..." : <><Check className="h-3.5 w-3.5" /> Save</>}
          </button>
        </div>
      </div>

      {/* Type Selector Tabs */}
      <div className="mb-6 flex p-1 w-fit rounded-lg bg-[#F4F7F6] border border-[#E6E8EB] dark:bg-[#111111] dark:border-[#2D2D2D]">
        {(["general", "dsa", "qa"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "flex items-center gap-1.5 px-4 h-7 rounded text-[10px] font-bold uppercase tracking-wide transition-colors duration-100",
              type === t
                ? "bg-[#FFFFFF] text-[#1A1D1E] border border-[#E6E8EB] shadow-sm dark:bg-[#1A1A1A] dark:text-[#E4E6EB] dark:border-[#2D2D2D]"
                : "bg-transparent text-[#687076] hover:text-[#1A1D1E] dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB]"
            )}
          >
            {t === "general" && <FileText className="h-3 w-3" />}
            {t === "dsa" && <Code2 className="h-3 w-3" />}
            {t === "qa" && <BookOpen className="h-3 w-3" />}
            {t === "qa" ? "Q&A" : t}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        <InputField value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} placeholder="Note title..." className="h-10 text-sm font-semibold px-4 bg-[#FFFFFF] dark:bg-[#1A1A1A]" />

        <div className="rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] p-4 dark:border-[#2D2D2D] dark:bg-[#1A1A1A]">
          <Label>Topic</Label>
          <TopicSelector value={topicId} onChange={setTopicId} />
        </div>

        {/* Tags Block */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] px-3 py-2 dark:border-[#2D2D2D] dark:bg-[#1A1A1A]">
          <Tag className="h-3.5 w-3.5 text-[#687076]/50 mr-1" />
          {tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 bg-[#F4F7F6] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#687076] rounded dark:bg-[#111111] dark:text-[#A0A0A0] border border-[#E6E8EB] dark:border-[#2D2D2D]">
              #{tag}
              <button onClick={() => setTags(tags.filter(t => t !== tag))} className="text-[#687076] hover:text-red-500 transition-colors duration-100"><X className="h-2.5 w-2.5" /></button>
            </span>
          ))}
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Add tag..." className="flex-1 min-w-[100px] bg-transparent outline-none text-xs placeholder:text-[#687076]/40 dark:text-[#E4E6EB]" />
        </div>

        {/* Dynamic Content Areas */}
        {type === "general" && (
          <FormSection title="Content" badge="Markdown">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your note..." className="w-full min-h-[350px] p-4 text-xs font-medium text-[#1A1D1E] bg-transparent outline-none resize-none leading-relaxed dark:text-[#E4E6EB]" />
          </FormSection>
        )}

        {type === "dsa" && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1"><Label>Platform</Label><InputField placeholder="LeetCode" value={dsa.platform} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDsa({platform: e.target.value})} /></div>
              <div className="space-y-1"><Label>Difficulty</Label>
                <Dropdown
                  ariaLabel="Difficulty"
                  value={dsa.difficulty as "Easy" | "Medium" | "Hard"}
                  onChange={(next) => updateDsa({ difficulty: next as any })}
                  options={[
                    { label: "Easy", value: "Easy" },
                    { label: "Medium", value: "Medium" },
                    { label: "Hard", value: "Hard" },
                  ]}
                />
              </div>
               <div className="space-y-1"><Label>Pattern</Label><InputField placeholder="Sliding Window" value={dsa.pattern} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDsa({pattern: e.target.value})} /></div>
            </div>

            <FormSection title="Problem Statement" badge="Markdown">
              <textarea value={dsa.problemStatement} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateDsa({problemStatement: e.target.value})} className="w-full min-h-[120px] p-4 text-xs font-medium bg-transparent outline-none resize-none dark:text-[#E4E6EB]" />
            </FormSection>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Implementations</Label>
                <button onClick={() => updateDsa({implementations: [...dsa.implementations, { language: "Java", code: "", timeComplexity: "", spaceComplexity: "" }]})} className="flex items-center gap-1.5 px-2.5 h-7 rounded border border-[#E6E8EB] bg-[#FFFFFF] text-[10px] font-bold uppercase tracking-wide text-[#687076] hover:bg-[#F4F7F6] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:bg-[#111111] transition-colors duration-100"><Plus className="h-3 w-3" /> Add Language</button>
              </div>
              {dsa.implementations.map((impl, idx) => (
                <div key={idx} className="rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] overflow-hidden dark:border-[#2D2D2D] dark:bg-[#1A1A1A]">
                   <div className="flex items-center justify-between bg-[#F4F7F6] px-3 py-1.5 border-b border-[#E6E8EB] dark:bg-[#111111] dark:border-[#2D2D2D]">
                     <div className="w-[110px]">
                       <Dropdown
                         ariaLabel="Language"
                         value={impl.language as "Java" | "Python" | "C++"}
                         onChange={(next) => {
                           const nextImpl = [...dsa.implementations];
                           nextImpl[idx].language = next;
                           updateDsa({ implementations: nextImpl });
                         }}
                         options={[
                           { label: "Java", value: "Java" },
                           { label: "Python", value: "Python" },
                           { label: "C++", value: "C++" },
                         ]}
                       />
                     </div>
                     <button onClick={() => { const next = [...dsa.implementations]; next.splice(idx,1); updateDsa({implementations: next}); }} className="p-1 rounded hover:bg-[#E6E8EB] dark:hover:bg-[#2D2D2D] text-[#687076] hover:text-red-500 transition-colors duration-100"><Trash2 className="h-3.5 w-3.5" /></button>
                   </div>
                   <CodeEditor language={impl.language} value={impl.code} onChange={code => { const next = [...dsa.implementations]; next[idx].code = code; updateDsa({implementations: next}); }} />
                   <div className="grid grid-cols-2 border-t border-[#E6E8EB] p-3 gap-4 bg-[#FFFFFF] dark:border-[#2D2D2D] dark:bg-[#1A1A1A]">
                      <div className="flex items-center gap-2"><span className="text-[9px] font-bold text-[#687076] uppercase tracking-wider dark:text-[#A0A0A0]">Time</span><input className="bg-transparent border-b border-[#E6E8EB] text-xs font-mono text-[#1A1D1E] outline-none focus:border-[#687076]/40 pb-0.5 w-full placeholder:text-[#687076]/30 dark:border-[#2D2D2D] dark:text-[#E4E6EB] dark:focus:border-[#A0A0A0]/40 transition-colors duration-100" placeholder="O(n)" value={impl.timeComplexity} onChange={e => { const next = [...dsa.implementations]; next[idx].timeComplexity = e.target.value; updateDsa({implementations: next}); }} /></div>
                      <div className="flex items-center gap-2"><span className="text-[9px] font-bold text-[#687076] uppercase tracking-wider dark:text-[#A0A0A0]">Space</span><input className="bg-transparent border-b border-[#E6E8EB] text-xs font-mono text-[#1A1D1E] outline-none focus:border-[#687076]/40 pb-0.5 w-full placeholder:text-[#687076]/30 dark:border-[#2D2D2D] dark:text-[#E4E6EB] dark:focus:border-[#A0A0A0]/40 transition-colors duration-100" placeholder="O(1)" value={impl.spaceComplexity} onChange={e => { const next = [...dsa.implementations]; next[idx].spaceComplexity = e.target.value; updateDsa({implementations: next}); }} /></div>
                   </div>
                </div>
              ))}
            </div>

            <FormSection title="Notes" badge="Markdown">
              <textarea
                value={dsa.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateDsa({ notes: e.target.value })}
                placeholder="Extra notes, edge cases, intuition..."
                className="w-full min-h-[140px] p-4 text-xs font-medium text-[#1A1D1E] bg-transparent outline-none resize-none dark:text-[#E4E6EB] placeholder:text-[#687076]/40"
              />
            </FormSection>
          </div>
        )}

        {type === "qa" && (
          <div className="space-y-5">
             <div className="space-y-1"><Label>Topic</Label><InputField placeholder="e.g., System Design" value={qa.topic} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQa({...qa, topic: e.target.value})} /></div>
            <FormSection title="Detailed Answer" badge="Markdown">
              <textarea value={qa.content} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQa({...qa, content: e.target.value})} className="w-full min-h-[250px] p-4 text-xs font-medium bg-transparent outline-none resize-none dark:text-[#E4E6EB]" />
            </FormSection>
            <FormSection title="Key Takeaways" action={
              <button onClick={() => setQa({...qa, importantPoints: [...qa.importantPoints, ""]})} className="p-1 hover:bg-[#E6E8EB] rounded dark:hover:bg-[#2D2D2D] text-[#687076] transition-colors duration-100"><Plus className="h-3.5 w-3.5" /></button>
            }>
              <div className="p-4 space-y-2.5 bg-[#FFFFFF] dark:bg-[#1A1A1A]">
                 {qa.importantPoints.map((p, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="h-1 w-1 rounded-full bg-[#687076]/40 dark:bg-[#A0A0A0]/40 shrink-0" />
                    <input value={p} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const next = [...qa.importantPoints]; next[i] = e.target.value; setQa({...qa, importantPoints: next}); }} className="flex-1 bg-transparent border-b border-[#E6E8EB] dark:border-[#2D2D2D] py-0.5 text-xs font-medium outline-none focus:border-[#687076]/40 dark:focus:border-[#A0A0A0]/40 dark:text-[#E4E6EB] transition-colors duration-100" placeholder="Point..." />
                    <button onClick={() => { const next = [...qa.importantPoints]; next.splice(i,1); setQa({...qa, importantPoints: next}); }} className="p-0.5 text-[#687076]/60 hover:text-red-500 rounded transition-colors duration-100"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            </FormSection>
          </div>
        )}
      </div>
    </div>
  );
}