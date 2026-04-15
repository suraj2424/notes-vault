'use client';

import { useAuth } from '@/hooks/use-auth';
import { LogOut, User, Search, Plus, X, Loader2, Code2, BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Note } from '@/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2 && user) {
        setIsSearching(true);
        try {
          const notesRef = collection(db, 'notes');
          const q = query(
            notesRef,
            where('userId', '==', user.uid),
            limit(20)
          );
          const querySnapshot = await getDocs(q);
          const allNotes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
          
          const filtered = allNotes.filter(note => 
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (note.type === 'general' && note.content?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (note.type === 'dsa' && note.dsa?.problemStatement?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (note.type === 'qa' && note.qa?.question?.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          
          setSearchResults(filtered.slice(0, 5));
          setShowResults(true);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/notes?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-brand-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-0 h-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary text-white font-bold">
              N
            </div>
            <span className="font-sans text-xl font-extrabold tracking-tight text-brand-primary">NoteVault.</span>
          </Link>

          <div className="hidden md:block relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-brand-muted" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                placeholder="Search by title, tags, or content..." 
                className="w-[400px] rounded-lg border border-brand-border bg-brand-bg py-2 pl-10 pr-10 text-sm outline-none transition-all focus:border-brand-primary focus:bg-white"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-brand-muted hover:text-brand-text"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full mt-2 w-full rounded-xl border border-brand-border bg-white p-2 shadow-xl">
                {isSearching ? (
                  <div className="flex items-center justify-center py-4 text-sm text-brand-muted">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((note) => (
                      <Link
                        key={note.id}
                        href={`/notes/${note.id}`}
                        onClick={() => setShowResults(false)}
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-50"
                      >
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg",
                          note.type === 'dsa' ? "bg-blue-50 text-brand-primary" :
                          note.type === 'qa' ? "bg-amber-50 text-amber-600" :
                          "bg-neutral-50 text-brand-muted"
                        )}>
                          {note.type === 'dsa' ? <Code2 className="h-4 w-4" /> :
                           note.type === 'qa' ? <BookOpen className="h-4 w-4" /> :
                           <FileText className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate text-sm font-bold text-brand-text">{note.title}</p>
                          <p className="truncate text-[0.7rem] text-brand-muted capitalize">{note.type} Note</p>
                        </div>
                      </Link>
                    ))}
                    <div className="border-t border-brand-border pt-1">
                      <Link 
                        href={`/notes?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setShowResults(false)}
                        className="block w-full py-2 text-center text-[0.7rem] font-bold text-brand-primary hover:underline"
                      >
                        View all results
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-sm text-brand-muted">
                    No results found for &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/notes/new" 
            className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>New Note</span>
          </Link>

          <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
            {user?.photoURL ? (
              <Image 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                width={32} 
                height={32} 
                className="rounded-full border border-neutral-200"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
                <User className="h-4 w-4" />
              </div>
            )}
            <button 
              onClick={logout}
              className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
