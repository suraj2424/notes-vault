'use client';

import {useState} from 'react';
import { useRouter } from 'next/navigation';
import { Hash, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import { cn } from '@/lib/utils';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'] });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400' });

interface Tag {
  name: string;
  count: number;
}

interface TagsClientProps {
  initialTags: Tag[];
}

export default function TagsClient({ initialTags }: TagsClientProps) {
  const router = useRouter();
  const [tags] = useState<Tag[]>(initialTags);

  if (tags.length === 0) {
    return (
      <div className={dmSans.className}>
        <header className="mb-8 border-b border-slate-100 pb-6 dark:border-[#222222]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[7px] border border-slate-200 text-slate-500 dark:border-[#2a2a2a] dark:text-[#888888]">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <h1 className={cn('text-2xl tracking-tight text-slate-900 dark:text-[#ededed]', dmSerif.className)}>Tags Library</h1>
              <p className="mt-1 text-[13px] text-slate-500 dark:text-[#888888]">Explore notes by topics and keywords.</p>
            </div>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-slate-200 bg-white py-24 text-center dark:border-[#2a2a2a] dark:bg-[#161616]">
          <Hash className="h-10 w-10 text-slate-300 mb-4 dark:text-[#555555]" />
          <h3 className={cn('text-[17px] text-slate-900 dark:text-[#ededed]', dmSerif.className)}>No tags yet</h3>
          <p className="mt-2 max-w-[320px] text-[13px] text-slate-500 dark:text-[#888888]">
            Tags will appear as you add them to your notes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={dmSans.className}>
      <header className="mb-8 border-b border-slate-100 pb-6 dark:border-[#222222]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[7px] border border-slate-200 text-slate-500 dark:border-[#2a2a2a] dark:text-[#888888]">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <h1 className={cn('text-2xl tracking-tight text-slate-900 dark:text-[#ededed]', dmSerif.className)}>Tags Library</h1>
              <p className="mt-1 text-[13px] text-slate-500 dark:text-[#888888]">Explore notes by topics and keywords.</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tags.map((tag) => (
          <Link
            key={tag.name}
            href={`/dashboard/notes?search=${encodeURIComponent(tag.name)}`}
            className="group flex items-center justify-between rounded-[10px] border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-[#2a2a2a] dark:bg-[#161616] dark:hover:border-[#3a3a3a] dark:hover:bg-[#1e1e1e]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[7px] border border-slate-200 text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600 dark:border-[#2a2a2a] dark:text-[#555555] dark:group-hover:border-[#3a3a3a] dark:group-hover:text-[#ededed]">
                <Hash className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-medium text-slate-900 group-hover:text-slate-600 transition-colors dark:text-[#ededed] dark:group-hover:text-[#888888]">{tag.name}</h3>
                <p className="text-[11px] text-slate-400 dark:text-[#555555]">{tag.count} {tag.count === 1 ? 'note' : 'notes'}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors dark:text-[#555555] dark:group-hover:text-[#ededed]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
