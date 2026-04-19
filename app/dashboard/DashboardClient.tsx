'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Code2,
  BookOpen,
  Star,
  ArrowRight,
  TrendingUp,
  Plus,
  FileText,
  Tags,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'] });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400' });

interface Note {
  id: string;
  title: string;
  type: 'dsa' | 'qa' | 'general';
  isFavorite: boolean;
  tags: string[];
  updatedAt: string;
}

interface Stats {
  total: number;
  dsa: number;
  qa: number;
  favorites: number;
}

interface DashboardClientProps {
  userName: string;
  recentNotes: Note[];
  stats: Stats;
}

export default function DashboardClient({
  userName,
  recentNotes,
  stats
}: DashboardClientProps) {

  const [recentNotesState, setRecentNotesState] = useState<Note[]>(recentNotes);

  const toggleFavorite = async (noteId: string, currentState: boolean) => {
    const newState = !currentState;
    // Optimistic update
    setRecentNotesState((notes: Note[]) =>
      notes.map((note: Note) => note.id === noteId ? { ...note, isFavorite: newState } : note)
    );

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: newState }),
      });
      if (!res.ok) throw new Error('Failed to update');
    } catch (error) {
      console.error(error);
      // Rollback on failure
      setRecentNotesState((notes: Note[]) =>
        notes.map((note: Note) => note.id === noteId ? { ...note, isFavorite: currentState } : note)
      );
    }
  };

  const firstName = userName.split(' ')[0];
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={dmSans.className}>
      {/* Header */}
      <header className="mb-8 flex items-end justify-between border-b border-neutral-100 pb-6 dark:border-[#222222]">
        <div className="flex items-center gap-4">
          {/* User Avatar */}
          <div className="hidden sm:flex w-[42px] h-[42px] rounded-full bg-neutral-100 items-center justify-center text-[13px] font-medium text-neutral-700 dark:bg-[#2a2a2a] dark:text-[#888888]">
            {initials}
          </div>
          <div>
            <p className="text-[12px] font-medium uppercase tracking-widest text-neutral-400 mb-1 dark:text-[#555555]">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className={cn('text-[28px] tracking-tight text-neutral-900', dmSerif.className + ' dark:text-[#ededed]')}>
              Welcome back, {firstName}
            </h1>
            <p className="mt-1 text-[14px] text-neutral-400 dark:text-[#555555]">
              Here&apos;s what&apos;s happening in your vault today.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/notes/new"
          className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-[7px] bg-[#1a1a1a] text-white text-[14px] font-medium hover:bg-neutral-800 transition-colors dark:bg-[#ededed] dark:text-[#0f0f0f] dark:hover:bg-[#d4d4d4]"
        >
          <Plus className="h-4 w-4" />
          New Note
        </Link>
      </header>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Notes" value={stats.total} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="DSA Solved"  value={stats.dsa}   icon={<Code2 className="h-5 w-5" />} />
        <StatCard label="Topic Q&A"   value={stats.qa}    icon={<BookOpen className="h-5 w-5" />} />
        <StatCard label="Favorites"   value={stats.favorites} icon={<Star className="h-5 w-5" />} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Recent Notes */}
        <div className="lg:col-span-2">
          <div className="rounded-[10px] border border-neutral-200 overflow-hidden bg-white dark:border-[#2a2a2a] dark:bg-[#161616]">
             <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5 dark:border-[#222222]">
               <h2 className="text-[14px] font-medium text-neutral-900 dark:text-[#ededed]">Recent Activity</h2>
               <Link
                 href="/dashboard/notes"
                 className="text-[12.5px] font-medium text-neutral-400 hover:text-neutral-700 transition-colors dark:text-[#555555] dark:hover:text-[#ededed]"
               >
                 View all →
               </Link>
             </div>

            {recentNotesState.length > 0 ? (
              <div className="divide-y divide-neutral-100 dark:divide-[#222222]">
                {recentNotesState.map((note) => (
                  <div
                    key={note.id}
                    className="group flex items-center gap-4 px-5 py-3.5 hover:bg-neutral-50 transition-colors dark:hover:bg-[#1e1e1e]"
                  >
                    <Link href={`/dashboard/notes/${note.id}`} className="flex flex-1 items-center gap-3.5 min-w-0">
                      <div className={cn(
                        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[7px]',
                        note.type === 'dsa' ? 'bg-blue-50 text-blue-500 dark:bg-blue-950 dark:text-blue-400' :
                        note.type === 'qa'  ? 'bg-amber-50 text-amber-500 dark:bg-amber-950 dark:text-amber-400' :
                                                'bg-neutral-100 text-neutral-400 dark:bg-[#1e1e1e] dark:text-[#888888]'
                      )}>
                        {note.type === 'dsa' ? <Code2 className="h-4 w-4" /> :
                         note.type === 'qa'  ? <BookOpen className="h-4 w-4" /> :
                                                 <FileText className="h-4 w-4" />}
                      </div>
                       <div className="min-w-0 flex-1">
                         <p className="truncate text-[14px] font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors dark:text-[#ededed] dark:group-hover:text-[#888888]">
                           {note.title}
                         </p>
                         <div className='flex gap-1'>
                         <p className="mt-0.5 text-[12px] text-neutral-400 uppercase dark:text-[#555555]">
                           {note.type + " ·"} 
                         </p>
                         <p className='mt-0.5 text-[12px] text-neutral-400 dark:text-[#555555]'> {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</p>
                         </div>
                       </div>
                    </Link>
                    <div className="flex items-center gap-1 flex-shrink-0">
                       <button
                         onClick={(e) => {
                           e.preventDefault();
                           toggleFavorite(note.id, note.isFavorite);
                         }}
                         className={cn(
                           'p-1.5 rounded-[5px] transition-colors',
                           note.isFavorite
                             ? 'text-amber-400'
                             : 'text-neutral-300 dark:text-[#555555] hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950'
                         )}
                       >
                         <Star className={cn('h-4 w-4', note.isFavorite && 'fill-amber-400')} />
                       </button>
                       <Link
                         href={`/dashboard/notes/${note.id}`}
                         className="p-1.5 rounded-[5px] text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 transition-colors dark:text-[#555555] dark:hover:text-[#ededed] dark:hover:bg-[#1e1e1e]"
                       >
                         <ArrowRight className="h-4 w-4" />
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
             ) : (
               <div className="py-14 text-center">
                 <p className="text-[14px] text-neutral-400 dark:text-[#555555]">No recent activity yet.</p>
                 <Link
                   href="/dashboard/notes/new"
                   className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-neutral-700 hover:text-neutral-900 transition-colors dark:text-[#888888] dark:hover:text-[#ededed]"
                 >
                   <Plus className="h-4 w-4" />
                   Create your first note
                 </Link>
               </div>
             )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
           {/* Quick Actions */}
           <div className="rounded-[10px] border border-neutral-200 overflow-hidden bg-white dark:border-[#2a2a2a] dark:bg-[#161616]">
             <div className="border-b border-neutral-100 px-5 py-3.5 dark:border-[#222222]">
               <h3 className="text-[14px] font-medium text-neutral-900 dark:text-[#ededed]">Quick Actions</h3>
             </div>
             <div className="grid grid-cols-2 gap-2 p-3">
               <QuickActionBtn icon={<Code2 className="h-5 w-5" />}    label="DSA Note"  href="/dashboard/notes/new?type=dsa" />
               <QuickActionBtn icon={<BookOpen className="h-5 w-5" />} label="Q&A Note"  href="/dashboard/notes/new?type=qa" />
               <QuickActionBtn icon={<Star className="h-5 w-5" />}     label="Favorites" href="/dashboard/notes?filter=favorites" />
                <QuickActionBtn icon={<Tags className="h-5 w-5" />}     label="Tags"      href="/dashboard/tags" />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className="rounded-[10px] border border-neutral-200 p-4 hover:border-neutral-300 transition-colors bg-white dark:border-[#2a2a2a] dark:bg-[#161616] dark:hover:border-[#3a3a3a]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11.5px] font-medium uppercase tracking-widest text-neutral-400 dark:text-[#555555]">{label}</p>
          <p className="mt-1.5 text-2xl font-medium text-neutral-900 dark:text-[#ededed]">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-[7px] bg-neutral-100 text-neutral-500 dark:bg-[#1e1e1e] dark:text-[#888888]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickActionBtn({ icon, label, href }: { icon: ReactNode; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 rounded-[7px] border border-neutral-200 p-4 hover:border-neutral-300 hover:bg-neutral-50 transition-colors dark:border-[#2a2a2a] dark:hover:border-[#3a3a3a] dark:hover:bg-[#1e1e1e]"
    >
      <div className="text-neutral-400 dark:text-[#888888]">{icon}</div>
      <span className="text-[11.5px] font-medium uppercase tracking-wider text-neutral-500 dark:text-[#888888]">{label}</span>
    </Link>
  );
}
