'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import type { ReactNode, InputHTMLAttributes } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Note, NoteType, DSAData, QAData } from '@/types';
import { X, Plus, Trash2, ChevronLeft, Code2, BookOpen, FileText, Star, Tag, Check, } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CodeEditor } from '@/components/CodeEditor';
import { TopicSelector } from '@/app/dashboard/topics/TopicSelector';

const TYPE_PILL_STYLES: Record<
  NoteType,
  { active: string; inactive: string; icon: typeof FileText }
> = {
  general: {
    active: "bg-[#FFFFFF] text-[#1A1D1E] border-[#687076]/30 shadow-sm dark:bg-[#1A1A1A] dark:text-[#E4E6EB] dark:border-[#A0A0A0]/30",
    inactive: "bg-transparent text-[#687076] hover:text-[#1A1D1E] border-transparent dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB]",
    icon: FileText,
  },
  dsa: {
    active: "bg-[#FFFFFF] text-[#00A3A3] border-[#00A3A3]/30 shadow-sm dark:bg-[#1A1A1A] dark:text-[#00E0E0] dark:border-[#00E0E0]/30",
    inactive: "bg-transparent text-[#687076] hover:text-[#1A1D1E] border-transparent dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB]",
    icon: Code2,
  },
  qa: {
    active: "bg-[#FFFFFF] text-amber-600 border-amber-500/30 shadow-sm dark:bg-[#1A1A1A] dark:text-amber-400 dark:border-amber-500/30",
    inactive: "bg-transparent text-[#687076] hover:text-[#1A1D1E] border-transparent dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB]",
    icon: BookOpen,
  },
};

const InlineLabel = ({ children }: { children: ReactNode }) => (
  <span className="text-[12px] font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0]">
    {children}
  </span>
);

const SectionDivider = ({ children }: { children: ReactNode }) => (
  <div className="pt-6 pb-3 border-b border-[#E6E8EB] dark:border-[#2D2D2D] mb-4">
    <span className="text-[12px] font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0]">
      {children}
    </span>
  </div>
);

