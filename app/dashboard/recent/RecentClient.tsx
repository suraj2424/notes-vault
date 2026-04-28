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

  const getNoteTypeStyles = (type: Note['type']) => {
    switch (type) {
      case 'dsa':
        return 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950';
      case 'qa':
        return 'bg-neutral-100 text-neutral-950 dark:bg-neutral-900 dark:text-white';
      default:
        return 'bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400';
    }
  };

  return (
    <div className="font-sans">
      <header className="flex items-end justify-between pb-6">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="font-serif text-2xl tracking-tight text-neutral-950 dark:text-white">
            Recent Activity
          </h1>
          <p className="mt-1 text-[13px] text-neutral-500 dark:text-neutral-400">
            {firstName ? `${firstName}, here are your latest notes and updates.` : 'Your latest notes and updates.'}
          </p>
        </div>
      </header>

      {notes.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group flex items-center gap-4 border-b border-neutral-200 px-5 py-4 transition-colors last:border-b-0 hover:bg-neutral-100 dark:border-neutral-900 dark:hover:bg-neutral-800/60"
            >
              <Link href={`/dashboard/notes/${note.id}`} className="flex min-w-0 flex-1 items-center gap-3.5">
                <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl', getNoteTypeStyles(note.type))}>
                  {note.type === 'dsa' ? <Code2 className="h-4 w-4" /> :
                   note.type === 'qa' ? <BookOpen className="h-4 w-4" /> :
                   <FileText className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold tracking-tight text-neutral-950 transition-colors group-hover:text-neutral-700 dark:text-white dark:group-hover:text-neutral-200">
                    {note.title}
                  </p>
                  <p className="mt-0.5 text-[11px] capitalize text-neutral-500 dark:text-neutral-400">
                    {note.type} {'\u00B7'} {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              </Link>
              <div className="flex flex-shrink-0 items-center gap-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(note.id, note.isFavorite);
                  }}
                  className={cn(
                    'rounded-lg p-2 transition-colors',
                    note.isFavorite
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                      : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-white'
                  )}
                >
                  <Star className={cn('h-3.5 w-3.5', note.isFavorite && 'fill-current')} />
                </button>
                <Link
                  href={`/dashboard/notes/${note.id}`}
                  className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white py-24 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <Clock className="mb-4 h-12 w-12 text-neutral-300 dark:text-neutral-700" />
          <h3 className="font-serif text-[17px] text-neutral-950 dark:text-white">No recent activity</h3>
          <p className="mt-2 max-w-[320px] text-[13px] text-neutral-500 dark:text-neutral-400">
            Your recently updated notes will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
