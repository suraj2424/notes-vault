'use client';

import { useAuth } from '@/hooks/use-auth';
import { LogOut, Search, Plus, X, Loader2, Code2, BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Note } from '@/types';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'] });

export function Navbar() {
  const { user, logout } = useAuth();
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

  // Generate breadcrumbs from pathname
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
      'sticky top-0 z-50 border-b border-neutral-100 bg-white',
      dmSans.className + ' dark:border-[#222222] dark:bg-[#161616]'
    )}>
      <div className="flex items-center justify-between px-4 h-[52px]">

        {/* Left: Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-1.5 text-[12px] text-neutral-400 dark:text-[#555555]">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-1.5">
              {index > 0 && <span className="text-neutral-300 dark:text-[#555555]">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-[13px] text-neutral-600 dark:text-[#ededed]">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-neutral-900 dark:hover:text-[#ededed] transition-colors text-[12px]"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right: Search + New Note + Logout */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-2.5 h-[13px] w-[13px] text-neutral-400 dark:text-[#444444] pointer-events-none" />
               <input
                 type="text"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                 placeholder="Search..."
                 className="h-9 w-44 rounded-[7px] border border-neutral-200 bg-neutral-50 pl-8 pr-16 text-[14px] outline-none transition-all focus:border-neutral-300 focus:bg-white placeholder:text-neutral-400 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:focus:border-[#3a3a3a] dark:focus:bg-[#232323] dark:placeholder:text-[#444444] dark:text-[#ededed]"
               />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-neutral-400 hover:text-neutral-600 dark:text-[#555555] dark:hover:text-[#ededed]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </form>

            {/* Dropdown */}
            {showResults && (
              <div className="absolute top-full mt-1.5 right-0 w-72 rounded-[7px] border border-neutral-200 bg-white shadow-lg overflow-hidden z-50 dark:border-[#2a2a2a] dark:bg-[#161616] dark:shadow-2xl">
                 {isSearching ? (
                   <div className="flex items-center justify-center gap-2 py-4 text-[13px] text-neutral-400 dark:text-[#555555]">
                     <Loader2 className="h-4 w-4 animate-spin" />
                     Searching...
                   </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="p-1.5 space-y-0.5">
                      {searchResults.map((note) => (
                        <Link
                          key={note.id}
                          href={`/dashboard/notes/${note.id}`}
                          onClick={() => setShowResults(false)}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-[5px] hover:bg-neutral-50 transition-colors dark:hover:bg-[#1e1e1e]"
                        >
                          <div className={cn(
                            'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[5px]',
                            note.type === 'dsa' ? 'bg-blue-50 text-blue-500' :
                            note.type === 'qa'  ? 'bg-amber-50 text-amber-500' :
                                                    'bg-neutral-100 text-neutral-400'
                          )}>
                            {note.type === 'dsa' ? <Code2 className="h-3.5 w-3.5" /> :
                             note.type === 'qa'  ? <BookOpen className="h-3.5 w-3.5" /> :
                                                     <FileText className="h-3.5 w-3.5" />}
                          </div>
                           <div className="flex-1 min-w-0">
                             <p className="truncate text-[13.5px] font-medium text-neutral-900 dark:text-[#ededed]">{note.title}</p>
                             <p className="truncate text-[11px] text-neutral-400 dark:text-[#858484] uppercase">{note.type} note</p>
                           </div>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-neutral-100 dark:border-[#222222] px-3 py-2">
                       <Link
                         href={`/dashboard/notes?search=${encodeURIComponent(searchQuery)}`}
                         onClick={() => setShowResults(false)}
                         className="text-[12px] font-medium text-neutral-500 hover:text-neutral-900 dark:text-[#888888] dark:hover:text-[#ededed] transition-colors"
                       >
                         View all results →
                       </Link>
                    </div>
                  </>
                 ) : (
                   <div className="py-5 text-center text-[13px] text-neutral-400 dark:text-[#555555]">
                     No results for &quot;{searchQuery}&quot;
                   </div>
                )}
              </div>
            )}
          </div>

          {/* New Note Button */}
           <Link
             href="/dashboard/notes/new"
             className="flex items-center gap-1.5 h-9 px-3.5 rounded-[7px] bg-[#1a1a1a] text-white text-[13.5px] font-medium hover:bg-neutral-800 transition-colors dark:bg-[#ededed] dark:text-[#0f0f0f] dark:hover:bg-[#d4d4d4]"
           >
             <Plus className="h-4 w-4" />
             New Note
           </Link>

        </div>
      </div>
    </nav>
  );
}
