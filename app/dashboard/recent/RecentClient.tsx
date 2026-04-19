'use client';

import { useState } from 'react';
import { Clock, Code2, BookOpen, FileText, Star, ArrowRight } from 'lucide-react';
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

interface RecentClientProps {
  userName: string;
  initialNotes: Note[];
}

export default function RecentClient({ userName, initialNotes }: RecentClientProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  const toggleFavorite = async (noteId: string, currentState: boolean) => {
    const newState = !currentState;
    setNotes(notes =>
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
      setNotes(notes =>
        notes.map(n => n.id === noteId ? { ...n, isFavorite: currentState } : n)
      );
    }
  };

  const firstName = userName.split(' ')[0];

  return (
    <div className={dmSans.className}>
      <header className="mb-8 flex items-end justify-between border-b border-slate-100 pb-6 dark:border-[#222222]">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400 mb-1 dark:text-[#555555]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className={cn('text-2xl tracking-tight text-slate-900 dark:text-[#ededed]', dmSerif.className)}>
            Recent Activity
          </h1>
          <p className="mt-1 text-[13px] text-slate-400 dark:text-[#555555]">
            Your latest notes and updates.
          </p>
        </div>
      </header>

      {notes.length > 0 ? (
        <div className="divide-y divide-slate-100 rounded-[10px] border border-slate-200 bg-white overflow-hidden dark:divide-[#222222] dark:border-[#2a2a2a] dark:bg-[#161616]">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors dark:hover:bg-[#1e1e1e]"
            >
              <Link href={`/dashboard/notes/${note.id}`} className="flex flex-1 items-center gap-3.5 min-w-0">
                <div className={cn(
                  'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[7px]',
                  note.type === 'dsa' ? 'bg-blue-50 text-blue-500 dark:bg-blue-950 dark:text-blue-400' :
                  note.type === 'qa' ? 'bg-amber-50 text-amber-500 dark:bg-amber-950 dark:text-amber-400' :
                  'bg-slate-100 text-slate-400 dark:bg-[#1e1e1e] dark:text-[#888888]'
                )}>
                  {note.type === 'dsa' ? <Code2 className="h-4 w-4" /> :
                   note.type === 'qa' ? <BookOpen className="h-4 w-4" /> :
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
        <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-slate-200 bg-white py-24 text-center dark:border-[#2a2a2a] dark:bg-[#161616]">
          <Clock className="h-12 w-12 text-slate-300 mb-4 dark:text-[#555555]" />
          <h3 className={cn('text-[17px] text-slate-900 dark:text-[#ededed]', dmSerif.className)}>No recent activity</h3>
          <p className="mt-2 max-w-[320px] text-[13px] text-slate-500 dark:text-[#888888]">
            Your recently updated notes will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
