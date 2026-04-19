'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [recentNotesState, setRecentNotes] = useState<Note[]>(recentNotes);

  const toggleFavorite = async (noteId: string, currentState: boolean) => {
    const newState = !currentState;
    // Optimistic update
    setRecentNotesState(notes =>
      notes.map(n => n.id === noteId ? { ...n, isFavorite: newState } : n)
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
      setRecentNotesState(notes =>
        notes.map(n => n.id === noteId ? { ...n, isFavorite: currentState } : n)
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
      <header className="mb-8 flex items-end justify-between border-b border-slate-100 pb-6 dark:border-[#222222]">
        <div className="flex items-center gap-4">
          {/* User Avatar */}
          <div className="hidden sm:flex w-[42px] h-[42px] rounded-full bg-slate-100 items-center justify-center text-[12px] font-medium text-slate-700 dark:bg-[#2a2a2a] dark:text-[#888888]">
            {initials}
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400 mb-1 dark:text-[#555555]">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className={cn('text-2xl tracking-tight text-slate-900', dmSerif.className + ' dark:text-[#ededed]')}>
              Welcome back, {firstName}
            </h1>
            <p className="mt-1 text-[13px] text-slate-400 dark:text-[#555555]">
              Here&apos;s what&apos;s happening in your vault today.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/notes/new"
          className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-[7px] bg-[#1a1a1a] text-white text-[13px] font-medium hover:bg-slate-800 transition-colors dark:bg-[#ededed] dark:text-[#0f0f0f] dark:hover:bg-[#d4d4d4]"
        >
          <Plus className="h-3.5 w-3.5" />
          New Note
        </Link>
      </header>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Notes" value={stats.total} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="DSA Solved"  value={stats.dsa}   icon={<Code2 className="h-4 w-4" />} />
        <StatCard label="Topic Q&A"   value={stats.qa}    icon={<BookOpen className="h-4 w-4" />} />
        <StatCard label="Favorites"   value={stats.favorites} icon={<Star className="h-4 w-4" />} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Recent Notes */}
        <div className="lg:col-span-2">
          <div className="rounded-[10px] border border-slate-200 overflow-hidden bg-white dark:border-[#2a2a2a] dark:bg-[#161616]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-[#222222]">
              <h2 className="text-[13px] font-medium text-slate-900 dark:text-[#ededed]">Recent Activity</h2>
              <Link
                href="/dashboard/notes"
                className="text-[11.5px] font-medium text-slate-400 hover:text-slate-700 transition-colors dark:text-[#555555] dark:hover:text-[#ededed]"
              >
                View all →
              </Link>
            </div>

            {recentNotesState.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-[#222222]">
                {recentNotesState.map((note) => (
                  <div
                    key={note.id}
                    className="group flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors dark:hover:bg-[#1e1e1e]"
                  >
                    <Link href={`/dashboard/notes/${note.id}`} className="flex flex-1 items-center gap-3.5 min-w-0">
                      <div className={cn(
                        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[7px]',
                        note.type === 'dsa' ? 'bg-blue-50 text-blue-500 dark:bg-blue-950 dark:text-blue-400' :
                        note.type === 'qa'  ? 'bg-amber-50 text-amber-500 dark:bg-amber-950 dark:text-amber-400' :
                                                'bg-slate-100 text-slate-400 dark:bg-[#1e1e1e] dark:text-[#888888]'
                      )}>
                        {note.type === 'dsa' ? <Code2 className="h-4 w-4" /> :
                         note.type === 'qa'  ? <BookOpen className="h-4 w-4" /> :
                                                 <FileText className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-slate-900 group-hover:text-slate-600 transition-colors dark:text-[#ededed] dark:group-hover:text-[#888888]">
                          {note.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400 capitalize dark:text-[#555555]">
                          {note.type} · {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                        </p>
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
                            : 'text-slate-300 dark:text-[#555555] hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950'
                        )}
                      >
                        <Star className={cn('h-3.5 w-3.5', note.isFavorite && 'fill-amber-400')} />
                      </button>
                      <Link
                        href={`/dashboard/notes/${note.id}`}
                        className="p-1.5 rounded-[5px] text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors dark:text-[#555555] dark:hover:text-[#ededed] dark:hover:bg-[#1e1e1e]"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-14 text-center">
                <p className="text-[13px] text-slate-400 dark:text-[#555555]">No recent activity yet.</p>
                <Link
                  href="/dashboard/notes/new"
                  className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-slate-700 hover:text-slate-900 transition-colors dark:text-[#888888] dark:hover:text-[#ededed]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create your first note
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="rounded-[10px] border border-slate-200 overflow-hidden bg-white dark:border-[#2a2a2a] dark:bg-[#161616]">
            <div className="border-b border-slate-100 px-5 py-3.5 dark:border-[#222222]">
              <h3 className="text-[13px] font-medium text-slate-900 dark:text-[#ededed]">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 p-3">
              <QuickActionBtn icon={<Code2 className="h-4 w-4" />}    label="DSA Note"  href="/dashboard/notes/new?type=dsa" />
              <QuickActionBtn icon={<BookOpen className="h-4 w-4" />} label="Q&A Note"  href="/dashboard/notes/new?type=qa" />
              <QuickActionBtn icon={<Star className="h-4 w-4" />}     label="Favorites" href="/dashboard/notes?filter=favorites" />
               <QuickActionBtn icon={<Tags className="h-4 w-4" />}     label="Tags"      href="/dashboard/tags" />
            </div>
          </div>

          {/* New Note CTA */}
          <Link
            href="/dashboard/notes/new"
            className="flex items-center justify-center gap-2 w-full h-10 rounded-[7px] bg-[#1a1a1a] text-white text-[13px] font-medium hover:bg-slate-800 transition-colors dark:bg-[#ededed] dark:text-[#0f0f0f] dark:hover:bg-[#d4d4d4]"
          >
            <Plus className="h-3.5 w-3.5" />
            New Note
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-[10px] border border-slate-200 p-4 hover:border-slate-300 transition-colors bg-white dark:border-[#2a2a2a] dark:bg-[#161616] dark:hover:border-[#3a3a3a]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10.5px] font-medium uppercase tracking-widest text-slate-400 dark:text-[#555555]">{label}</p>
          <p className="mt-1.5 text-2xl font-medium text-slate-900 dark:text-[#ededed]">{value}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-slate-100 text-slate-500 dark:bg-[#1e1e1e] dark:text-[#888888]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickActionBtn({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 rounded-[7px] border border-slate-200 p-4 hover:border-slate-300 hover:bg-slate-50 transition-colors dark:border-[#2a2a2a] dark:hover:border-[#3a3a3a] dark:hover:bg-[#1e1e1e]"
    >
      <div className="text-slate-400 dark:text-[#888888]">{icon}</div>
      <span className="text-[10.5px] font-medium uppercase tracking-wider text-slate-500 dark:text-[#888888]">{label}</span>
    </Link>
  );
}
