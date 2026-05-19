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
      <div className="mx-auto max-w-4xl font-sans">
        <header className="pb-6">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[#687076] dark:text-[#A0A0A0]">
            Organize
          </p>
          <h1 className="text-xl font-bold tracking-tight text-[#1A1D1E] dark:text-[#E4E6EB]">
            Tags Library
          </h1>
          <p className="mt-1 text-xs font-medium text-[#687076]/70 dark:text-[#A0A0A0]/60">
            Explore notes by topics and keywords.
          </p>
        </header>

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#E6E8EB] bg-[#FFFFFF] py-24 text-center dark:border-[#2D2D2D] dark:bg-[#1A1A1A]">
          <Hash className="mb-3 h-8 w-8 text-[#687076]/30 dark:text-[#A0A0A0]/20" />
          <h3 className="text-sm font-semibold text-[#1A1D1E] dark:text-[#E4E6EB]">No tags yet</h3>
          <p className="mt-1 max-w-[280px] text-xs font-medium text-[#687076]/60 dark:text-[#A0A0A0]/50">
            Tags will appear automatically as you attach them to your notes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl font-sans">
      <header className="pb-6">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[#687076] dark:text-[#A0A0A0]">
          Organize
        </p>
        <h1 className="text-xl font-bold tracking-tight text-[#1A1D1E] dark:text-[#E4E6EB]">
          Tags Library
        </h1>
        <p className="mt-1 text-xs font-medium text-[#687076]/70 dark:text-[#A0A0A0]/60">
          Explore notes by topics and keywords.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tags.map((tag) => (
          <Link
            key={tag.name}
            href={`/dashboard/notes?search=${encodeURIComponent(tag.name)}`}
            className="group rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] p-4 transition-colors duration-100 hover:bg-[#F4F7F6]/50 dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:hover:bg-[#111111]/40"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#E6E8EB] bg-[#F4F7F6] text-[#687076] transition-colors duration-100 group-hover:bg-[#00A3A3] group-hover:text-[#FFFFFF] group-hover:border-transparent dark:border-[#2D2D2D] dark:bg-[#111111] dark:text-[#A0A0A0] dark:group-hover:bg-[#00E0E0] dark:group-hover:text-[#111111]">
                  <Hash className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-xs font-semibold text-[#1A1D1E] transition-colors duration-100 group-hover:text-[#00A3A3] dark:text-[#E4E6EB] dark:group-hover:text-[#00E0E0]">
                    #{tag.name}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#687076]/70 dark:text-[#A0A0A0]/60 mt-0.5">
                    {tag.count} {tag.count === 1 ? 'record' : 'records'}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#687076]/40 transition-colors duration-100 group-hover:text-[#00A3A3] dark:text-[#A0A0A0]/30 dark:group-hover:text-[#00E0E0]" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}