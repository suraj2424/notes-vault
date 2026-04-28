'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Note, NoteType, DSAData, QAData } from '@/types';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  ChevronLeft,
  Code2,
  BookOpen,
  FileText,
  Star,
  Tag,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { CodeEditor } from '@/components/CodeEditor';
import { TopicSelector } from '@/app/dashboard/topics/TopicSelector';

export default function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [type, setType] = useState<NoteType>('general');
  const [title, setTitle] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');
  const [topicId, setTopicId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

   const [dsa, setDsa] = useState<DSAData>({
     platform: '',
     difficulty: 'Medium',
     pattern: '',
     problemStatement: '',
     implementations: [{ language: 'Java', code: '', timeComplexity: '', spaceComplexity: '' }],
     notes: ''
   });

  const [qa, setQa] = useState<QAData>({
    topic: '',
    content: '',
    importantPoints: ['']
  });

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;

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

           if (note.type === 'general') setContent(note.content || '');
           if (note.type === 'dsa' && note.dsa) {
             // Normalize old DSA data to include per-implementation complexity fields
             const normalizedDsa = {
               ...note.dsa,
               implementations: (note.dsa.implementations || []).map((impl: any) => ({
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
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching note:', error);
        router.push('/dashboard');
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchNote();
  }, [user, id, router]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddImplementation = () => {
    setDsa({
      ...dsa,
      implementations: [...dsa.implementations, { language: 'Java', code: '', timeComplexity: '', spaceComplexity: '' }]
    });
  };

  const handleRemoveImplementation = (index: number) => {
    const newImpls = [...dsa.implementations];
    newImpls.splice(index, 1);
    setDsa({ ...dsa, implementations: newImpls });
  };

  const handleAddPoint = () => {
    setQa({ ...qa, importantPoints: [...qa.importantPoints, ''] });
  };

  const handleRemovePoint = (index: number) => {
    const newPoints = [...qa.importantPoints];
    newPoints.splice(index, 1);
    setQa({ ...qa, importantPoints: newPoints });
  };

  const handleSave = async () => {
    if (!title.trim()) return alert('Title is required');
    if (!user) return;

    setIsSaving(true);
    try {
      const noteData: any = { title, isFavorite, tags, topicId };

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
        alert(`Failed to save note: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note.');
    } finally {
      setIsSaving(false);
    }
  };

if (loading || isInitialLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-800 dark:border-t-neutral-400" />
        </div>
      );
    }

return (
      <div className="mx-auto max-w-5xl pb-20 font-sans">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/notes/${id}`}
              className="group flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white transition-all hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              <ChevronLeft className="h-4 w-4 text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100" />
            </Link>
            <h1 className="text-2xl font-serif tracking-tight text-neutral-900 dark:text-neutral-100">
              Edit Note
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-xl border transition-all",
                isFavorite
                  ? "bg-amber-50 border-amber-200 text-amber-500 dark:bg-amber-500/10 dark:border-amber-500/20"
                  : "bg-white border-neutral-200 text-neutral-400 hover:text-neutral-600 dark:bg-neutral-900 dark:border-neutral-800",
              )}
            >
              <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 h-9 px-5 rounded-xl bg-neutral-900 text-white text-[12px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Save
                </>
              )}
            </button>
          </div>
        </div>

        {/* Type Selector */}
        <div className="mb-8 flex p-1.5 w-fit rounded-2xl bg-neutral-100/50 border border-neutral-200/50 dark:bg-neutral-900/50 dark:border-neutral-800">
          {(['general', 'dsa', 'qa'] as const).map((t) => (
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
                  : "bg-transparent text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-900/40 dark:hover:text-neutral-300",
              )}
            >
              {t === 'dsa' && <Code2 className="h-3.5 w-3.5" />}
              {t === 'qa' && <BookOpen className="h-3.5 w-3.5" />}
              {t === 'general' && <FileText className="h-3.5 w-3.5" />}
              {t === 'qa' ? 'Q&A' : t}
            </button>
          ))}
        </div>

      {/* Title + Tags grouped */}
      <div className="mb-6 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="h-12 w-full rounded-xl border px-4 text-base font-semibold outline-none transition-all border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-700 dark:focus:bg-neutral-950 dark:focus:ring-neutral-900/50"
        />

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <label className="mb-2 block text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
            Topic
          </label>
          <TopicSelector value={topicId} onChange={setTopicId} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
          <Tag className="h-3.5 w-3.5 text-neutral-400 mr-2" />
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-600 rounded-lg dark:bg-neutral-800 dark:text-neutral-400"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-neutral-400 hover:text-red-500 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tag..."
            className="flex-1 min-w-[120px] bg-transparent outline-none text-[13px] placeholder:text-neutral-400 dark:text-neutral-100"
          />
        </div>
      </div>

      {/* Type-specific content */}
      <div className="space-y-5">
        {/* General */}
        {type === 'general' && (
          <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
              <span className="text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                Content
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[9px] font-bold text-neutral-500 uppercase dark:bg-neutral-800 dark:text-neutral-400">
                Markdown
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note..."
              className="w-full min-h-[400px] p-6 text-[14px] text-neutral-700 bg-transparent outline-none resize-none leading-relaxed dark:text-neutral-300 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
            />
          </div>
        )}

        {/* DSA */}
        {type === 'dsa' && (
          <div className="space-y-5">
            {/* Meta row */}
            <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-800 dark:bg-neutral-900/50">
              <div className="border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
                <span className="text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                  Problem Info
                </span>
              </div>
              <div className="grid grid-cols-2 gap-5 p-5">
                <div>
                  <label className="block text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 mb-2 dark:text-neutral-400">
                    Platform
                  </label>
                  <input
                    type="text"
                    value={dsa.platform}
                    onChange={(e) => setDsa({ ...dsa, platform: e.target.value })}
                    placeholder="LeetCode"
                    className="h-10 w-full rounded-xl border px-4 text-[13px] font-medium outline-none transition-all border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-700 dark:focus:bg-neutral-950 dark:focus:ring-neutral-900/50"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 mb-2 dark:text-neutral-400">
                    Difficulty
                  </label>
                  <select
                    value={dsa.difficulty}
                    onChange={(e) => setDsa({ ...dsa, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' })}
                    className="h-10 w-full rounded-xl border px-4 text-[13px] font-medium outline-none transition-all border-neutral-200 bg-neutral-50 text-neutral-900 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-700 dark:focus:bg-neutral-950 dark:focus:ring-neutral-900/50"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 mb-2 dark:text-neutral-400">
                    Pattern
                  </label>
                  <input
                    type="text"
                    value={dsa.pattern}
                    onChange={(e) => setDsa({ ...dsa, pattern: e.target.value })}
                    placeholder="Two Pointers, Sliding Window..."
                    className="h-10 w-full rounded-xl border px-4 text-[13px] font-medium outline-none transition-all border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-700 dark:focus:bg-neutral-950 dark:focus:ring-neutral-900/50"
                  />
                </div>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-800 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
                <span className="text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                  Problem Statement
                </span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[9px] font-bold text-neutral-500 uppercase dark:bg-neutral-800 dark:text-neutral-400">
                  Markdown
                </span>
              </div>
              <textarea
                value={dsa.problemStatement}
                onChange={(e) => setDsa({ ...dsa, problemStatement: e.target.value })}
                placeholder="Describe the problem..."
                className="w-full min-h-[150px] p-5 text-[13.5px] bg-transparent outline-none resize-none dark:text-neutral-300 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
              />
            </div>

            {/* Implementations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                  Implementations
                </span>
                <button
                  type="button"
                  onClick={handleAddImplementation}
                  className="flex items-center gap-2 h-9 px-4 rounded-xl border border-neutral-200 bg-white text-[12px] font-black uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 transition-all dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  <Plus className="h-4 w-4" /> Add Language
                </button>
              </div>
              <div className="space-y-4">
                {dsa.implementations.map((impl, index) => (
                  <div
                    key={index}
                    className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-800 dark:bg-neutral-900/50"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                      <select
                        value={impl.language}
                        onChange={(e) => {
                          const newImpls = [...dsa.implementations];
                          newImpls[index].language = e.target.value;
                          setDsa({ ...dsa, implementations: newImpls });
                        }}
                        className="text-[12px] font-black uppercase tracking-wider outline-none bg-transparent text-neutral-600 w-40 dark:text-neutral-200"
                      >
                        <option value="Java">Java</option>
                        <option value="Python">Python</option>
                        <option value="C++">C++</option>
                        <option value="JavaScript">JavaScript</option>
                      </select>
                      {dsa.implementations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImplementation(index)}
                          className="text-neutral-500 hover:text-red-500 transition-colors dark:text-neutral-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <CodeEditor
                      language={impl.language}
                      value={impl.code}
                      onChange={(code) => {
                        const newImpls = [...dsa.implementations];
                        newImpls[index].code = code;
                        setDsa({ ...dsa, implementations: newImpls });
                      }}
                    />
                    <div className="grid grid-cols-2 gap-4 p-5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                      <div>
                        <label className="block text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 mb-2 dark:text-neutral-400">
                          Time
                        </label>
                        <input
                          type="text"
                          value={impl.timeComplexity}
                          onChange={(e) => {
                            const newImpls = [...dsa.implementations];
                            newImpls[index].timeComplexity = e.target.value;
                            setDsa({ ...dsa, implementations: newImpls });
                          }}
                          placeholder="O(n)"
                          className="h-10 w-full rounded-xl border px-4 text-[13px] font-mono outline-none transition-all border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-700 dark:focus:bg-neutral-950 dark:focus:ring-neutral-900/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 mb-2 dark:text-neutral-400">
                          Space
                        </label>
                        <input
                          type="text"
                          value={impl.spaceComplexity}
                          onChange={(e) => {
                            const newImpls = [...dsa.implementations];
                            newImpls[index].spaceComplexity = e.target.value;
                            setDsa({ ...dsa, implementations: newImpls });
                          }}
                          placeholder="O(1)"
                          className="h-10 w-full rounded-xl border px-4 text-[13px] font-mono outline-none transition-all border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-700 dark:focus:bg-neutral-950 dark:focus:ring-neutral-900/50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-800 dark:bg-neutral-900/50">
              <div className="border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
                <span className="text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                  Notes
                </span>
              </div>
              <textarea
                value={dsa.notes}
                onChange={(e) => setDsa({ ...dsa, notes: e.target.value })}
                placeholder="Additional notes, hints, edge cases..."
                className="w-full min-h-[120px] p-5 text-[13px] text-neutral-600 placeholder:text-neutral-400 outline-none resize-none bg-transparent leading-6 dark:text-neutral-400 dark:placeholder:text-neutral-600"
              />
            </div>
          </div>
        )}

        {/* Q&A */}
        {type === 'qa' && (
          <div className="space-y-5">
            <div>
              <label className="block text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 mb-2 dark:text-neutral-400">
                Topic
              </label>
              <input
                type="text"
                value={qa.topic}
                onChange={(e) => setQa({ ...qa, topic: e.target.value })}
                placeholder="System Design, React, Node.js..."
                className="h-10 w-full rounded-xl border px-4 text-[13px] font-medium outline-none transition-all border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-700 dark:focus:bg-neutral-950 dark:focus:ring-neutral-900/50"
              />
            </div>

            <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-800 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
                <span className="text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                  Content
                </span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[9px] font-bold text-neutral-500 uppercase dark:bg-neutral-800 dark:text-neutral-400">
                  Markdown
                </span>
              </div>
              <textarea
                value={qa.content}
                onChange={(e) => setQa({ ...qa, content: e.target.value })}
                placeholder="Write your Q&A..."
                className="w-full min-h-[300px] p-6 text-[14px] bg-transparent outline-none resize-none dark:text-neutral-300 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
              />
            </div>

            {/* Key Takeaways */}
            <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-800 dark:bg-neutral-900/50">
              <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
                <span className="text-[10.5px] font-black uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                  Key Takeaways
                </span>
                <button
                  type="button"
                  onClick={handleAddPoint}
                  className="flex items-center gap-2 h-9 px-4 rounded-xl border border-neutral-200 bg-white text-[12px] font-black uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 transition-all dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  <Plus className="h-4 w-4" /> Add Point
                </button>
              </div>
              <div className="p-4 space-y-2.5">
                {qa.importantPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 flex-shrink-0 dark:bg-neutral-600" />
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => {
                        const newPoints = [...qa.importantPoints];
                        newPoints[index] = e.target.value;
                        setQa({ ...qa, importantPoints: newPoints });
                      }}
                      placeholder="Important point..."
                      className="flex-1 h-10 rounded-xl border px-4 text-[13px] font-medium outline-none transition-all border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-700 dark:focus:bg-neutral-950 dark:focus:ring-neutral-900/50"
                    />
                    {qa.importantPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePoint(index)}
                        className="flex-shrink-0 text-neutral-400 hover:text-red-500 transition-colors dark:text-neutral-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
