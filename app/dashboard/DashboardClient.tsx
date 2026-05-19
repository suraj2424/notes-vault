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

  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="w-full bg-[#F4F7F6] text-[#1A1D1E] antialiased transition-colors duration-100 dark:bg-[#111111] dark:text-[#E4E6EB]">
      {/* Header */}
      <header className="flex items-end justify-between pb-6">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-11 w-11 rounded-lg bg-[#FFFFFF] items-center justify-center text-xs font-bold text-[#1A1D1E] border border-[#E6E8EB] dark:bg-[#1A1A1A] dark:text-[#E4E6EB] dark:border-[#2D2D2D]">
            {initials}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0] mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1D1E] dark:text-[#E4E6EB] leading-tight">
              Welcome back, {userName.split(' ')[0]}
            </h1>
            <p className="text-xs text-[#687076] dark:text-[#A0A0A0]">
              Your vault is synced and up to date.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/notes/new"
          className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-md bg-[#00A3A3] text-white text-xs font-medium hover:bg-[#008B8B] transition-colors duration-100 dark:bg-[#00E0E0] dark:text-[#111111] dark:hover:bg-[#00C2C2]"
        >
          <Plus className="h-4 w-4" />
          New Note
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Notes" value={stats.total} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="DSA Solved"  value={stats.dsa}   icon={<Code2 className="h-4 w-4" />} />
        <StatCard label="Topic Q&A"   value={stats.qa}    icon={<BookOpen className="h-4 w-4" />} />
        <StatCard label="Favorites"   value={stats.favorites} icon={<Star className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E6E8EB] px-4 py-3.5 dark:border-[#2D2D2D]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0]">Recent Activity</h2>
              <Link href="/dashboard/notes" className="text-xs text-[#00A3A3] hover:underline dark:text-[#00E0E0]">
                View all
              </Link>
            </div>

            {recentNotesState.length > 0 ? (
              <div className="divide-y divide-[#E6E8EB] dark:divide-[#2D2D2D]">
                {recentNotesState.map((note) => (
                  <div key={note.id} className="group flex items-center gap-3 px-4 py-3 hover:bg-[#F4F7F6]/50 dark:hover:bg-[#111111]/30 transition-colors duration-100">
                    <Link href={`/dashboard/notes/${note.id}`} className="flex flex-1 items-center gap-3 min-w-0">
                      <div className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors duration-100',
                        note.type === 'dsa' ? 'bg-blue-500/5 text-blue-500 border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                        note.type === 'qa'  ? 'bg-amber-500/5 text-amber-500 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                                              'bg-[#F4F7F6] text-[#687076] border-[#E6E8EB] dark:bg-[#111111] dark:text-[#A0A0A0] dark:border-[#2D2D2D]'
                      )}>
                        {note.type === 'dsa' ? <Code2 className="h-4 w-4" /> :
                         note.type === 'qa'  ? <BookOpen className="h-4 w-4" /> :
                                               <FileText className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[#1A1D1E] dark:text-[#E4E6EB]">
                          {note.title}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#687076] uppercase tracking-wide dark:text-[#A0A0A0]">
                          {note.type} • {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => toggleFavorite(note.id, note.isFavorite)} className={cn('p-1.5 rounded transition-colors duration-100', note.isFavorite ? 'text-amber-500' : 'text-[#687076] hover:text-[#1A1D1E] dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB]')}>
                        <Star className={cn('h-3.5 w-3.5 transition-colors duration-100', note.isFavorite && 'fill-amber-500')} />
                      </button>
                      <Link href={`/dashboard/notes/${note.id}`} className="p-1.5 rounded text-[#687076] hover:text-[#1A1D1E] dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB] transition-colors duration-100">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-xs text-[#687076] dark:text-[#A0A0A0]">No recent notes found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0]">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <QuickActionBtn icon={<Code2 className="h-4 w-4" />}    label="DSA"  href="/dashboard/notes/new?type=dsa" />
              <QuickActionBtn icon={<BookOpen className="h-4 w-4" />} label="Q&A"  href="/dashboard/notes/new?type=qa" />
              <QuickActionBtn icon={<Star className="h-4 w-4" />}     label="Favs" href="/dashboard/notes?filter=favorites" />
              <QuickActionBtn icon={<Tags className="h-4 w-4" />}     label="Tags" href="/dashboard/tags" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className="rounded-lg border border-[#E6E8EB] p-4 bg-[#FFFFFF] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] transition-colors duration-100 hover:border-[#00A3A3] dark:hover:border-[#00E0E0] group">
      <div className="flex flex-col gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F4F7F6] text-[#687076] dark:bg-[#111111] dark:text-[#A0A0A0] border border-[#E6E8EB] dark:border-[#2D2D2D] group-hover:scale-105 transition-transform duration-100">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0]">{label}</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-[#1A1D1E] dark:text-[#E4E6EB]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuickActionBtn({ icon, label, href }: { icon: ReactNode; label: string; href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center gap-2 rounded-md border border-[#E6E8EB] py-3.5 bg-[#FFFFFF] hover:border-[#00A3A3] hover:bg-[#F4F7F6]/30 transition-colors duration-100 dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:hover:border-[#00E0E0] dark:hover:bg-[#111111]/30 group">
      <div className="text-[#687076] group-hover:text-[#00A3A3] dark:text-[#A0A0A0] dark:group-hover:text-[#00E0E0] transition-colors duration-100">{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0] group-hover:text-[#1A1D1E] dark:group-hover:text-[#E4E6EB] transition-colors duration-100">{label}</span>
    </Link>
  );
}