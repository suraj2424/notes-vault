'use client';

import { useUser } from '@clerk/nextjs';
import { Search, Plus, X, Loader2, Code2, BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Note } from '@/types';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] });

export function Navbar() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
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
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user]);

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
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        crumbs.push({ label, href });
      }
    }

    return crumbs;
  }, [pathname]);

  return (
    <nav className={cn(
      'sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950',
      dmSans.className
    )}>
      <div className="flex items-center justify-between px-4 h-[56px]">

        {/* Left: Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-2 text-[12px] font-medium text-neutral-500 dark:text-neutral-400">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              {index > 0 && <span className="text-neutral-300 dark:text-neutral-700">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-bold text-[13px] text-neutral-950 dark:text-neutral-50">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-neutral-950 dark:hover:text-neutral-50 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right: Search + New Note */}
        <div className="flex items-center gap-3">
          {/* Search Container */}
          <div className="relative hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                placeholder="Quick search..."
                className="h-10 w-56 rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-10 text-[13.5px] font-medium outline-none transition-all focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-700 dark:focus:bg-neutral-950 dark:focus:ring-neutral-900/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-0.5 rounded-md text-neutral-400 hover:bg-neutral-200 dark:text-neutral-500 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>

            {/* Dropdown Results */}
            {showResults && (
              <div className="absolute top-full mt-2 right-0 w-80 rounded-xl border border-neutral-200 bg-white shadow-2xl overflow-hidden z-50 dark:border-neutral-800 dark:bg-neutral-950">
                {isSearching ? (
                  <div className="flex items-center justify-center gap-3 py-8 text-[13px] font-medium text-neutral-500 dark:text-neutral-400">
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-950 dark:text-neutral-50" />
                    Searching database...
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="p-2 space-y-1">
                      <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">Top Matches</p>
                      {searchResults.map((note) => (
                        <Link
                          key={note.id}
                          href={`/dashboard/notes/${note.id}`}
                          onClick={() => setShowResults(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all group"
                        >
                          <div className={cn(
                            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border transition-colors',
                            note.type === 'dsa' ? 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' :
                            note.type === 'qa' ? 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' :
                            'bg-neutral-100 border-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400'
                          )}>
                            {note.type === 'dsa' ? <Code2 className="h-4 w-4" /> :
                             note.type === 'qa' ? <BookOpen className="h-4 w-4" /> :
                             <FileText className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-[13.5px] font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-white">{note.title}</p>
                            <p className="truncate text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-tight">{note.type} note</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 px-4 py-3">
                      <Link
                        href={`/dashboard/notes?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setShowResults(false)}
                        className="text-[12px] font-bold text-neutral-950 dark:text-neutral-50 hover:underline flex items-center justify-between"
                      >
                        View all results
                        <span className="text-[10px] bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded uppercase">Enter</span>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="py-10 px-6 text-center">
                    <p className="text-[14px] font-bold text-neutral-950 dark:text-neutral-50">No notes found</p>
                    <p className="mt-1 text-[12px] font-medium text-neutral-500 dark:text-neutral-400">We couldn't find anything matching &quot;{searchQuery}&quot;</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* New Note Button */}
          <Link
            href="/dashboard/notes/new"
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-neutral-950 text-white text-[13.5px] font-bold hover:bg-neutral-800 transition-all active:scale-95 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-white shadow-sm"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span className="hidden sm:inline">New Note</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}