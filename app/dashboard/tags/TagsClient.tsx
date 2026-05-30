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
    <div className="mx-auto max-w-7xl font-sans p-6">
      <header className="pb-6">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-secondary">
          Organize
        </p>
        <h1 className="text-xl font-bold tracking-tight text-primary">
          Tags Library
        </h1>
        <p className="mt-1 text-xs font-medium text-secondary/60 dark:text-muted">
          Explore notes by topics and keywords.
        </p>
      </header>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-default bg-surface py-24 text-center">
        <Hash className="mb-3 h-8 w-8 text-muted" />
        <h3 className="text-sm font-semibold text-primary">No tags yet</h3>
        <p className="mt-1 max-w-[280px] text-xs font-medium text-secondary">
          Tags will appear automatically as you attach them to your notes.
        </p>
      </div>
    </div>
  );
}

return (
  <div className="mx-auto max-w-7xl font-sans p-6">
    <header className="pb-6">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-secondary">
        Organize
      </p>
      <h1 className="text-xl font-bold tracking-tight text-primary">
        Tags Library
      </h1>
      <p className="mt-1 text-xs font-medium text-secondary/60 dark:text-muted">
        Explore notes by topics and keywords.
      </p>
    </header>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tags.map((tag) => (
        <Link
          key={tag.name}
          href={`/dashboard/notes?search=${encodeURIComponent(tag.name)}`}
          className="group rounded-lg border border-default bg-surface p-4 transition-colors duration-100 hover:bg-bg-muted"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-default bg-bg-muted text-secondary transition-colors duration-100 group-hover:bg-[#00A3A3] group-hover:text-primary-text group-hover:border-transparent">
                <Hash className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-xs font-semibold text-primary transition-colors duration-100 group-hover:text-[#00A3A3]">
                  #{tag.name}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mt-0.5">
                  {tag.count} {tag.count === 1 ? 'record' : 'records'}
                </p>
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted transition-colors duration-100 group-hover:text-[#00A3A3]" />
          </div>
        </Link>
      ))}
    </div>
  </div>
);
}