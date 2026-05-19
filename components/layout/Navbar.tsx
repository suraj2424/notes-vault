'use client';

import { useUser } from '@clerk/nextjs';
import { Search, Plus, X, Loader2, Code2, BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef, useMemo } from 'react';
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
        searchResults.length > 0 && setSearchResults([]);
        showResults && setShowResults(false);
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
    <nav className="sticky top-0 z-50 border-b border-[#E6E8EB] bg-[#FFFFFF] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] font-sans">
      <div className="flex items-center justify-between px-4 h-[56px]">

        {/* Left: Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-2 text-[12px] text-[#687076] dark:text-[#A0A0A0]">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              {index > 0 && <span className="text-[#E6E8EB] dark:text-[#2D2D2D] text-[11px] select-none">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-bold text-[12.5px] text-[#1A1D1E] dark:text-[#E4E6EB] tracking-tight">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="font-medium tracking-tight hover:text-[#1A1D1E] dark:hover:text-[#E4E6EB] transition-colors duration-100"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right: Search + Action */}
        <div className="flex items-center gap-3">
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
                className="h-9 w-56 rounded border border-[#E6E8EB] bg-[#F4F7F6] pl-9 pr-8 text-xs font-medium text-[#1A1D1E] placeholder:text-[#687076]/50 outline-none transition-colors duration-100 focus:border-[#00A3A3] focus:bg-[#FFFFFF] dark:border-[#2D2D2D] dark:bg-[#111111] dark:text-[#E4E6EB] dark:placeholder:text-[#A0A0A0]/40 dark:focus:border-[#00E0E0] dark:focus:bg-[#1A1A1A]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-0.5 rounded text-[#687076] hover:bg-[#E6E8EB] dark:text-[#A0A0A0] dark:hover:bg-[#2D2D2D] transition-colors duration-100"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </form>

            {/* Micro Dropdown Results Overlay */}
            {showResults && (
              <div className="absolute top-full mt-1 right-0 w-80 rounded border border-[#E6E8EB] bg-[#FFFFFF] shadow-md overflow-hidden z-50 dark:border-[#2D2D2D] dark:bg-[#1A1A1A]">
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
                            <p className="truncate text-xs font-semibold text-[#1A1D1E] dark:text-[#E4E6EB] group-hover:text-[#00A3A3] dark:group-hover:text-[#00E0E0] transition-colors duration-100">{note.title}</p>
                            <p className="truncate text-[9px] font-bold text-[#687076] dark:text-[#A0A0A0] uppercase tracking-wider mt-0.5">{note.type} document</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-[#E6E8EB] dark:border-[#2D2D2D] bg-[#F4F7F6]/50 dark:bg-[#111111]/30 px-3 py-2">
                      <Link
                        href={`/dashboard/notes?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setShowResults(false)}
                        className="text-[11px] font-bold text-[#1A1D1E] dark:text-[#E4E6EB] hover:text-[#00A3A3] dark:hover:text-[#00E0E0] flex items-center justify-between transition-colors duration-100"
                      >
                        View all index matches
                        <span className="text-[9px] bg-[#E6E8EB] dark:bg-[#2D2D2D] text-[#687076] dark:text-[#A0A0A0] px-1 py-0.5 rounded font-mono select-none">↵</span>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="py-8 px-4 text-center">
                    <p className="text-xs font-bold text-[#1A1D1E] dark:text-[#E4E6EB]">No documents mapped</p>
                    <p className="mt-1 text-[11px] font-medium text-[#687076] dark:text-[#A0A0A0]">No matches found for &quot;{searchQuery}&quot;</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Trigger */}
          <Link
            href="/dashboard/notes/new"
            className="flex items-center gap-1.5 h-9 px-3.5 rounded bg-[#1A1D1E] text-[#FFFFFF] text-xs font-bold hover:bg-[#00A3A3] hover:text-[#FFFFFF] active:scale-[0.98] transition-[colors,transform,shadow] duration-100 dark:bg-[#E4E6EB] dark:text-[#111111] dark:hover:bg-[#00E0E0] dark:hover:text-[#111111] shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline tracking-tight">New Note</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}