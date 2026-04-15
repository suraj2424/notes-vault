'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Note } from '@/types';
import { Tags as TagsIcon, Hash, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

export default function TagsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tags, setTags] = useState<{ name: string; count: number }[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const notesRef = collection(db, 'notes');
    const q = query(notesRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allTags: { [key: string]: number } = {};
      snapshot.docs.forEach(doc => {
        const note = doc.data() as Note;
        note.tags?.forEach(tag => {
          allTags[tag] = (allTags[tag] || 0) + 1;
        });
      });

      const sortedTags = Object.entries(allTags)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setTags(sortedTags);
      setIsDataLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-4xl">
            <header className="mb-10">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary text-white">
                  <TagsIcon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="font-sans text-3xl font-bold text-neutral-900">Tags Library</h1>
                  <p className="mt-1 text-neutral-500">Explore and organize your notes by topics and keywords.</p>
                </div>
              </div>
            </header>

            {isDataLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-white border border-neutral-200" />
                ))}
              </div>
            ) : tags.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tags.map((tag) => (
                  <Link
                    key={tag.name}
                    href={`/notes?search=${encodeURIComponent(tag.name)}`}
                    className="group flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:border-brand-primary hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-400 group-hover:bg-blue-50 group-hover:text-brand-primary">
                        <Hash className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900 group-hover:text-brand-primary">{tag.name}</h3>
                        <p className="text-xs text-neutral-400">{tag.count} {tag.count === 1 ? 'note' : 'notes'}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-primary" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-white py-24 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-50">
                  <TagsIcon className="h-10 w-10 text-neutral-300" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">No tags found</h3>
                <p className="mt-2 max-w-[320px] text-neutral-500">Start adding tags to your notes to see them organized here.</p>
                <Link 
                  href="/notes/new"
                  className="mt-8 rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700"
                >
                  Create New Note
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
