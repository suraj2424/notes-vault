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
    return 'bg-dsa-bg text-dsa-text border-dsa-text/20 dark:border-dsa-text/30';
  case 'qa':
    return 'bg-qa-bg text-qa-text border-qa-text/20 dark:border-qa-text/30';
  default:
    return 'bg-bg-muted text-muted border-default dark:border-border';
  }
};

return (
  <div className="mx-auto max-w-4xl font-sans p-6">
    <header className="flex items-end justify-between pb-6">
      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-secondary">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-xl font-bold tracking-tight text-primary">
          Recent Activity
        </h1>
        <p className="mt-1 text-xs font-medium text-secondary/60 dark:text-muted">
          {firstName ? `${firstName}, here are your latest notes and updates.` : 'Your latest notes and updates.'}
        </p>
      </div>
    </header>

    {notes.length > 0 ? (
      <div className="overflow-hidden rounded-lg border border-default bg-surface">
        {notes.map((note) => (
          <div
            key={note.id}
            className="group flex items-center justify-between gap-4 border-b border-border-subtle px-4 py-3.5 transition-colors duration-100 last:border-b-0 hover:bg-bg-muted"
          >
            <Link href={`/dashboard/notes/${note.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded border transition-colors duration-100', getNoteIconStyles(note.type))}>
                {note.type === 'dsa' ? <Code2 className="h-3.5 w-3.5" /> : 
                note.type === 'qa' ? <BookOpen className="h-3.5 w-3.5" /> : 
                <FileText className="h-3.5 w-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-primary transition-colors duration-100 group-hover:text-[#00A3A3]">
                  {note.title}
                </p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
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
                    ? 'bg-primary border-transparent text-favorite'
                    : 'border-transparent text-muted hover:bg-bg-muted hover:text-primary'
                )}
              >
                <Star className={cn('h-3.5 w-3.5', note.isFavorite && 'fill-current')} />
              </button>
              <Link
                href={`/dashboard/notes/${note.id}`}
                className="rounded p-1.5 text-muted transition-colors duration-100 hover:bg-bg-muted hover:text-[#00A3A3]"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-default bg-surface py-24 text-center">
        <Clock className="mb-3 h-8 w-8 text-muted" />
        <h3 className="text-sm font-semibold text-primary">No recent activity</h3>
        <p className="mt-1 max-w-[280px] text-xs font-medium text-secondary">
          Your recently updated notes will appear here automatically.
        </p>
      </div>
    )}
  </div>
);
}