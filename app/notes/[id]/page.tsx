'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Note } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Edit, 
  Trash2, 
  Star, 
  Clock, 
  Tag,
  Code2,
  BookOpen,
  FileText,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !unwrappedParams.id) return;

    const fetchNote = async () => {
      try {
        const docRef = doc(db, 'notes', unwrappedParams.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as Note;
          if (data.userId !== user.uid) {
            router.push('/dashboard');
            return;
          }
          setNote({ id: docSnap.id, ...data });
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `notes/${unwrappedParams.id}`);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchNote();
  }, [user, unwrappedParams.id, router]);

  const toggleFavorite = async () => {
    if (!note) return;
    try {
      const newFavoriteStatus = !note.isFavorite;
      await updateDoc(doc(db, 'notes', note.id), {
        isFavorite: newFavoriteStatus,
        updatedAt: new Date()
      });
      setNote({ ...note, isFavorite: newFavoriteStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notes/${note.id}`);
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    try {
      await deleteDoc(doc(db, 'notes', note.id));
      router.push('/notes');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notes/${note.id}`);
      alert('Failed to delete note.');
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (loading || isDataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  if (!note) return null;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex items-center justify-between">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-900"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Library
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleFavorite}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border transition-all",
                    note.isFavorite 
                      ? "border-amber-200 bg-amber-50 text-amber-500" 
                      : "border-neutral-200 bg-white text-neutral-400 hover:border-neutral-300"
                  )}
                  title={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star className={cn("h-5 w-5", note.isFavorite && "fill-amber-500")} />
                </button>
                <Link 
                  href={`/notes/${note.id}/edit`}
                  className="flex items-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-2 text-sm font-bold text-brand-muted transition-all hover:border-brand-primary hover:text-brand-primary"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 rounded-xl border border-rose-100 bg-white px-4 py-2 text-sm font-bold text-rose-500 transition-all hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>

            <article className="rounded-[2.5rem] border border-neutral-200 bg-white p-8 shadow-2xl shadow-neutral-200/50 sm:p-16">
              <header className="mb-12">
                <div className="mb-6 flex items-center gap-4">
                  <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl",
                    note.type === 'dsa' ? "bg-blue-50 text-brand-primary" :
                    note.type === 'qa' ? "bg-amber-50 text-amber-600" :
                    "bg-neutral-50 text-brand-muted"
                  )}>
                    {note.type === 'dsa' ? <Code2 className="h-8 w-8" /> :
                     note.type === 'qa' ? <BookOpen className="h-8 w-8" /> :
                     <FileText className="h-8 w-8" />}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map(tag => (
                      <span key={tag} className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <h1 className="font-sans text-4xl font-bold leading-tight text-brand-text sm:text-5xl">
                  {note.title}
                </h1>

                <div className="mt-8 flex flex-wrap items-center gap-6 border-y border-brand-border py-6 text-sm font-medium text-brand-muted">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Created {note.createdAt?.toDate ? format(note.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span className="capitalize">{note.type} Note</span>
                  </div>
                  {note.isFavorite && (
                    <div className="flex items-center gap-2 text-amber-500">
                      <Star className="h-4 w-4 fill-amber-500" />
                      <span>Favorite</span>
                    </div>
                  )}
                </div>
              </header>

              {/* Note Content Rendering */}
              <div className="space-y-12">
                {note.type === 'dsa' && note.dsa && (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                      <DetailItem label="Platform" value={note.dsa.platform} />
                      <DetailItem label="Difficulty" value={note.dsa.difficulty} highlight={note.dsa.difficulty} />
                      <DetailItem label="Pattern" value={note.dsa.pattern} />
                    </div>

                    <section className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Problem Summary</h3>
                      <div className="rounded-2xl bg-neutral-50 p-6 text-neutral-700 leading-relaxed">
                        {note.dsa.problemStatement}
                      </div>
                    </section>

                    <section className="space-y-6">
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Implementations</h3>
                      {note.dsa.implementations.map((impl, idx) => (
                        <div key={idx} className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900 shadow-lg">
                          <div className="flex items-center justify-between bg-neutral-800 px-6 py-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">{impl.language}</span>
                            <button 
                              onClick={() => copyToClipboard(impl.code, idx)}
                              className="flex items-center gap-2 text-xs font-bold text-neutral-400 transition-colors hover:text-white"
                            >
                              {copiedIndex === idx ? <Check className="h-3 w-3 text-brand-primary" /> : <Copy className="h-3 w-3" />}
                              {copiedIndex === idx ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <pre className="overflow-x-auto p-6 font-mono text-sm leading-relaxed text-blue-400">
                            <code>{impl.code}</code>
                          </pre>
                        </div>
                      ))}
                    </section>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                      <DetailItem label="Time Complexity" value={note.dsa.timeComplexity} isMono />
                      <DetailItem label="Space Complexity" value={note.dsa.spaceComplexity} isMono />
                    </div>

                    {note.dsa.notes && (
                      <section className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Takeaways & Notes</h3>
                        <div className="prose prose-neutral max-w-none rounded-2xl border border-neutral-100 p-8 text-neutral-700 leading-relaxed">
                          <ReactMarkdown>{note.dsa.notes}</ReactMarkdown>
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {note.type === 'qa' && note.qa && (
                  <div className="space-y-12">
                    <DetailItem label="Topic" value={note.qa.topic} />
                    
                    <section className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Question</h3>
                      <p className="font-sans text-2xl font-bold text-neutral-900">{note.qa.question}</p>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Answer</h3>
                      <div className="prose prose-neutral max-w-none rounded-2xl bg-neutral-50 p-8 text-lg leading-relaxed text-neutral-700">
                        <ReactMarkdown>{note.qa.answer}</ReactMarkdown>
                      </div>
                    </section>

                    {note.qa.importantPoints.length > 0 && (
                      <section className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">Important Points</h3>
                        <ul className="space-y-3">
                          {note.qa.importantPoints.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-3 rounded-xl border border-brand-border p-4 transition-colors hover:border-brand-primary hover:bg-blue-50/30">
                              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />
                              <span className="text-brand-text font-medium">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                  </div>
                )}

                {note.type === 'general' && note.content && (
                  <div className="prose prose-neutral max-w-none prose-headings:font-sans prose-headings:font-bold prose-pre:bg-neutral-900 prose-pre:text-blue-400">
                    <ReactMarkdown>{note.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </article>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="mb-2 font-sans text-2xl font-bold text-neutral-900">Delete Note?</h3>
              <p className="mb-8 text-neutral-500">This action cannot be undone. This note will be permanently removed from your second brain.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-xl border border-neutral-200 py-3 font-bold text-neutral-600 transition-colors hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 rounded-xl bg-rose-500 py-3 font-bold text-white shadow-lg shadow-rose-500/20 transition-colors hover:bg-rose-600"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ label, value, highlight, isMono }: { label: string, value: string, highlight?: string, isMono?: boolean }) {
  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">{label}</h4>
      <p className={cn(
        "text-lg font-bold text-brand-text",
        isMono && "font-mono text-brand-primary",
        highlight === 'Easy' && "text-[#166534]",
        highlight === 'Medium' && "text-[#92400E]",
        highlight === 'Hard' && "text-[#991B1B]"
      )}>
        {value || 'N/A'}
      </p>
    </div>
  );
}
