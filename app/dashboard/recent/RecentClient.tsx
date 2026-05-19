'use client';

import { useState } from 'react';
import { Clock, Code2, BookOpen, FileText, Star, ArrowRight } from 'lucide-react';
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

  const firstName = (userName || '').split(' ')[0];

  const getNoteIconStyles = (type: Note['type']) => {
    switch (type) {
      case 'dsa':
        return 'bg-blue-500/5 border-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:border-blue-400/20 dark:text-blue-400';
      case 'qa':
        return 'bg-amber-500/5 border-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:border-amber-400/20 dark:text-amber-400';
      default:
        return 'bg-[#687076]/5 border-[#687076]/10 text-[#687076] dark:bg-[#A0A0A0]/10 dark:border-[#A0A0A0]/20 dark:text-[#A0A0A0]';
    }
  };

  return (
    <div className="mx-auto max-w-4xl font-sans">
      <header className="flex items-end justify-between pb-6">
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[#687076] dark:text-[#A0A0A0]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-xl font-bold tracking-tight text-[#1A1D1E] dark:text-[#E4E6EB]">
            Recent Activity
          </h1>
          <p className="mt-1 text-xs font-medium text-[#687076]/70 dark:text-[#A0A0A0]/60">
            {firstName ? `${firstName}, here are your latest notes and updates.` : 'Your latest notes and updates.'}
          </p>
        </div>
      </header>

      {notes.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] dark:border-[#2D2D2D] dark:bg-[#1A1A1A]">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group flex items-center justify-between gap-4 border-b border-[#E6E8EB] px-4 py-3.5 transition-colors duration-100 last:border-b-0 hover:bg-[#F4F7F6]/50 dark:border-[#2D2D2D] dark:hover:bg-[#111111]/40"
            >
              <Link href={`/dashboard/notes/${note.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded border transition-colors duration-100', getNoteIconStyles(note.type))}>
                  {note.type === 'dsa' ? <Code2 className="h-3.5 w-3.5" /> :
                   note.type === 'qa' ? <BookOpen className="h-3.5 w-3.5" /> :
                   <FileText className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[#1A1D1E] transition-colors duration-100 group-hover:text-[#00A3A3] dark:text-[#E4E6EB] dark:group-hover:text-[#00E0E0]">
                    {note.title}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#687076]/70 dark:text-[#A0A0A0]/60">
                    {note.type} <span className="mx-1 font-normal opacity-50">•</span> {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              </Link>
              
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(note.id, note.isFavorite);
                  }}
                  className={cn(
                    'rounded p-1.5 border transition-transform duration-100 outline-none active:scale-95',
                    note.isFavorite
                      ? 'bg-[#1A1D1E] border-transparent text-[#00A3A3] dark:bg-[#E4E6EB] dark:text-[#00E0E0]'
                      : 'border-transparent text-[#687076]/60 hover:bg-[#F4F7F6] hover:text-[#1A1D1E] dark:text-[#A0A0A0]/50 dark:hover:bg-[#111111] dark:hover:text-[#E4E6EB]'
                  )}
                >
                  <Star className={cn('h-3.5 w-3.5', note.isFavorite && 'fill-current')} />
                </button>
                <Link
                  href={`/dashboard/notes/${note.id}`}
                  className="rounded p-1.5 text-[#687076]/60 transition-colors duration-100 hover:bg-[#F4F7F6] hover:text-[#00A3A3] dark:text-[#A0A0A0]/50 dark:hover:bg-[#111111] dark:hover:text-[#00E0E0]"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#E6E8EB] bg-[#FFFFFF] py-24 text-center dark:border-[#2D2D2D] dark:bg-[#1A1A1A]">
          <Clock className="mb-3 h-8 w-8 text-[#687076]/30 dark:text-[#A0A0A0]/20" />
          <h3 className="text-sm font-semibold text-[#1A1D1E] dark:text-[#E4E6EB]">No recent activity</h3>
          <p className="mt-1 max-w-[280px] text-xs font-medium text-[#687076]/60 dark:text-[#A0A0A0]/50">
            Your recently updated notes will appear here automatically.
          </p>
        </div>
      )}
    </div>
  );
}