'use client';

import { useState } from 'react';
import { Hash, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Tag {
  name: string;
  count: number;
}

interface TagsClientProps {
  initialTags: Tag[];
}

export default function TagsClient({ initialTags }: TagsClientProps) {
  const [tags] = useState<Tag[]>(initialTags);

  if (tags.length === 0) {
    return (
      <div className="font-sans">
        <header className="pb-6">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            Organize
          </p>
          <h1 className="font-serif text-2xl tracking-tight text-neutral-950 dark:text-white">
            Tags Library
          </h1>
          <p className="mt-1 text-[13px] text-neutral-500 dark:text-neutral-400">
            Explore notes by topics and keywords.
          </p>
        </header>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white py-24 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <Hash className="mb-4 h-10 w-10 text-neutral-300 dark:text-neutral-700" />
          <h3 className="font-serif text-[17px] text-neutral-950 dark:text-white">No tags yet</h3>
          <p className="mt-2 max-w-[320px] text-[13px] text-neutral-500 dark:text-neutral-400">
            Tags will appear as you add them to your notes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      <header className="pb-6">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
          Organize
        </p>
        <h1 className="font-serif text-2xl tracking-tight text-neutral-950 dark:text-white">
          Tags Library
        </h1>
        <p className="mt-1 text-[13px] text-neutral-500 dark:text-neutral-400">
          Explore notes by topics and keywords.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tags.map((tag) => (
          <Link
            key={tag.name}
            href={`/dashboard/notes?search=${encodeURIComponent(tag.name)}`}
            className="group rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700/60"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-950 transition-colors group-hover:bg-neutral-900 group-hover:text-white dark:bg-neutral-900 dark:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-950">
                  <Hash className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-[14px] font-semibold tracking-tight text-neutral-950 transition-colors group-hover:text-neutral-700 dark:text-white dark:group-hover:text-neutral-200">
                    {tag.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    {tag.count} {tag.count === 1 ? 'note' : 'notes'}
                  </p>
                </div>
              </div>
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-950 dark:text-neutral-500 dark:group-hover:text-white" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