const InputField = ({
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={cn(
      "h-9 w-full rounded-md border px-3 text-sm font-medium outline-none transition-colors duration-100",
      "border-[#E6E8EB] bg-[#FFFFFF] hover:bg-[#E6E8EB]/50 text-[#1A1D1E] placeholder:text-[#687076]/50",
      "focus:border-[#687076]/40 focus:bg-[#FFFFFF]",
      "dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#E4E6EB] dark:placeholder:text-[#A0A0A0]/40 dark:focus:border-[#A0A0A0]/40 dark:focus:bg-[#1A1A1A] dark:hover:bg-[#2D2D2D]/50",
      props.className,
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
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div className="relative w-full" data-dropdown-root="true">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "h-9 w-full rounded-md border px-3 text-sm font-medium outline-none text-left transition-colors duration-100",
          "border-[#E6E8EB] bg-[#FFFFFF] text-[#1A1D1E]",
          "hover:bg-[#E6E8EB]/50 focus:border-[#687076]/40 focus:bg-[#FFFFFF]",
          "dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#E4E6EB] dark:hover:bg-[#2D2D2D]/50 dark:focus:border-[#A0A0A0]/40 dark:focus:bg-[#1A1A1A]",
        )}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="truncate">{current}</span>
          <ChevronLeft
            className={cn(
              "h-3.5 w-3.5 rotate-[-90deg] text-[#687076]/60 transition-transform duration-100 shrink-0",
              open && "rotate-[90deg]",
            )}
          />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          tabIndex={-1}
          className={cn(
            "absolute z-20 mt-1 w-full overflow-hidden rounded-md border shadow-md",
            "bg-[#FFFFFF] border-[#E6E8EB]",
            "dark:border-[#2D2D2D] dark:bg-[#1A1A1A]",
          )}
        >
          {options.map((opt) => (
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
                "w-full px-3 py-2 text-left text-sm font-medium transition-colors duration-100",
                opt.value === value
                  ? "bg-[#F4F7F6] font-bold text-[#1A1D1E] dark:bg-[#111111] dark:text-[#E4E6EB]"
                  : "text-[#687076] hover:bg-[#F4F7F6]/60 dark:text-[#A0A0A0] dark:hover:bg-[#111111]/50",
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

export default function EditNotePage() {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const { user, loading } = useAuth();
  const router = useRouter();
  const initialTopicId: string | null = null;

  const [type, setType] = useState<NoteType>('general');
  const [title, setTitle] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');
  const [topicId, setTopicId] = useState<string | null>(initialTopicId);
  const [sequence, setSequence] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [dsa, setDsa] = useState<DSAData>({
    platform: '',
    difficulty: 'Medium',
    pattern: '',
    problemStatement: '',
    implementations: [{ language: 'Java', code: '', timeComplexity: '', spaceComplexity: '' }],
    notes: '',
  });

  const [qa, setQa] = useState<QAData>({
    topic: '',
    content: '',
    importantPoints: [''],
  });

  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleCreateTopic = async (newTitle: string) => {
    const res = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.topic;
  };

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id || Array.isArray(id)) return;

    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${id}`);
        if (response.ok) {
          const data = await response.json();
          const note = data.note;

          setType(note.type);
          setTitle(note.title);
          setIsFavorite(note.isFavorite);
          setTags(note.tags || []);
          setTopicId(note.topicId || null);
          setSequence(note.sequence ?? null);

          if (note.type === 'general') setContent(note.content || '');
          if (note.type === 'dsa' && note.dsa) {
            const normalizedDsa = {
              ...note.dsa,
              implementations: (note.dsa.implementations || []).map((impl: { language?: string; code?: string; timeComplexity?: string; spaceComplexity?: string }) => ({
                language: impl.language || 'Java',
                code: impl.code || '',
                timeComplexity: impl.timeComplexity || '',
                spaceComplexity: impl.spaceComplexity || '',
              })),
            };
            setDsa(normalizedDsa);
          }
          if (note.type === 'qa' && note.qa) setQa(note.qa);
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Failed to load note' }));
          setFetchError(errorData.error || 'Failed to load note');
        }
      } catch (error) {
        console.error('Error fetching note:', error);
        setFetchError('Failed to load note');
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchNote();
  }, [user, id, router]);

  const handleAddTag = (e: any) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const updateDsa = (fields: Partial<DSAData>) =>
    setDsa((prev) => ({ ...prev, ...fields }));

  const handleAddImplementation = () => {
    setDsa({
      ...dsa,
      implementations: [...dsa.implementations, { language: 'Java', code: '', timeComplexity: '', spaceComplexity: '' }],
    });
  };

  const handleRemoveImplementation = (index: number) => {
    const next = [...dsa.implementations];
    next.splice(index, 1);
    updateDsa({ implementations: next });
  };

  const handleAddPoint = () => {
    setQa({ ...qa, importantPoints: [...qa.importantPoints, ''] });
  };

  const handleRemovePoint = (index: number) => {
    const next = [...qa.importantPoints];
    next.splice(index, 1);
    setQa({ ...qa, importantPoints: next });
  };

  const handleSave = async () => {
    if (!title.trim()) return alert("Title is required");
    if (!user) return;
    setIsSaving(true);
    try {
      const noteData: any = { title, isFavorite, tags, topicId, sequence };

      if (type === 'general') noteData.content = content;
      if (type === 'dsa') noteData.dsa = dsa;
      if (type === 'qa') noteData.qa = qa;

      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData),
      });

      if (response.ok) {
        router.push(`/dashboard/notes/${id}`);
      } else {
        const error = await response.json();
        let errorMessage = `Failed to save note: ${error.error}`;
        if (error.details && Array.isArray(error.details)) {
          errorMessage += ` (${error.details.map((d: any) => d.message).join(', ')})`;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isInitialLoading) return null;

  if (fetchError) {
    return (
      <div className="mx-6 lg:mx-10 flex min-h-[60vh] flex-col items-center justify-center font-sans">
        <p className="text-base font-bold text-red-600 dark:text-red-400">{fetchError}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] px-4 py-2 text-xs font-bold text-[#1A1D1E] transition-colors duration-100 hover:bg-[#F4F7F6] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#E4E6EB] dark:hover:bg-[#111111]"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-6 lg:mx-10 font-sans text-[#1A1D1E] dark:text-[#E4E6EB]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 -mx-6 lg:-mx-10 px-6 lg:px-10 bg-[#FFFFFF]/95 dark:bg-[#1A1A1A]/95 border-b border-[#E6E8EB] dark:border-[#2D2D2D]">
        <div className="py-3 flex items-center justify-between gap-4">
          {/* Left: Back Button + Dynamic Title Header */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.back()}
              className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E6E8EB] bg-[#FFFFFF] transition-colors duration-100 hover:bg-[#F4F7F6] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:hover:bg-[#111111]"
            >
              <ChevronLeft className="h-4 w-4 text-[#687076] group-hover:text-[#1A1D1E] dark:text-[#A0A0A0] dark:group-hover:text-[#E4E6EB] transition-colors duration-100" />
            </button>
            <h1 className="text-lg font-bold tracking-tight text-[#1A1D1E] dark:text-[#E4E6EB] truncate">
              {title.trim() || "Edit Note"}
            </h1>
          </div>

          {/* Right Action Container: Filters, Star, Save Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop Pill Selectors */}
            <div className="hidden sm:flex items-center gap-0.5 p-0.5 rounded-full bg-[#F4F7F6] dark:bg-[#111111] border border-[#E6E8EB] dark:border-[#2D2D2D]">
              {(["general", "dsa", "qa"] as const).map((t) => {
                const Icon = TYPE_PILL_STYLES[t].icon;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 h-7 rounded-full text-[12px] font-bold uppercase tracking-wide border border-transparent transition-all duration-100",
                      type === t ? TYPE_PILL_STYLES[t].active : TYPE_PILL_STYLES[t].inactive,
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {t === "qa" ? "Q&A" : t}
                  </button>
                );
              })}
            </div>

            {/* Tablet/Slim Display Minimalist Icons Selector */}
            <div className="flex sm:hidden items-center gap-0.5 p-0.5 rounded-full bg-[#F4F7F6] dark:bg-[#111111] border border-[#E6E8EB] dark:border-[#2D2D2D]">
              {(["general", "dsa", "qa"] as const).map((t) => {
                const Icon = TYPE_PILL_STYLES[t].icon;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-full border border-transparent transition-all duration-100",
                      type === t ? TYPE_PILL_STYLES[t].active : "text-[#687076] dark:text-[#A0A0A0]",
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-full border transition-colors duration-100",
                isFavorite
                  ? "bg-amber-500/5 border-amber-500/20 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/30 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400"
                  : "bg-[#FFFFFF] border-[#E6E8EB] text-[#687076] hover:text-[#1A1D1E] hover:bg-[#F4F7F6] dark:bg-[#1A1A1A] dark:border-[#2D2D2D] dark:hover:text-[#E4E6EB] dark:hover:bg-[#111111]",
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

      {/* Main Interactive Workspace Container */}
      <div className="py-6 space-y-6">
        {/* Dynamic Core Header Input Field */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note"
          className="w-full bg-transparent text-3xl font-bold tracking-tight text-[#1A1D1E] dark:text-[#E4E6EB] placeholder:text-[#687076]/40 dark:placeholder:text-[#A0A0A0]/30 outline-none border-b border-[#E6E8EB] dark:border-[#2D2D2D] pb-3"
        />

        {/* Global Metadata Matrix Grid Alignment */}
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Linked Topic Anchor */}
          <div className="w-full md:w-64 shrink-0 space-y-1.5">
            <InlineLabel>Topic</InlineLabel>
            <TopicSelector value={topicId} onChange={setTopicId} onCreate={handleCreateTopic} />
          </div>

          {/* Sequence position for topic-linked notes */}
          <div className="w-full md:w-64 shrink-0 space-y-1.5">
            <InlineLabel>Sequence Position</InlineLabel>
            <input
              type="number"
              min={0}
              value={sequence ?? ""}
              onChange={(e) => setSequence(e.target.value ? Number.parseInt(e.target.value, 10) : null)}
              disabled={!topicId}
              placeholder="Auto-assigned"
              className={cn(
                "h-9 w-full rounded-md border px-3 text-sm font-medium outline-none transition-colors duration-100",
                "border-[#E6E8EB] bg-[#FFFFFF] text-[#1A1D1E] placeholder:text-[#687076]/50",
                "focus:border-[#687076]/40 focus:bg-[#FFFFFF] disabled:opacity-60",
                "dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#E4E6EB] dark:placeholder:text-[#A0A0A0]/40 dark:focus:border-[#A0A0A0]/40 dark:focus:bg-[#1A1A1A]",
              )}
            />
          </div>

          {/* Managed Functional Meta Tags Input */}
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
                    className="text-[#687076] hover:text-red-500 dark:text-[#A0A0A0] dark:hover:text-red-400 transition-colors duration-100"
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

        {/* Workspace Panels Strategy Layer */}
        <div className="pt-2">
          {type === "general" && (
            <div className="space-y-3">
              <SectionDivider>Content</SectionDivider>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note..."
                className="w-full min-h-[400px] p-4 text-base font-medium text-[#1A1D1E] bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E6E8EB] dark:border-[#2D2D2D] rounded-md outline-none resize-none leading-relaxed dark:text-[#E4E6EB] placeholder:text-[#687076]/50 dark:placeholder:text-[#A0A0A0]/35 focus:border-[#687076]/40 dark:focus:border-[#A0A0A0]/40 transition-colors duration-100"
              />
            </div>
          )}

          {type === "dsa" && (
            <div className="space-y-6">
              {/* Problem Attribute Details Workspace Grid */}
              <div>
                <SectionDivider>Problem Details</SectionDivider>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <InlineLabel>Platform</InlineLabel>
                    <InputField
                      placeholder="LeetCode"
                      value={dsa.platform}
                      onChange={(e) => updateDsa({ platform: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <InlineLabel>Difficulty</InlineLabel>
                    <Dropdown
                      ariaLabel="Difficulty"
                      value={dsa.difficulty}
                      onChange={(next) => updateDsa({ difficulty: next })}
                      options={[
                        { label: "Easy", value: "Easy" },
                        { label: "Medium", value: "Medium" },
                        { label: "Hard", value: "Hard" },
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <InlineLabel>Pattern</InlineLabel>
                    <InputField
                      placeholder="Sliding Window"
                      value={dsa.pattern}
                      onChange={(e) => updateDsa({ pattern: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Implementations Block */}
              <div className="space-y-4">
                <SectionDivider>Implementations</SectionDivider>
                <div className="space-y-4">
                  {dsa.implementations.map((impl, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] overflow-hidden shadow-sm"
                    >
                      {/* Sub-Header Node Control Blocks */}
                      <div className="flex items-center justify-between px-4 py-3 bg-[#F4F7F6]/50 dark:bg-[#111111]/40 border-b border-[#E6E8EB] dark:border-[#2D2D2D]">
                        <div className="w-[120px]">
                          <Dropdown
                            ariaLabel="Language"
                            value={impl.language}
                            onChange={(next) => {
                              const nextImpl = [...dsa.implementations];
                              nextImpl[idx].language = next;
                              updateDsa({ implementations: nextImpl });
                            }}
                            options={[
                              { label: "Java", value: "Java" },
                              { label: "Python", value: "Python" },
                              { label: "C++", value: "C++" },
                              { label: "JavaScript", value: "JavaScript" },
                            ]}
                          />
                        </div>
                        <button
                          onClick={() => {
                            const next = [...dsa.implementations];
                            next.splice(idx, 1);
                            updateDsa({ implementations: next });
                          }}
                          className="p-1.5 rounded-full hover:bg-[#E6E8EB] dark:hover:bg-[#2D2D2D] text-[#687076] hover:text-red-500 dark:text-[#A0A0A0] dark:hover:text-red-400 transition-colors duration-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Code Execution Representation Canvas Layer */}
                      <div className="p-4 bg-[#FFFFFF] dark:bg-[#1A1A1A]">
                        <CodeEditor
                          language={impl.language}
                          value={impl.code}
                          onChange={(code) => {
                            const next = [...dsa.implementations];
                            next[idx].code = code;
                            updateDsa({ implementations: next });
                          }}
                        />
                      </div>

                      {/* Algorithmic Metrics Inputs Matrix Block */}
                      <div className="grid grid-cols-2 border-t border-[#E6E8EB] dark:border-[#2D2D2D] bg-[#F4F7F6]/30 dark:bg-[#111111]/20">
                        <div className="flex items-center gap-3 px-4 py-2.5 border-r border-[#E6E8EB] dark:border-[#2D2D2D]">
                          <span className="text-[10px] font-bold text-[#687076] uppercase tracking-wider dark:text-[#A0A0A0] shrink-0">Time</span>
                          <input
                            className="bg-transparent border-b border-[#E6E8EB]/60 text-sm font-mono text-[#1A1D1E] outline-none focus:border-[#687076]/40 pb-0.5 w-full placeholder:text-[#687076]/45 dark:border-[#2D2D2D]/60 dark:text-[#E4E6EB] dark:focus:border-[#A0A0A0]/40 transition-colors duration-100 dark:placeholder:text-[#A0A0A0]/35"
                            placeholder="O(n)"
                            value={impl.timeComplexity}
                            onChange={(e) => {
                              const next = [...dsa.implementations];
                              next[idx].timeComplexity = e.target.value;
                              updateDsa({ implementations: next });
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2.5">
                          <span className="text-[10px] font-bold text-[#687076] uppercase tracking-wider dark:text-[#A0A0A0] shrink-0">Space</span>
                          <input
                            className="bg-transparent border-b border-[#E6E8EB]/60 text-sm font-mono text-[#1A1D1E] outline-none focus:border-[#687076]/40 pb-0.5 w-full placeholder:text-[#687076]/45 dark:border-[#2D2D2D]/60 dark:text-[#E4E6EB] dark:focus:border-[#A0A0A0]/40 transition-colors duration-100 dark:placeholder:text-[#A0A0A0]/35"
                            placeholder="O(1)"
                            value={impl.spaceComplexity}
                            onChange={(e) => {
                              const next = [...dsa.implementations];
                              next[idx].spaceComplexity = e.target.value;
                              updateDsa({ implementations: next });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() =>
                    updateDsa({
                      implementations: [
                        ...dsa.implementations,
                        { language: "Java", code: "", timeComplexity: "", spaceComplexity: "" },
                      ],
                    })
                  }
                  className="flex items-center gap-1.5 px-3 h-8 rounded-full border border-[#E6E8EB] bg-[#FFFFFF] text-[11px] font-bold uppercase tracking-wide text-[#687076] hover:bg-[#F4F7F6] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:bg-[#111111] transition-colors duration-100"
                >
                  <Plus className="h-3 w-3" />
                  Add Language
                </button>
              </div>

              {/* Core Problem Statement Canvas Block */}
              <div className="space-y-3">
                <SectionDivider>Problem Statement</SectionDivider>
                <textarea
                  value={dsa.problemStatement}
                  onChange={(e) => updateDsa({ problemStatement: e.target.value })}
                  placeholder="Describe the problem properties and core challenges..."
                  className="w-full min-h-[140px] p-4 text-base font-medium bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E6E8EB] dark:border-[#2D2D2D] rounded-md outline-none resize-none dark:text-[#E4E6EB] placeholder:text-[#687076]/50 dark:placeholder:text-[#A0A0A0]/35 focus:border-[#687076]/40 dark:focus:border-[#A0A0A0]/40 transition-colors duration-100"
                />
              </div>

              {/* Algorithmic Intuition & Conceptual Notes Container */}
              <div className="space-y-3">
                <SectionDivider>Notes</SectionDivider>
                <textarea
                  value={dsa.notes}
                  onChange={(e) => updateDsa({ notes: e.target.value })}
                  placeholder="Analyze tricky edge cases, abstract complexity assumptions, or mathematical intuition models..."
                  className="w-full min-h-[140px] p-4 text-base font-medium text-[#1A1D1E] bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E6E8EB] dark:border-[#2D2D2D] rounded-md outline-none resize-none dark:text-[#E4E6EB] placeholder:text-[#687076]/50 dark:placeholder:text-[#A0A0A0]/35 focus:border-[#687076]/40 dark:focus:border-[#A0A0A0]/40 transition-colors duration-100"
                />
              </div>
            </div>
          )}

          {type === "qa" && (
            <div className="space-y-6">
              {/* Detailed Explanation Textarea Array Workspace */}
              <div className="space-y-3">
                <SectionDivider>Detailed Answer</SectionDivider>
                <textarea
                  value={qa.content}
                  onChange={(e) => setQa({ ...qa, content: e.target.value })}
                  placeholder="Document structural mechanics, architectural design tradeoffs, or precise operational definitions..."
                  className="w-full min-h-[280px] p-4 text-base font-medium bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E6E8EB] dark:border-[#2D2D2D] rounded-md outline-none resize-none dark:text-[#E4E6EB] placeholder:text-[#687076]/50 dark:placeholder:text-[#A0A0A0]/35 focus:border-[#687076]/40 dark:focus:border-[#A0A0A0]/40 transition-colors duration-100"
                />
              </div>

              {/* Key Highlights Segment Column Checklist */}
              <div className="space-y-3">
                <SectionDivider>Key Takeaways</SectionDivider>
                <div className="space-y-3">
                  {qa.importantPoints.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#687076]/50 dark:bg-[#A0A0A0]/50 shrink-0" />
                      <input
                        value={p}
                        onChange={(e) => {
                          const next = [...qa.importantPoints];
                          next[i] = e.target.value;
                          setQa({ ...qa, importantPoints: next });
                        }}
                        className="flex-1 bg-transparent border-b border-[#E6E8EB] dark:border-[#2D2D2D] py-1 text-base font-medium outline-none focus:border-[#687076]/40 dark:focus:border-[#A0A0A0]/40 dark:text-[#E4E6EB] transition-colors duration-100 placeholder:text-[#687076]/40 dark:placeholder:text-[#A0A0A0]/30"
                        placeholder="State critical architecture milestone or key takeaway concept..."
                      />
                      <button
                        onClick={() => {
                          const next = [...qa.importantPoints];
                          next.splice(i, 1);
                          setQa({ ...qa, importantPoints: next });
                        }}
                        className="p-1 text-[#687076]/40 hover:text-red-500 dark:text-[#A0A0A0]/40 dark:hover:text-red-400 rounded-full transition-colors duration-100 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setQa({ ...qa, importantPoints: [...qa.importantPoints, ""] })
                    }
                    className="flex items-center gap-1.5 mt-2 text-[11px] font-bold uppercase tracking-wide text-[#687076] hover:text-[#1A1D1E] dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB] transition-colors duration-100"
                  >
                    <Plus className="h-3 w-3" />
                    Add Point
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
