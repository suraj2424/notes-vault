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

export default function DashboardClient({ userName, recentNotes, stats }: DashboardClientProps) {
  const [recentNotesState, setRecentNotesState] = useState<Note[]>(recentNotes);

  const toggleFavorite = async (noteId: string, currentState: boolean) => {
    const newState = !currentState;
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
      setRecentNotesState((notes: Note[]) =>
        notes.map((note: Note) => note.id === noteId ? { ...note, isFavorite: currentState } : note)
      );
    }
  };

  const firstName = userName.split(' ')[0];
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="p-6 lg:p-10 font-sans">
  {/* --- HEADER: Clean and Integrated --- */}
  <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-200 dark:border-neutral-800 pb-8">
    <div className="flex items-center gap-5">
      {/* Profile/Initials - Minimal Surface */}
      <div className="flex w-12 h-12 rounded-xl bg-white dark:bg-neutral-900 items-center justify-center text-[13px] font-bold text-neutral-950 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        {initials}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400 dark:text-neutral-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <h1 className="text-3xl tracking-tight text-neutral-950 dark:text-neutral-50 leading-none font-serif">
          Welcome back, {userName.split(' ')[0]}
        </h1>
        <p className="mt-2 text-[14px] font-medium text-neutral-500 dark:text-neutral-400">
          Your vault is synced and up to date.
        </p>
      </div>
    </div>

    <Link
      href="/dashboard/notes/new"
      className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-neutral-900 text-white text-[13px] font-bold hover:bg-neutral-800 transition-all dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white"
    >
      <Plus className="h-4 w-4 stroke-[3]" />
      New Note
    </Link>
  </header>

  {/* --- STATS GRID --- */}
  <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
    <StatCard label="Total Notes" value={stats.total} icon={<TrendingUp className="h-5 w-5" />} />
    <StatCard label="DSA Solved" value={stats.dsa} icon={<Code2 className="h-5 w-5" />} />
    <StatCard label="Topic Q&A" value={stats.qa} icon={<BookOpen className="h-5 w-5" />} />
    <StatCard label="Favorites" value={stats.favorites} icon={<Star className="h-5 w-5" />} />
  </div>

  {/* --- CONTENT LAYOUT --- */}
  <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
    
    {/* Recent Activity: 2/3 Width */}
    <div className="lg:col-span-2">
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/30 overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
          <h2 className="text-[14px] font-bold text-neutral-950 dark:text-neutral-50 uppercase tracking-tight">Recent Activity</h2>
          <Link href="/dashboard/notes" className="text-[11px] font-bold text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-200">
            View All →
          </Link>
        </div>

        {recentNotesState.length > 0 ? (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
            {recentNotesState.map((note) => (
              <div key={note.id} className="group flex items-center gap-4 px-6 py-4 hover:bg-white dark:hover:bg-neutral-800/50 transition-colors">
                <Link href={`/dashboard/notes/${note.id}`} className="flex flex-1 items-center gap-4 min-w-0">
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-all',
                    note.type === 'dsa' 
                      ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' 
                      : note.type === 'qa' 
                      ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' 
                      : 'bg-neutral-50 text-neutral-500 border-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
                  )}>
                    {note.type === 'dsa' ? <Code2 className="h-5 w-5" /> :
                     note.type === 'qa' ? <BookOpen className="h-5 w-5" /> :
                     <FileText className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold text-neutral-950 dark:text-neutral-100">
                      {note.title}
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold text-neutral-400 uppercase tracking-tight">
                      {note.type} • {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </Link>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => toggleFavorite(note.id, note.isFavorite)} 
                    className={cn('p-2 rounded-md transition-all', note.isFavorite ? 'text-amber-500' : 'text-neutral-300 hover:text-neutral-500')}
                  >
                    <Star className={cn('h-4 w-4', note.isFavorite && 'fill-amber-500')} />
                  </button>
                  <Link href={`/dashboard/notes/${note.id}`} className="p-2 rounded-md text-neutral-300 hover:text-neutral-950 dark:hover:text-neutral-100">
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-sm text-neutral-400">No recent notes found.</p>
          </div>
        )}
      </div>
    </div>

    {/* Quick Actions: 1/3 Width Sidebar */}
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/30 p-6">
        <h3 className="mb-4 text-[12px] font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-widest">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <QuickActionBtn icon={<Code2 className="h-5 w-5" />} label="DSA" href="/dashboard/notes/new?type=dsa" />
          <QuickActionBtn icon={<BookOpen className="h-5 w-5" />} label="Q&A" href="/dashboard/notes/new?type=qa" />
          <QuickActionBtn icon={<Star className="h-5 w-5" />} label="Favs" href="/dashboard/notes?filter=favorites" />
          <QuickActionBtn icon={<Tags className="h-5 w-5" />} label="Tags" href="/dashboard/tags" />
        </div>
      </div>
      
    </div>
  </div>
</div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-6 bg-white dark:border-neutral-700 dark:bg-neutral-900 transition-all hover:border-neutral-300 dark:hover:border-neutral-600 group shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">{label}</p>
          <p className="mt-1 text-3xl font-bold text-neutral-950 dark:text-neutral-100 tracking-tighter">{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuickActionBtn({ icon, label, href }: { icon: ReactNode; label: string; href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center gap-3 rounded-xl border border-neutral-200 py-5 hover:border-neutral-400 hover:bg-neutral-100 transition-all dark:border-neutral-700 dark:hover:border-neutral-600 dark:hover:bg-neutral-800 group shadow-sm">
      <div className="text-neutral-500 group-hover:text-neutral-950 dark:text-neutral-400 dark:group-hover:text-neutral-100 transition-colors">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-neutral-100">{label}</span>
    </Link>
  );
}
