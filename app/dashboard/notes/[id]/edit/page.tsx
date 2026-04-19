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
import { DM_Sans, DM_Serif_Display } from 'next/font/google';

const dmSans = DM_Sans({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

const dmSerifDisplay = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-dm-serif',
});

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
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [dsa, setDsa] = useState<DSAData>({
    platform: '',
    difficulty: 'Medium',
    pattern: '',
    problemStatement: '',
    implementations: [{ language: 'Java', code: '' }],
    timeComplexity: '',
    spaceComplexity: '',
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

          if (note.type === 'general') setContent(note.content || '');
          if (note.type === 'dsa' && note.dsa) setDsa(note.dsa);
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
      implementations: [...dsa.implementations, { language: 'Java', code: '' }]
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
      const noteData: any = { title, isFavorite, tags };

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
      <div className={cn("mx-auto max-w-6xl", dmSans.variable, dmSerifDisplay.variable)}>
        <div className="mb-2 flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/notes/${id}`}
              className="flex h-8 w-8 items-center justify-center rounded-[7px] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl font-serif tracking-tight text-neutral-900 dark:text-neutral-100">
              Edit Note
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-[7px] transition-colors",
                isFavorite
                  ? "text-amber-400 bg-amber-50 dark:bg-amber-900/30"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200",
              )}
            >
              <Star className={cn("h-3.5 w-3.5", isFavorite && "fill-amber-400")} />
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 h-9 px-4 rounded-[7px] bg-neutral-900 text-white text-[12.5px] font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" /> Save
                </>
              )}
            </button>
          </div>
        </div>

        {/* Type Selector */}
        <div className="mb-6 flex items-center gap-2">
          {(['general', 'dsa', 'qa'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 h-8 rounded-[7px] text-[12px] font-medium transition-colors",
                type === t
                  ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200",
              )}
            >
              {t === 'dsa' && <Code2 className="h-3.5 w-3.5" />}
              {t === 'qa' && <BookOpen className="h-3.5 w-3.5" />}
              {t === 'general' && <FileText className="h-3.5 w-3.5" />}
              <span className="uppercase tracking-wide">
                {t === 'qa' ? 'Q&A' : t}
              </span>
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
          className="w-full h-10 rounded-[7px] border border-neutral-200 bg-white px-4 text-[13px] font-medium text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-300 transition-colors dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-600 dark:focus:bg-neutral-800"
        />

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 rounded-[7px] border border-neutral-200 bg-white px-4 py-2.5 dark:border-neutral-700 dark:bg-neutral-900">
          <Tag className="h-[13px] w-[13px] text-neutral-400 shrink-0 dark:text-neutral-500" />
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 bg-neutral-100 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-wider text-neutral-600 rounded-full dark:bg-neutral-800 dark:text-neutral-400"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-neutral-400 hover:text-red-400 transition-colors ml-0.5 dark:text-neutral-500"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tag and press Enter..."
            className="flex-1 min-w-[160px] h-7 text-[12.5px] outline-none placeholder:text-neutral-400 bg-transparent text-neutral-600 dark:placeholder:text-neutral-600 dark:text-neutral-100"
          />
        </div>
      </div>

      {/* Type-specific content */}
      <div className="space-y-5">
        {/* General */}
        {type === 'general' && (
          <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-700 dark:bg-neutral-900">
            <div className="border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
              <span className="text-[10.5px] font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Content · Markdown supported
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note in Markdown..."
              className="w-full min-h-[420px] p-5 text-[13px] text-neutral-600 placeholder:text-neutral-400 outline-none resize-none bg-transparent leading-6 dark:text-neutral-400 dark:placeholder:text-neutral-600"
            />
          </div>
        )}

        {/* DSA */}
        {type === 'dsa' && (
          <div className="space-y-5">
            {/* Meta row */}
            <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-700 dark:bg-neutral-900">
              <div className="border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
                <span className="text-[10.5px] font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Problem Info
                </span>
              </div>
              <div className="grid grid-cols-2 gap-5 p-5">
                <div>
                  <label className="block text-[10.5px] font-medium uppercase tracking-widest text-neutral-500 mb-2 dark:text-neutral-400">
                    Platform
                  </label>
                  <input
                    type="text"
                    value={dsa.platform}
                    onChange={(e) => setDsa({ ...dsa, platform: e.target.value })}
                    placeholder="LeetCode"
                    className="w-full h-9 rounded-[7px] border border-neutral-200 bg-neutral-50 px-3.5 text-[12.5px] outline-none focus:border-neutral-300 focus:bg-white transition-colors placeholder:text-neutral-400 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-neutral-600 dark:focus:bg-neutral-700 dark:placeholder:text-neutral-600 dark:text-neutral-200"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-medium uppercase tracking-widest text-neutral-500 mb-2 dark:text-neutral-400">
                    Difficulty
                  </label>
                  <select
                    value={dsa.difficulty}
                    onChange={(e) => setDsa({ ...dsa, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' })}
                    className="w-full h-9 rounded-[7px] border border-neutral-200 bg-neutral-50 px-3.5 text-[12.5px] outline-none focus:border-neutral-300 focus:bg-white transition-colors text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-neutral-600 dark:focus:bg-neutral-700 dark:text-neutral-200"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] font-medium uppercase tracking-widest text-neutral-500 mb-2 dark:text-neutral-400">
                    Pattern
                  </label>
                  <input
                    type="text"
                    value={dsa.pattern}
                    onChange={(e) => setDsa({ ...dsa, pattern: e.target.value })}
                    placeholder="Two Pointers, Sliding Window..."
                    className="w-full h-9 rounded-[7px] border border-neutral-200 bg-neutral-50 px-3.5 text-[12.5px] outline-none focus:border-neutral-300 focus:bg-white transition-colors placeholder:text-neutral-400 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-neutral-600 dark:focus:bg-neutral-700 dark:placeholder:text-neutral-600 dark:text-neutral-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-medium uppercase tracking-widest text-neutral-500 mb-2 dark:text-neutral-400">
                      Time
                    </label>
                    <input
                      type="text"
                      value={dsa.timeComplexity}
                      onChange={(e) => setDsa({ ...dsa, timeComplexity: e.target.value })}
                      placeholder="O(n)"
                      className="w-full h-9 rounded-[7px] border border-neutral-200 bg-neutral-50 px-3 text-[12.5px] font-mono outline-none focus:border-neutral-300 focus:bg-white transition-colors placeholder:text-neutral-400 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-neutral-600 dark:focus:bg-neutral-700 dark:placeholder:text-neutral-600 dark:text-neutral-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-medium uppercase tracking-widest text-neutral-500 mb-2 dark:text-neutral-400">
                      Space
                    </label>
                    <input
                      type="text"
                      value={dsa.spaceComplexity}
                      onChange={(e) => setDsa({ ...dsa, spaceComplexity: e.target.value })}
                      placeholder="O(1)"
                      className="w-full h-9 rounded-[7px] border border-neutral-200 bg-neutral-50 px-3 text-[12.5px] font-mono outline-none focus:border-neutral-300 focus:bg-white transition-colors placeholder:text-neutral-400 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-neutral-600 dark:focus:bg-neutral-700 dark:placeholder:text-neutral-600 dark:text-neutral-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-700 dark:bg-neutral-900">
              <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
                <span className="text-[10.5px] font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Problem Statement
                </span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-500 dark:bg-blue-900/30 dark:text-blue-400">
                  Markdown
                </span>
              </div>
              <textarea
                value={dsa.problemStatement}
                onChange={(e) => setDsa({ ...dsa, problemStatement: e.target.value })}
                placeholder="Describe the problem..."
                className="w-full min-h-[120px] p-5 text-[13px] text-neutral-600 placeholder:text-neutral-400 outline-none resize-none bg-transparent leading-6 dark:text-neutral-400 dark:placeholder:text-neutral-600"
              />
            </div>

            {/* Implementations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Implementations
                </span>
                <button
                  type="button"
                  onClick={handleAddImplementation}
                  className="flex items-center gap-1 h-7 px-3 rounded-[7px] border border-neutral-200 text-[12px] font-medium text-neutral-600 hover:bg-neutral-50 transition-colors dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  <Plus className="h-3 w-3" /> Add Language
                </button>
              </div>
              <div className="space-y-4">
                {dsa.implementations.map((impl, index) => (
                <div
                  key={index}
                  className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-700 dark:bg-neutral-800"
                >
                    <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2.5 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900">
                        <input
                          type="text"
                          value={impl.language}
                          onChange={(e) => {
                            const newImpls = [...dsa.implementations];
                            newImpls[index].language = e.target.value;
                            setDsa({ ...dsa, implementations: newImpls });
                          }}
                          placeholder="Language"
                          className="text-[12px] font-medium outline-none bg-transparent placeholder:text-neutral-600 text-neutral-400 w-32 dark:placeholder:text-neutral-600 dark:text-neutral-200"
                        />
                      {dsa.implementations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImplementation(index)}
                            className="text-neutral-600 hover:text-red-400 transition-colors dark:text-neutral-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-700 dark:bg-neutral-900">
              <div className="border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
                <span className="text-[10.5px] font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
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
              <label className="block text-[10.5px] font-medium uppercase tracking-widest text-neutral-500 mb-2 dark:text-neutral-400">
                Topic
              </label>
              <input
                type="text"
                value={qa.topic}
                onChange={(e) => setQa({ ...qa, topic: e.target.value })}
                placeholder="System Design, React, Node.js..."
                className="w-full h-9 rounded-[7px] border border-neutral-200 bg-white px-4 text-[12.5px] outline-none focus:border-neutral-300 transition-colors placeholder:text-neutral-400 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-600 dark:text-neutral-100 dark:placeholder:text-neutral-600"
              />
            </div>

            <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-700 dark:bg-neutral-900">
              <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
                <span className="text-[10.5px] font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Content
                </span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-500 dark:bg-amber-900/30 dark:text-amber-400">
                  Markdown
                </span>
              </div>
              <textarea
                value={qa.content}
                onChange={(e) => setQa({ ...qa, content: e.target.value })}
                placeholder="Write your Q&A in Markdown..."
                className="w-full min-h-[420px] p-5 text-[13px] text-neutral-600 placeholder:text-neutral-400 outline-none resize-none bg-transparent leading-6 dark:text-neutral-400 dark:placeholder:text-neutral-600"
              />
            </div>

            {/* Key Takeaways */}
            <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden dark:border-neutral-700 dark:bg-neutral-900">
              <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
                <span className="text-[10.5px] font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Key Takeaways
                </span>
                <button
                  type="button"
                  onClick={handleAddPoint}
                  className="flex items-center gap-1 h-7 px-3 rounded-[7px] border border-neutral-200 text-[12px] font-medium text-neutral-600 hover:bg-neutral-50 transition-colors dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  <Plus className="h-3 w-3" /> Add Point
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
                      className="flex-1 h-9 rounded-[7px] border border-neutral-200 bg-neutral-50 px-3 text-[12.5px] outline-none focus:border-neutral-300 focus:bg-white transition-colors placeholder:text-neutral-400 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-neutral-600 dark:focus:bg-neutral-700 dark:placeholder:text-neutral-600 dark:text-neutral-200"
                    />
                    {qa.importantPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePoint(index)}
                        className="flex-shrink-0 text-neutral-400 hover:text-red-400 transition-colors dark:text-neutral-500"
                      >
                        <X className="h-3.5 w-3.5" />
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
