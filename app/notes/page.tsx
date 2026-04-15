'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Note, NoteType } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Code2, 
  BookOpen, 
  FileText, 
  Star, 
  ArrowUpDown,
  MoreVertical,
  Trash2,
  Edit,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function NotesLibrary() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState<NoteType | 'all'>((searchParams.get('type') as any) || 'all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title'>('recent');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(searchParams.get('filter') === 'favorites');

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const notesRef = collection(db, 'notes');
    let q = query(notesRef, where('userId', '==', user.uid));

    if (typeFilter !== 'all') {
      q = query(q, where('type', '==', typeFilter));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let fetchedNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
      
      // Client-side filtering and sorting
      if (showFavoritesOnly) {
        fetchedNotes = fetchedNotes.filter(n => n.isFavorite);
      }

      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        fetchedNotes = fetchedNotes.filter(n => 
          n.title.toLowerCase().includes(lowerQuery) || 
          n.tags.some(t => t.toLowerCase().includes(lowerQuery))
        );
      }

      fetchedNotes.sort((a, b) => {
        if (sortBy === 'recent') return (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0);
        if (sortBy === 'oldest') return (a.updatedAt?.toMillis?.() || 0) - (b.updatedAt?.toMillis?.() || 0);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });

      setNotes(fetchedNotes);
      setIsDataLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notes');
      setIsDataLoading(false);
    });

    return () => unsubscribe();
  }, [user, typeFilter, sortBy, showFavoritesOnly, searchQuery]);

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-6xl">
            <header className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <h1 className="font-sans text-3xl font-bold text-neutral-900">Notes Library</h1>
                <p className="mt-1 text-neutral-500">Manage and organize your personal knowledge base.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input 
                    type="text" 
                    placeholder="Search title or tags..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-brand-border bg-brand-bg py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-primary focus:bg-white sm:w-64"
                  />
                </div>
              </div>
            </header>

            {/* Filters Bar */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-border bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="mr-2 h-4 w-4 text-brand-muted" />
                {(['all', 'dsa', 'qa', 'general'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={cn(
                      "rounded-lg px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-wider transition-all",
                      typeFilter === t 
                        ? "bg-brand-primary text-white" 
                        : "bg-neutral-50 text-brand-muted hover:bg-neutral-100"
                    )}
                  >
                    {t}
                  </button>
                ))}
                <div className="mx-2 h-6 w-px bg-brand-border" />
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-wider transition-all",
                    showFavoritesOnly 
                      ? "bg-amber-50 text-amber-600" 
                      : "bg-neutral-50 text-brand-muted hover:bg-neutral-100"
                  )}
                >
                  <Star className={cn("h-3.5 w-3.5", showFavoritesOnly && "fill-amber-600")} />
                  Favorites
                </button>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-brand-muted" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-sm font-bold text-brand-muted outline-none"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>

            {/* Notes Grid */}
            {isDataLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-64 animate-pulse rounded-3xl bg-white border border-neutral-200" />
                ))}
              </div>
            ) : notes.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {notes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <NoteCard note={note} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-white py-24 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-50">
                  <Search className="h-10 w-10 text-neutral-300" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">No notes found</h3>
                <p className="mt-2 max-w-[320px] text-neutral-500">Try adjusting your search or filters to find what you&apos;re looking for.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setTypeFilter('all'); setShowFavoritesOnly(false); }}
                  className="mt-8 text-sm font-bold text-brand-primary hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function NoteCard({ note }: { note: Note }) {
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'notes', note.id), {
        isFavorite: !note.isFavorite,
        updatedAt: new Date()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notes/${note.id}`);
    }
  };

  return (
    <div className="group relative flex h-full flex-col rounded-xl border border-brand-border bg-white p-6 transition-all hover:border-brand-primary hover:shadow-lg">
      <div className="mb-4 flex items-start justify-between">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          note.type === 'dsa' ? "bg-blue-50 text-brand-primary" :
          note.type === 'qa' ? "bg-amber-50 text-amber-600" :
          "bg-neutral-50 text-brand-muted"
        )}>
          {note.type === 'dsa' ? <Code2 className="h-5 w-5" /> :
           note.type === 'qa' ? <BookOpen className="h-5 w-5" /> :
           <FileText className="h-5 w-5" />}
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={toggleFavorite}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              note.isFavorite ? "text-amber-500 bg-amber-50" : "text-brand-muted hover:bg-neutral-100 hover:text-brand-text"
            )}
          >
            <Star className={cn("h-4 w-4", note.isFavorite && "fill-amber-500")} />
          </button>
          <div className="relative">
            <button className="rounded-lg p-1 text-brand-muted transition-colors hover:bg-neutral-100 hover:text-brand-text">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Link href={`/notes/${note.id}`} className="flex-1">
        <h3 className="mb-2 line-clamp-2 font-sans text-[1.1rem] font-bold leading-tight text-brand-text transition-colors group-hover:text-brand-primary">
          {note.title}
        </h3>
        
        {note.type === 'dsa' && note.dsa && (
          <div className="mb-4 flex flex-wrap gap-2">
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider",
              note.dsa.difficulty === 'Easy' ? "bg-[#DCFCE7] text-[#166534]" :
              note.dsa.difficulty === 'Medium' ? "bg-[#FEF3C7] text-[#92400E]" :
              "bg-[#FEE2E2] text-[#991B1B]"
            )}>
              {note.dsa.difficulty}
            </span>
            <span className="rounded-full bg-[#E0E7FF] px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-[#3730A3]">
              {note.dsa.platform}
            </span>
          </div>
        )}

        {note.type === 'qa' && note.qa && (
          <p className="mb-4 line-clamp-2 text-sm text-brand-muted italic">
            &quot;{note.qa.question}&quot;
          </p>
        )}

        {note.type === 'general' && note.content && (
          <p className="mb-4 line-clamp-3 text-sm text-brand-muted">
            {note.content.replace(/[#*`]/g, '')}
          </p>
        )}
      </Link>

      <div className="mt-auto pt-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {note.tags.slice(0, 3).map(tag => (
            <span key={tag} className="rounded-md bg-neutral-50 px-2 py-0.5 text-[0.7rem] font-medium text-brand-muted">
              #{tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-[0.7rem] font-medium text-brand-muted">+{note.tags.length - 3} more</span>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-brand-border pt-3 text-[0.7rem] font-bold uppercase tracking-widest text-brand-muted">
          <span>{note.updatedAt?.toDate ? formatDistanceToNow(note.updatedAt.toDate(), { addSuffix: true }) : 'Recently'}</span>
          <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Link href={`/notes/${note.id}/edit`} className="hover:text-brand-primary">
              <Edit className="h-3.5 w-3.5" />
            </Link>
            <Link href={`/notes/${note.id}`} className="hover:text-brand-primary">
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
