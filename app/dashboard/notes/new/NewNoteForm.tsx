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
  <label className="block text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 mb-2 dark:text-neutral-400">
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
  <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-700 dark:bg-neutral-900/50">
    <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3 dark:border-neutral-700">
      <div className="flex items-center gap-2">
        <span className="text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
          {title}
        </span>
        {badge && (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[9px] font-bold text-neutral-500 uppercase dark:bg-neutral-800 dark:text-neutral-400">
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
      "h-10 w-full rounded-xl border px-4 text-[13px] font-medium outline-none transition-all",
      "border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400",
      "focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100",
      "dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-600 dark:focus:bg-neutral-900 dark:focus:ring-neutral-900/50",
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
          "h-10 w-full rounded-xl border px-4 text-[13px] font-medium outline-none transition-all",
          "border-neutral-200 bg-neutral-50 text-neutral-900",
          "hover:bg-white",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-100",
          "dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-900 dark:focus-visible:ring-neutral-900/50"
        )}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="truncate">{current}</span>
          <ChevronLeft className={cn("h-4 w-4 rotate-[-90deg] text-neutral-400 transition-transform", open && "rotate-[90deg]")} />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          tabIndex={-1}
          className={cn(
            "absolute z-20 mt-2 w-full overflow-hidden rounded-xl border bg-white shadow-lg",
            "border-neutral-200",
            "dark:border-neutral-700 dark:bg-neutral-900"
          )}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "w-full px-4 py-2.5 text-left text-[13px] font-semibold transition-colors",
                opt.value === value
                  ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
                  : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900/60"
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

  const [qa, setQa] = useState<QAData>({ content: "", importantPoints: [""] });

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
    <div className="mx-auto max-w-5xl pb-20 font-sans">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/notes" className="group flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
            <ChevronLeft className="h-4 w-4 text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100" />
          </Link>
          <h1 className="text-2xl font-serif tracking-tight text-neutral-900 dark:text-neutral-100">New Note</h1>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsFavorite(!isFavorite)} className={cn("h-9 w-9 flex items-center justify-center rounded-xl border transition-all", isFavorite ? "bg-amber-50 border-amber-200 text-amber-500 dark:bg-amber-500/10 dark:border-amber-500/20" : "bg-white border-neutral-200 text-neutral-400 hover:text-neutral-600 dark:bg-neutral-900 dark:border-neutral-700")}>
            <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </button>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 h-9 px-5 rounded-xl bg-neutral-900 text-white text-[12px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200">
            {isSaving ? "Saving..." : <><Check className="h-4 w-4" /> Save</>}
          </button>
        </div>
      </div>

      {/* Type Selector */}
      <div className="mb-8 flex p-1.5 w-fit rounded-2xl bg-neutral-100/50 border border-neutral-200/50 dark:bg-neutral-900/50 dark:border-neutral-700">
        {(["general", "dsa", "qa"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "flex items-center gap-2 px-6 h-9 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
              "border border-transparent",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
              "dark:focus-visible:ring-neutral-700 dark:focus-visible:ring-offset-neutral-900",
              type === t
                ? "bg-white text-neutral-900 shadow-sm border-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                : "bg-transparent text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-900/40 dark:hover:text-neutral-300"
            )}
          >
            {t === "dsa" && <Code2 className="h-3.5 w-3.5" />}
            {t === "qa" && <BookOpen className="h-3.5 w-3.5" />}
            {t === "general" && <FileText className="h-3.5 w-3.5" />}
            {t === "qa" ? "Q&A" : t}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <InputField value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} placeholder="Note title..." className="h-12 text-base font-semibold" />

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <Label>Topic</Label>
          <TopicSelector value={topicId} onChange={setTopicId} />
        </div>

        {/* Tags Block */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900">
          <Tag className="h-3.5 w-3.5 text-neutral-400 mr-2" />
          {tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-600 rounded-lg dark:bg-neutral-800 dark:text-neutral-400">
              #{tag}
              <button onClick={() => setTags(tags.filter(t => t !== tag))}><X className="h-3 w-3 hover:text-red-500" /></button>
            </span>
          ))}
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Add tag..." className="flex-1 min-w-[120px] bg-transparent outline-none text-[13px] placeholder:text-neutral-400 dark:text-neutral-100" />
        </div>

        {/* Dynamic Content Areas */}
        {type === "general" && (
          <FormSection title="Content" badge="Markdown">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your note..." className="w-full min-h-[400px] p-6 text-[14px] text-neutral-700 bg-transparent outline-none resize-none leading-relaxed dark:text-neutral-300" />
          </FormSection>
        )}

        {type === "dsa" && (
          <div className="space-y-6">
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
              <textarea value={dsa.problemStatement} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateDsa({problemStatement: e.target.value})} className="w-full min-h-[150px] p-5 text-[13.5px] bg-transparent outline-none resize-none dark:text-neutral-300" />
            </FormSection>

            <div className="space-y-4">
              <div className="flex items-center justify-between"><Label>Implementations</Label>
                <button onClick={() => updateDsa({implementations: [...dsa.implementations, { language: "Java", code: "", timeComplexity: "", spaceComplexity: "" }]})} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 text-[11px] font-bold uppercase hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"><Plus className="h-3 w-3" /> Add Language</button>
              </div>
              {dsa.implementations.map((impl, idx) => (
                <div key={idx} className="rounded-2xl border border-neutral-200 bg-white overflow-hidden dark:border-neutral-700 dark:bg-neutral-900">
                   <div className="flex items-center justify-between bg-neutral-50 px-4 py-2 border-b border-neutral-200 dark:bg-neutral-900 dark:border-neutral-700">
                     <div className="w-[140px]">
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
                     <button onClick={() => { const next = [...dsa.implementations]; next.splice(idx,1); updateDsa({implementations: next}); }}><Trash2 className="h-4 w-4 text-neutral-500 hover:text-red-500 dark:text-neutral-600" /></button>
                   </div>
                   <CodeEditor language={impl.language} value={impl.code} onChange={code => { const next = [...dsa.implementations]; next[idx].code = code; updateDsa({implementations: next}); }} />
                   <div className="grid grid-cols-2 border-t border-neutral-200 p-4 gap-4 bg-white dark:border-neutral-700 dark:bg-neutral-900">
                      <div className="flex items-center gap-3"><span className="text-[10px] font-black text-neutral-500 uppercase dark:text-neutral-600">Time</span><input className="bg-transparent border-b border-neutral-200 text-[12px] font-mono text-neutral-700 outline-none focus:border-neutral-400 pb-1 w-full placeholder:text-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:placeholder:text-neutral-600 dark:focus:border-neutral-600" placeholder="O(n)" value={impl.timeComplexity} onChange={e => { const next = [...dsa.implementations]; next[idx].timeComplexity = e.target.value; updateDsa({implementations: next}); }} /></div>
                      <div className="flex items-center gap-3"><span className="text-[10px] font-black text-neutral-500 uppercase dark:text-neutral-600">Space</span><input className="bg-transparent border-b border-neutral-200 text-[12px] font-mono text-neutral-700 outline-none focus:border-neutral-400 pb-1 w-full placeholder:text-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:placeholder:text-neutral-600 dark:focus:border-neutral-600" placeholder="O(1)" value={impl.spaceComplexity} onChange={e => { const next = [...dsa.implementations]; next[idx].spaceComplexity = e.target.value; updateDsa({implementations: next}); }} /></div>
                   </div>
                </div>
              ))}
            </div>

            <FormSection title="Notes" badge="Markdown">
              <textarea
                value={dsa.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateDsa({ notes: e.target.value })}
                placeholder="Extra notes, edge cases, intuition..."
                className="w-full min-h-[180px] p-5 text-[13.5px] text-neutral-700 bg-transparent outline-none resize-none dark:text-neutral-300 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
              />
            </FormSection>
          </div>
        )}

        {type === "qa" && (
          <div className="space-y-6">
            <FormSection title="Detailed Answer" badge="Markdown">
              <textarea value={qa.content} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQa({...qa, content: e.target.value})} className="w-full min-h-[300px] p-6 text-[14px] bg-transparent outline-none resize-none dark:text-neutral-300" />
            </FormSection>
            <FormSection title="Key Takeaways" action={
              <button onClick={() => setQa({...qa, importantPoints: [...qa.importantPoints, ""]})} className="p-1.5 hover:bg-neutral-100 rounded-lg dark:hover:bg-neutral-800 text-neutral-500"><Plus className="h-4 w-4" /></button>
            }>
              <div className="p-4 space-y-3">
                 {qa.importantPoints.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 shrink-0" />
                    <input value={p} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const next = [...qa.importantPoints]; next[i] = e.target.value; setQa({...qa, importantPoints: next}); }} className="flex-1 bg-transparent border-b border-neutral-100 dark:border-neutral-700 py-1 text-[13px] outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:text-neutral-200" placeholder="Point..." />
                    <button onClick={() => { const next = [...qa.importantPoints]; next.splice(i,1); setQa({...qa, importantPoints: next}); }}><X className="h-3.5 w-3.5 text-neutral-400 hover:text-red-500" /></button>
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
