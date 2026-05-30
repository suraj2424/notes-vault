'use client';

import { useUser } from '@clerk/nextjs';
import { Search, Plus, X, Loader2, Code2, BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Note } from '@/types';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';

export function Navbar() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const resetSearchResults = useCallback(() => {
    setSearchResults([]);
    setShowResults(false);
  }, []);

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
          const response = await fetch(`/api/notes?search=${encodeURIComponent(searchQuery)}&limit=5`);
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data.notes);
            setShowResults(true);
          } else {
            setSearchResults([]);
          }
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        resetSearchResults();
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [resetSearchResults, searchQuery, user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/notes?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
    }
  };

const breadcrumbs = useMemo(() => {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'Dashboard', href: '/dashboard' }];

  if (segments.length > 1 && segments[0] === 'dashboard') {
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      const href = '/' + segments.slice(0, i + 1).join('/');
      let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      if (i >= segments.length - 1 && segments[i - 1] === 'notes') {
        const match = pathname.match(/^\/dashboard\/notes\/([^/]+)/);
        if (match) {
          const id = match[1];
          const safe = id.replace(/[^a-zA-Z0-9]/g, '');
          label = safe.length > 9 ? `${safe.slice(0, 8)}...` : safe || 'Note';
        }
      }
      crumbs.push({ label, href });
    }
  }

  return crumbs;
}, [pathname]);

  return (
    <nav className="sticky top-0 z-50 border-b border-default bg-surface font-sans">
      <div className="flex h-14 items-center justify-between gap-4 px-5">

        {/* Left: Breadcrumbs */}
        <nav className="hidden min-w-0 items-center gap-2 text-[12px] text-secondary sm:flex">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              {index > 0 && <span className="select-none text-[11px] text-muted">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="truncate text-[12.5px] font-bold tracking-tight text-primary">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="font-medium tracking-tight transition-colors duration-100 hover:text-primary"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right: Search + Action */}
        <div className="ml-auto flex items-center gap-3">
          {/* Search Bar Container */}
          <div className="relative hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-[#687076] dark:text-[#A0A0A0] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                placeholder="Quick search..."
                className="h-9 w-60 rounded-lg border border-default bg-bg-muted pl-9 pr-8 text-xs font-medium text-primary outline-none transition-colors duration-100 placeholder:text-secondary/50 focus:border-[#00A3A3] focus:bg-surface dark:focus:border-[#00E0E0]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 rounded p-0.5 text-secondary transition-colors duration-100 hover:bg-bg-muted hover:text-primary"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </form>

            {/* Micro Dropdown Results Overlay */}
            {showResults && (
              <div className="absolute right-0 top-full z-50 mt-1 w-80 overflow-hidden rounded-lg border border-default bg-surface shadow-md">
                {isSearching ? (
                  <div className="flex items-center justify-center gap-2.5 py-6 text-xs font-medium text-[#687076] dark:text-[#A0A0A0]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00A3A3] dark:text-[#00E0E0]" />
                    Searching records...
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="p-1.5 space-y-0.5">
                      <p className="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0]">Top Matches</p>
                      {searchResults.map((note) => (
                        <Link
                          key={note.id}
                          href={`/dashboard/notes/${note.id}`}
                          onClick={() => setShowResults(false)}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-[#F4F7F6]/60 dark:hover:bg-[#111111]/50 transition-colors duration-100 group"
                        >
                          <div className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded border transition-colors duration-100',
                            note.type === 'dsa' ? 'bg-blue-500/5 border-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:border-blue-400/20 dark:text-blue-400' :
                            note.type === 'qa' ? 'bg-amber-500/5 border-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:border-amber-400/20 dark:text-amber-400' :
                            'bg-[#687076]/5 border-[#687076]/10 text-[#687076] dark:bg-[#A0A0A0]/10 dark:border-[#A0A0A0]/20 dark:text-[#A0A0A0]'
                          )}>
                            {note.type === 'dsa' ? <Code2 className="h-3.5 w-3.5" /> :
                             note.type === 'qa' ? <BookOpen className="h-3.5 w-3.5" /> :
                             <FileText className="h-3.5 w-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-semibold text-primary transition-colors duration-100 group-hover:text-[#00A3A3] dark:group-hover:text-[#00E0E0]">{note.title}</p>
                            <p className="truncate text-[9px] font-bold text-[#687076] dark:text-[#A0A0A0] uppercase tracking-wider mt-0.5">{note.type} document</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-default bg-bg-muted px-3 py-2">
                      <Link
                        href={`/dashboard/notes?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setShowResults(false)}
                        className="flex items-center justify-between text-[11px] font-bold text-primary transition-colors duration-100 hover:text-[#00A3A3] dark:hover:text-[#00E0E0]"
                      >
                        View all index matches
                        <span className="select-none rounded bg-surface px-1 py-0.5 font-mono text-[9px] text-secondary">Enter</span>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="py-8 px-4 text-center">
                    <p className="text-xs font-bold text-primary">No documents mapped</p>
                    <p className="mt-1 text-[11px] font-medium text-[#687076] dark:text-[#A0A0A0]">No matches found for &quot;{searchQuery}&quot;</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Trigger */}
          <Link
            href="/dashboard/notes/new"
            className="flex h-9 items-center gap-1.5 rounded-lg bg-[#1A1D1E] px-3.5 text-xs font-bold text-white shadow-sm transition-[colors,transform,shadow] duration-100 hover:bg-[#00A3A3] active:scale-[0.98] dark:bg-[#E4E6EB] dark:text-[#111111] dark:hover:bg-[#00E0E0]"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline tracking-tight">New Note</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
