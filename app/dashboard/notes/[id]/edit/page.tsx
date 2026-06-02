'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { NoteType, DSAData, QAData } from '@/types';
import { ChevronLeft, Star, Tag, Check, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TopicSelector } from '@/app/dashboard/topics/TopicSelector';
import { NoteTypeSelector } from '@/app/dashboard/notes/new/components/NoteTypeSelector';
import { SectionDivider } from '@/app/dashboard/notes/new/components/SectionDivider';
import { InlineLabel } from '@/app/dashboard/notes/new/components/InlineLabel';
import { InputField } from '@/app/dashboard/notes/new/components/InputField';
import { GeneralWorkspace } from '@/app/dashboard/notes/new/components/GeneralWorkspace';
import { DSAWorkspace } from '@/app/dashboard/notes/new/components/DSAWorkspace';
import { QAWorkspace } from '@/app/dashboard/notes/new/components/QAWorkspace';

export default function EditNotePage() {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const { user, loading } = useAuth();
  const router = useRouter();

  const [type, setType] = useState<NoteType>('general');
  const [title, setTitle] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');
  const [topicId, setTopicId] = useState<string | null>(null);
  const [sequence, setSequence] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

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

  const stateRef = useRef({ type, title, isFavorite, tags, topicId, sequence, content, dsa, qa, user, id });
  stateRef.current = { type, title, isFavorite, tags, topicId, sequence, content, dsa, qa, user, id };

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
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id || Array.isArray(id)) return;

    const controller = new AbortController();

    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${id}`, { signal: controller.signal });
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
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Error fetching note:', error);
        setFetchError('Failed to load note');
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchNote();
    return () => controller.abort();
  }, [user, id, router]);

  const handleAddTag = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && tagInput.trim()) {
        e.preventDefault();
        const trimmed = tagInput.trim();
        setTags((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
        setTagInput("");
      }
    },
    [tagInput]
  );

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const updateDsa = useCallback((fields: Partial<DSAData>) => {
    setDsa((prev) => ({ ...prev, ...fields }));
  }, []);

  const handleSave = useCallback(async () => {
    const s = stateRef.current;
    if (!s.title.trim()) return alert("Title is required");
    if (!s.user) return;
    setIsSaving(true);
    try {
      const noteData: Record<string, unknown> = {
        title: s.title,
        isFavorite: s.isFavorite,
        tags: s.tags,
        topicId: s.topicId,
        sequence: s.sequence,
      };

      if (s.type === 'general') noteData.content = s.content;
      if (s.type === 'dsa') noteData.dsa = s.dsa;
      if (s.type === 'qa') noteData.qa = s.qa;

      const response = await fetch(`/api/notes/${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData),
      });

      if (response.ok) {
        router.push(`/dashboard/notes/${s.id}`);
      } else {
        const error = await response.json();
        let errorMessage = `Failed to save note: ${error.error}`;
        if (error.details && Array.isArray(error.details)) {
          errorMessage += ` (${error.details.map((d: { message: string }) => d.message).join(', ')})`;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note.');
    } finally {
      setIsSaving(false);
    }
  }, [router]);

  if (loading || isInitialLoading) return null;

  if (fetchError) {
    return (
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-6 flex min-h-[60vh] flex-col items-center justify-center font-sans">
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
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-6 font-sans text-[#1A1D1E] dark:text-[#E4E6EB]">
      <div className="sticky top-0 z-30 -mx-5 lg:-mx-8 px-5 lg:px-8 bg-[#FFFFFF]/95 dark:bg-[#1A1A1A]/95 border-b border-[#E6E8EB] dark:border-[#2D2D2D] backdrop-blur-sm">
        <div className="py-3 flex items-center justify-between gap-4">
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

          <div className="flex items-center gap-2 shrink-0">
            <NoteTypeSelector type={type} onTypeChange={setType} isSaving={isSaving} />

            <button
              onClick={() => setIsFavorite((f) => !f)}
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

      <div className="py-8 space-y-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note"
          className="w-full bg-transparent text-3xl font-bold tracking-tight text-[#1A1D1E] dark:text-[#E4E6EB] placeholder:text-[#687076]/40 dark:placeholder:text-[#A0A0A0]/30 outline-none border-b border-[#E6E8EB] dark:border-[#2D2D2D] pb-3 transition-colors duration-100 focus:border-[#687076]/40 dark:focus:border-[#A0A0A0]/40"
        />

        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="w-full md:w-64 shrink-0 space-y-1.5">
            <InlineLabel>Topic</InlineLabel>
            <TopicSelector value={topicId} onChange={setTopicId} onCreate={handleCreateTopic} />
          </div>

          <div className="w-full md:w-48 shrink-0 space-y-1.5">
            <InlineLabel>Sequence</InlineLabel>
            <InputField
              type="number"
              min={0}
              value={sequence ?? ""}
              onChange={(e) => setSequence(e.target.value ? Number.parseInt(e.target.value, 10) : null)}
              disabled={!topicId}
              placeholder="Auto"
            />
            {!topicId && (
              <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-[#687076] dark:text-[#A0A0A0]">
                <Info className="h-3 w-3.5 shrink-0" />
                Select a topic first
              </p>
            )}
          </div>

          <div className="flex-1 space-y-1.5">
            <InlineLabel>Tags</InlineLabel>
            <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-[#E6E8EB] bg-[#FFFFFF] px-3 py-2 transition-colors duration-100 focus-within:border-[#687076]/40 dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:focus-within:border-[#A0A0A0]/40">
              <Tag className="h-3.5 w-3.5 text-[#687076]/40 dark:text-[#A0A0A0]/40 shrink-0" />
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-[#F4F7F6] dark:bg-[#111111] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#687076] dark:text-[#A0A0A0] rounded border border-[#E6E8EB] dark:border-[#2D2D2D]"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
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
