'use client';

import { useState } from 'react';
import { Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { NoteType } from '@/types';
import { NOTE_TYPE_META } from '@/lib/note-styles';

interface Note {
  id: string;
  title: string;
  type: NoteType;
  isFavorite: boolean;
  tags: string[];
  updatedAt: string;
}

interface RecentClientProps {
  userName: string;
  initialNotes: Note[];
}

const NOTE_TYPE_STYLES = NOTE_TYPE_META;

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

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-6 font-sans">
      <header className="sticky top-0 z-30 -mx-5 lg:-mx-8 border-b border-default bg-surface px-5 lg:px-8">
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-secondary">
                <Clock className="h-3.5 w-3.5" />
                Recent Activity
              </div>
              <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight text-primary sm:text-3xl">
                Recent Notes
              </h1>
              <p className="mt-1 text-xs font-medium text-secondary">
                {firstName ? `${firstName}, here are your latest notes and updates.` : 'Your latest notes and updates.'}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href="/dashboard/notes/new"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1A1D1E] px-4 text-xs font-bold text-white transition-colors duration-100 hover:bg-[#00A3A3] active:scale-[0.98] dark:bg-[#E4E6EB] dark:text-[#111111] dark:hover:bg-[#00E0E0]"
              >
                New Note
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mt-5">
        {notes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {notes.map((note) => {
              const meta = NOTE_TYPE_STYLES[note.type];
              const Icon = meta.icon;

              return (
                <Link
                  key={note.id}
                  href={`/dashboard/notes/${note.id}`}
                  className="group relative flex h-full min-h-44 flex-col overflow-hidden rounded-lg border border-default bg-surface transition-colors duration-100 hover:border-[#00A3A3]/40 dark:hover:border-[#00E0E0]/30"
                >
                  <div className="relative z-10 flex h-full flex-col p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border', meta.iconWrap)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-primary transition-colors duration-100 group-hover:text-secondary">
                          {note.title}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(note.id, note.isFavorite);
                        }}
                        className={cn(
                          'relative z-20 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-100',
                          note.isFavorite
                            ? 'border-amber-500/20 bg-amber-500/5 text-amber-500'
                            : 'border-default bg-surface text-secondary/60 hover:border-amber-500/20 hover:bg-amber-500/5 hover:text-amber-500'
                        )}
                        aria-label={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className={cn('h-3.5 w-3.5', note.isFavorite && 'fill-amber-500')} />
                      </button>
                    </div>

                    <div className="mt-auto pt-3">
                      <div className="flex items-center justify-between gap-3 border-t border-default pt-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn(
                              'inline-flex rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                              meta.typeBadge
                            )}
                          >
                            {meta.label}
                          </span>
                          <span className="truncate text-[11px] font-medium text-secondary">
                            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                          </span>
                        </div>
                        <span className="shrink-0 text-[11px] font-medium text-secondary transition-colors duration-100 group-hover:text-primary">
                          Open
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-default bg-surface/60 px-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-default bg-bg-muted text-secondary">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-primary">No recent activity</h3>
            <p className="mt-1 max-w-sm text-sm font-medium text-secondary">
              Your recently updated notes will appear here automatically.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
