'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { NoteType, DSAData, QAData } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  ChevronLeft,
  Code2,
  BookOpen,
  FileText,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NewNotePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as NoteType) || 'general';
  
  const [type, setType] = useState<NoteType>(initialType);
  const [title, setTitle] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // DSA Specific State
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

  // QA Specific State
  const [qa, setQa] = useState<QAData>({
    topic: '',
    question: '',
    answer: '',
    importantPoints: ['']
  });

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

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
      const noteData: any = {
        userId: user.uid,
        type,
        title,
        isFavorite,
        tags,
        updatedAt: serverTimestamp(),
      };

      if (type === 'general') noteData.content = content;
      if (type === 'dsa') noteData.dsa = dsa;
      if (type === 'qa') noteData.qa = qa;

      noteData.createdAt = serverTimestamp();
      await addDoc(collection(db, 'notes'), noteData);

      router.push('/dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notes');
      alert('Failed to save note. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-4xl">
            <button 
              onClick={() => router.back()}
              className="mb-6 flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl shadow-neutral-200/50 sm:p-12">
              <header className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
                    type === 'dsa' ? "bg-blue-50 text-blue-600" :
                    type === 'qa' ? "bg-amber-50 text-amber-600" :
                    "bg-neutral-50 text-neutral-600"
                  )}>
                    {type === 'dsa' ? <Code2 className="h-8 w-8" /> :
                     type === 'qa' ? <BookOpen className="h-8 w-8" /> :
                     <FileText className="h-8 w-8" />}
                  </div>
                  <div>
                    <h1 className="font-sans text-3xl font-bold text-neutral-900">
                      New Note
                    </h1>
                    <div className="mt-1 flex gap-2">
                      {(['dsa', 'qa', 'general'] as NoteType[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setType(t)}
                          className={cn(
                            "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                            type === t 
                              ? "bg-brand-primary text-white" 
                              : "bg-neutral-100 text-brand-muted hover:bg-neutral-200"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl border transition-all",
                      isFavorite 
                        ? "border-amber-200 bg-amber-50 text-amber-500" 
                        : "border-neutral-200 bg-white text-neutral-400 hover:border-neutral-300"
                    )}
                  >
                    <Star className={cn("h-6 w-6", isFavorite && "fill-amber-500")} />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-xl bg-brand-primary px-8 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-5 w-5" />}
                    Save Note
                  </button>
                </div>
              </header>

              <div className="space-y-8">
                {/* Title Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Note Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Two Sum - Array Hashing"
                    className="w-full border-b-2 border-neutral-100 py-3 text-2xl font-bold text-brand-text outline-none transition-all placeholder:text-neutral-200 focus:border-brand-primary"
                  />
                </div>

                {/* Tags Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="text-neutral-400 hover:text-neutral-600">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Add tag and press Enter..."
                      className="min-w-[200px] bg-transparent py-1.5 text-sm outline-none"
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {type === 'dsa' && (
                    <motion.div
                      key="dsa-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8 pt-4"
                    >
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <FormGroup label="Platform">
                          <input 
                            type="text" 
                            value={dsa.platform} 
                            onChange={e => setDsa({...dsa, platform: e.target.value})}
                            placeholder="LeetCode" 
                            className="form-input" 
                          />
                        </FormGroup>
                        <FormGroup label="Difficulty">
                          <select 
                            value={dsa.difficulty} 
                            onChange={e => setDsa({...dsa, difficulty: e.target.value as any})}
                            className="form-input"
                          >
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                          </select>
                        </FormGroup>
                        <FormGroup label="Pattern">
                          <input 
                            type="text" 
                            value={dsa.pattern} 
                            onChange={e => setDsa({...dsa, pattern: e.target.value})}
                            placeholder="Two Pointers" 
                            className="form-input" 
                          />
                        </FormGroup>
                      </div>

                      <FormGroup label="Problem Statement Summary">
                        <textarea 
                          value={dsa.problemStatement} 
                          onChange={e => setDsa({...dsa, problemStatement: e.target.value})}
                          rows={3} 
                          className="form-input" 
                          placeholder="Briefly describe the problem..."
                        />
                      </FormGroup>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Implementations</label>
                          <button 
                            onClick={handleAddImplementation}
                            className="flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-blue-700"
                          >
                            <Plus className="h-3 w-3" /> Add Language
                          </button>
                        </div>
                        {dsa.implementations.map((impl, idx) => (
                          <div key={idx} className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <select 
                                value={impl.language}
                                onChange={e => {
                                  const newImpls = [...dsa.implementations];
                                  newImpls[idx].language = e.target.value;
                                  setDsa({...dsa, implementations: newImpls});
                                }}
                                className="rounded-lg border border-neutral-200 bg-white px-3 py-1 text-xs font-bold outline-none"
                              >
                                <option>Java</option>
                                <option>C++</option>
                                <option>Python</option>
                                <option>JavaScript</option>
                                <option>TypeScript</option>
                                <option>Go</option>
                              </select>
                              {dsa.implementations.length > 1 && (
                                <button onClick={() => handleRemoveImplementation(idx)} className="text-neutral-400 hover:text-rose-500">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <textarea
                              value={impl.code}
                              onChange={e => {
                                const newImpls = [...dsa.implementations];
                                newImpls[idx].code = e.target.value;
                                setDsa({...dsa, implementations: newImpls});
                              }}
                              rows={8}
                              placeholder="Paste your code here..."
                              className="w-full rounded-xl border border-neutral-200 bg-white p-4 font-mono text-sm outline-none focus:border-brand-primary"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <FormGroup label="Time Complexity">
                          <input 
                            type="text" 
                            value={dsa.timeComplexity} 
                            onChange={e => setDsa({...dsa, timeComplexity: e.target.value})}
                            placeholder="O(n log n)" 
                            className="form-input" 
                          />
                        </FormGroup>
                        <FormGroup label="Space Complexity">
                          <input 
                            type="text" 
                            value={dsa.spaceComplexity} 
                            onChange={e => setDsa({...dsa, spaceComplexity: e.target.value})}
                            placeholder="O(1)" 
                            className="form-input" 
                          />
                        </FormGroup>
                      </div>

                      <FormGroup label="Additional Notes">
                        <textarea 
                          value={dsa.notes} 
                          onChange={e => setDsa({...dsa, notes: e.target.value})}
                          rows={4} 
                          className="form-input" 
                          placeholder="Key takeaways, edge cases, etc."
                        />
                      </FormGroup>
                    </motion.div>
                  )}

                  {type === 'qa' && (
                    <motion.div
                      key="qa-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8 pt-4"
                    >
                      <FormGroup label="Topic">
                        <input 
                          type="text" 
                          value={qa.topic} 
                          onChange={e => setQa({...qa, topic: e.target.value})}
                          placeholder="e.g. Operating Systems, React Hooks" 
                          className="form-input" 
                        />
                      </FormGroup>
                      <FormGroup label="Question">
                        <textarea 
                          value={qa.question} 
                          onChange={e => setQa({...qa, question: e.target.value})}
                          rows={2} 
                          className="form-input" 
                          placeholder="What is the difference between..."
                        />
                      </FormGroup>
                      <FormGroup label="Answer">
                        <textarea 
                          value={qa.answer} 
                          onChange={e => setQa({...qa, answer: e.target.value})}
                          rows={6} 
                          className="form-input" 
                          placeholder="Detailed explanation..."
                        />
                      </FormGroup>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Important Points</label>
                          <button 
                            onClick={handleAddPoint}
                            className="flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-blue-700"
                          >
                            <Plus className="h-3 w-3" /> Add Point
                          </button>
                        </div>
                        {qa.importantPoints.map((point, idx) => (
                          <div key={idx} className="flex gap-3">
                            <input
                              type="text"
                              value={point}
                              onChange={e => {
                                const newPoints = [...qa.importantPoints];
                                newPoints[idx] = e.target.value;
                                setQa({...qa, importantPoints: newPoints});
                              }}
                              placeholder="Key takeaway..."
                              className="form-input flex-1"
                            />
                            {qa.importantPoints.length > 1 && (
                              <button onClick={() => handleRemovePoint(idx)} className="text-neutral-400 hover:text-rose-500">
                                <Trash2 className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {type === 'general' && (
                    <motion.div
                      key="general-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 pt-4"
                    >
                      <FormGroup label="Content (Markdown Supported)">
                        <textarea 
                          value={content} 
                          onChange={e => setContent(e.target.value)}
                          rows={20} 
                          className="form-input font-mono text-sm leading-relaxed" 
                          placeholder="# Your notes here..."
                        />
                      </FormGroup>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .form-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid #f0f0f0;
          background-color: #fafafa;
          padding: 12px 16px;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }
        .form-input:focus {
          border-color: #2563eb;
          background-color: #fff;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }
      `}</style>
    </div>
  );
}

function FormGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">{label}</label>
      {children}
    </div>
  );
}
