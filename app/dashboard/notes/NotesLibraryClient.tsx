'use client';

import { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'] });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400' });

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title', label: 'Title A-Z' },
] as const;

interface User {
  name: string;
  email: string;
}

interface NotesLibraryClientProps {
  user: User | null;
  initialNotes: Note[];
  totalPages: number;
  currentPage: number;
}

function NoteCard({ note }: { note: Note }) {
  const [isFavorite, setIsFavorite] = useState(note.isFavorite);
  const prevFavoriteRef = useRef(note.isFavorite);

  useEffect(() => {
    setIsFavorite(note.isFavorite);
    prevFavoriteRef.current = note.isFavorite;
  }, [note.isFavorite]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const previousState = prevFavoriteRef.current;
    const newState = !previousState;

    // Optimistic update
    setIsFavorite(newState);
    prevFavoriteRef.current = newState;

    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: newState }),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Rollback on failure
      setIsFavorite(previousState);
      prevFavoriteRef.current = previousState;
    }
  };

  return (
    <div className="group relative flex h-full flex-col rounded-[10px] border border-slate-200 bg-white transition-colors hover:border-slate-300 dark:border-[#2a2a2a] dark:bg-[#161616] dark:hover:border-[#3a3a3a]">
      <div className="flex flex-col h-full p-5">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[7px] border border-slate-200 dark:border-[#2a2a2a]",
            note.type === 'dsa' ? "bg-blue-50 text-blue-500 dark:bg-blue-950 dark:text-blue-400" :
            note.type === 'qa' ? "bg-amber-50 text-amber-500 dark:bg-amber-950 dark:text-amber-400" :
            "bg-slate-100 text-slate-400 dark:bg-[#1e1e1e] dark:text-[#888888]"
          )}>
            {note.type === 'dsa' ? <Code2 className="h-4 w-4" /> :
             note.type === 'qa' ? <BookOpen className="h-4 w-4" /> :
             <FileText className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/dashboard/notes/${note.id}`}>
              <h3 className="text-[13px] font-medium leading-snug text-slate-900 transition-colors group-hover:text-slate-600 dark:text-[#ededed] dark:group-hover:text-[#888888]">
                {note.title}
              </h3>
            </Link>
          </div>
        </div>

        {note.type === 'dsa' && note.dsa && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider",
              note.dsa.difficulty === 'Easy' ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400" :
              note.dsa.difficulty === 'Medium' ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400" :
              "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
            )}>
              {note.dsa.difficulty}
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider text-blue-500 dark:bg-blue-950 dark:text-blue-400">
              {note.dsa.platform}
            </span>
          </div>
        )}

        {note.type === 'qa' && note.qa && note.qa.content && (
          <p className="mt-2 line-clamp-2 text-[12px] italic text-slate-500 dark:text-[#888888]">
            &ldquo;{note.qa.content.replace(/[#*`]/g, '').split('\n')[0]}&rdquo;
          </p>
        )}

        {note.type === 'general' && note.content && (
          <p className="mt-2 line-clamp-2 text-[12px] text-slate-500 dark:text-[#888888]">
            {note.content.replace(/[#*`]/g, '')}
          </p>
        )}

        <div className="flex-1 mt-2" />
        <div className="border-t border-slate-100 dark:border-[#222222]" />
        <div className="flex items-center justify-between pt-2 text-[10px] uppercase tracking-widest text-slate-400 dark:text-[#555555]">
          <div className="flex items-center gap-2">
            <span>{note.type}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
          </div>
          <button
            onClick={toggleFavorite}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-[5px] transition-colors",
              isFavorite ? "text-amber-400" : "text-slate-300 hover:text-amber-400 hover:bg-amber-50 dark:text-[#555555] dark:hover:bg-amber-950"
            )}
          >
            <Star className={cn("h-3.5 w-3.5", isFavorite && "fill-amber-400")} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotesLibraryClient({
  user,
  initialNotes,
  totalPages,
  currentPage,
}: NotesLibraryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState<NoteType | 'all'>((searchParams.get('type') as any) || 'all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title'>('recent');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(searchParams.get('filter') === 'favorites');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [page, setPage] = useState(currentPage);
  const [totalPagesState, setTotalPages] = useState(totalPages);

  // Sync URL params to local state on mount and URL changes
  useEffect(() => {
    const params = searchParams;
    const search = params.get('search');
    const type = params.get('type') as NoteType | null;
    const filter = params.get('filter');

    if (search) setSearchQuery(search); // eslint-disable-line react-hooks/set-state-in-effect
    if (type && ['dsa', 'qa', 'general'].includes(type)) setTypeFilter(type);
    if (filter) setShowFavoritesOnly(filter === 'favorites');
  }, [searchParams]);

  const updateURL = useCallback((newPage?: number, newSearch?: string, newType?: string, newFilter?: string) => {
    const params = new URLSearchParams();
    params.set('page', (newPage ?? page).toString());
    if (newSearch !== undefined || searchQuery) {
      params.set('search', newSearch ?? searchQuery);
    }
    if (newType !== undefined || typeFilter !== 'all') {
      params.set('type', newType ?? typeFilter);
    }
    if (newFilter !== undefined || showFavoritesOnly) {
      params.set('filter', 'favorites');
    }
    const query = params.toString();
    router.push(`/dashboard/notes?${query}`);
  }, [page, searchQuery, typeFilter, showFavoritesOnly, router]);

  const fetchNotes = useCallback(async (pageNum: number, search: string, type: NoteType | 'all', favOnly: boolean) => {
    let url = '/api/notes?';
    const params = new URLSearchParams();
    params.append('page', pageNum.toString());
    params.append('pageSize', '20');
    params.append('fields', 'id,userId,type,title,isFavorite,tags,createdAt,updatedAt');

    if (type !== 'all') params.append('type', type);
    if (favOnly) params.append('favorite', 'true');
    if (search) params.append('search', search);

    url += params.toString();

    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        let fetchedNotes = data.notes as Note[];

        fetchedNotes.sort((a, b) => {
          if (sortBy === 'recent') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          if (sortBy === 'oldest') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          if (sortBy === 'title') return a.title.localeCompare(b.title);
          return 0;
        });

        setNotes(fetchedNotes);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }, [sortBy]);

  const handleTypeFilterChange = (newType: NoteType | 'all') => {
    startTransition(() => {
      setTypeFilter(newType);
      setPage(1);
      updateURL(1, searchQuery, newType, showFavoritesOnly ? 'favorites' : undefined);
    });
  };

  const handleSearchChange = (newSearch: string) => {
    setSearchQuery(newSearch);
    startTransition(() => {
      setPage(1);
      updateURL(1, newSearch, typeFilter, showFavoritesOnly ? 'favorites' : undefined);
    });
  };

  const handleFavoritesToggle = () => {
    const newState = !showFavoritesOnly;
    setShowFavoritesOnly(newState);
    startTransition(() => {
      setPage(1);
      updateURL(1, searchQuery, typeFilter, newState ? 'favorites' : undefined);
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    startTransition(() => {
      updateURL(newPage, searchQuery, typeFilter, showFavoritesOnly ? 'favorites' : undefined);
    });
  };

  // Fetch notes when page/sort/filters change
  useEffect(() => {
    fetchNotes(page, searchQuery, typeFilter, showFavoritesOnly); // eslint-disable-line react-hooks/set-state-in-effect
  }, [page, typeFilter, showFavoritesOnly, sortBy, fetchNotes, searchQuery]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== (searchParams.get('search') || '')) {
        startTransition(() => {
          setPage(1);
          fetchNotes(1, searchQuery, typeFilter, showFavoritesOnly);
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchNotes, typeFilter, showFavoritesOnly, searchParams]);

  if (!user) {
    return null;
  }

  return (
    <div>
      <header className="mb-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl tracking-tight text-slate-900 dark:text-[#ededed]">Notes Library</h1>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-[#888888]">Manage and organize your knowledge.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-slate-400 dark:text-[#555555]" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-8 w-full rounded-[7px] border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-[12.5px] outline-none transition-all focus:border-slate-300 focus:bg-white placeholder:text-slate-400 sm:w-64 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:focus:border-[#3a3a3a] dark:focus:bg-[#232323] dark:placeholder:text-[#444444] dark:text-[#ededed]"
            />
          </div>
          <Link
            href="/dashboard/notes/new"
            className="flex h-9 items-center gap-2 rounded-[7px] bg-[#1a1a1a] px-4 text-[12.5px] font-medium text-white transition-colors hover:bg-slate-800 dark:bg-[#ededed] dark:text-[#0f0f0f] dark:hover:bg-[#d4d4d4]"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </Link>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-slate-200 bg-white p-4 dark:border-[#2a2a2a] dark:bg-[#161616]">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="mr-2 h-[15px] w-[15px] text-slate-400 dark:text-[#555555]" />
          {(['all', 'dsa', 'qa', 'general'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { handleTypeFilterChange(t); }}
              className={cn(
                "rounded-full px-4 py-1.5 text-[10.5px] font-medium uppercase tracking-wider transition-colors",
                typeFilter === t
                  ? "bg-[#1a1a1a] text-white dark:bg-[#ededed] dark:text-[#0f0f0f]"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-[#1e1e1e] dark:text-[#888888] dark:hover:bg-[#232323]"
              )}
            >
              {t}
            </button>
          ))}
          <div className="mx-2 h-5 w-px bg-slate-100 dark:bg-[#2a2a2a]" />
          <button
            onClick={handleFavoritesToggle}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-1.5 text-[10.5px] font-medium uppercase tracking-wider transition-colors",
              showFavoritesOnly
                ? "bg-amber-50 text-amber-500 dark:bg-amber-950 dark:text-amber-400"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-[#1e1e1e] dark:text-[#888888] dark:hover:bg-[#232323]"
            )}
          >
            <Star className={cn("h-3.5 w-3.5", showFavoritesOnly && "fill-amber-400")} />
            Favorites
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex h-8 items-center gap-2 rounded-[7px] px-3 text-[12.5px] font-medium text-slate-500 transition-colors hover:bg-slate-50 dark:text-[#888888] dark:hover:bg-[#1e1e1e]"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
            <motion.span
              animate={{ rotate: showSortDropdown ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-3 w-3" />
            </motion.span>
          </button>
          <AnimatePresence>
            {showSortDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-[7px] border border-slate-200 bg-white shadow-lg dark:border-[#2a2a2a] dark:bg-[#161616] dark:shadow-2xl"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => { setSortBy(option.value); setShowSortDropdown(false); }}
                      className={cn(
                        "w-full px-2.5 py-2 text-left text-[12.5px] transition-colors hover:bg-slate-50 dark:hover:bg-[#1e1e1e]",
                        sortBy === option.value ? "font-medium text-slate-900 dark:text-[#ededed]" : "text-slate-600 dark:text-[#888888]"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Notes Grid */}
      {isPending || (notes.length === 0 && totalPagesState > 0) ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-44 animate-pulse rounded-[10px] bg-slate-50 dark:bg-[#1e1e1e]" />
          ))}
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {notes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <NoteCard note={note} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-slate-200 bg-white py-24 text-center dark:border-[#2a2a2a] dark:bg-[#161616]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center text-slate-300 dark:text-[#555555]">
            <Search className="h-8 w-8" />
          </div>
          <h3 className={cn('text-[17px] text-slate-900 dark:text-[#ededed]', dmSerif.className)}>No notes found</h3>
          <p className="mt-2 max-w-[320px] text-[13px] text-slate-500 dark:text-[#888888]">Try adjusting your search or filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('all');
              setShowFavoritesOnly(false);
              setPage(1);
              router.push('/dashboard/notes');
            }}
            className="mt-6 text-[12.5px] font-medium text-slate-500 hover:text-slate-700 transition-colors dark:text-[#888888] dark:hover:text-[#ededed]"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPagesState > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="flex h-8 items-center gap-1 rounded-[7px] px-3 text-[12.5px] font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#888888] dark:hover:bg-[#1e1e1e]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPagesState) }, (_, i) => {
              let pageNum;
              if (totalPagesState <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPagesState - 2) {
                pageNum = totalPagesState - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-[7px] text-[12.5px] font-medium transition-colors",
                    page === pageNum
                      ? "bg-[#1a1a1a] text-white dark:bg-[#ededed] dark:text-[#0f0f0f]"
                      : "text-slate-600 hover:bg-slate-50 dark:text-[#888888] dark:hover:bg-[#1e1e1e]"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPagesState}
            className="flex h-8 items-center gap-1 rounded-[7px] px-3 text-[12.5px] font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#888888] dark:hover:bg-[#1e1e1e]"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
