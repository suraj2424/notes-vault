'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Note } from '@/types';
import { motion } from 'motion/react';
import { 
  Code2, 
  BookOpen, 
  Star, 
  Clock, 
  Plus,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [stats, setStats] = useState({ total: 0, dsa: 0, qa: 0, favorites: 0 });
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef, 
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
      setRecentNotes(notes);
      setIsDataLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notes');
      setIsDataLoading(false);
    });

    // Stats listener
    const qAll = query(notesRef, where('userId', '==', user.uid));
    const unsubscribeStats = onSnapshot(qAll, (snapshot) => {
      const allNotes = snapshot.docs.map(doc => doc.data() as Note);
      setStats({
        total: allNotes.length,
        dsa: allNotes.filter(n => n.type === 'dsa').length,
        qa: allNotes.filter(n => n.type === 'qa').length,
        favorites: allNotes.filter(n => n.isFavorite).length,
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notes');
    });

    return () => {
      unsubscribe();
      unsubscribeStats();
    };
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-5xl">
            <header className="mb-10 flex items-end justify-between">
              <div>
                <h1 className="font-sans text-3xl font-bold text-neutral-900">
                  Welcome back, {user.displayName?.split(' ')[0]}
                </h1>
                <p className="mt-1 text-neutral-500">Here&apos;s what&apos;s happening in your second brain today.</p>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-neutral-400">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                label="Total Notes" 
                value={stats.total} 
                icon={<TrendingUp className="h-4 w-4 text-brand-primary" />}
                color="bg-blue-50"
              />
              <StatCard 
                label="DSA Solved" 
                value={stats.dsa} 
                icon={<Code2 className="h-4 w-4 text-brand-primary" />}
                color="bg-blue-50"
              />
              <StatCard 
                label="Topic Q&A" 
                value={stats.qa} 
                icon={<BookOpen className="h-4 w-4 text-brand-primary" />}
                color="bg-blue-50"
              />
              <StatCard 
                label="Favorites" 
                value={stats.favorites} 
                icon={<Star className="h-4 w-4 text-brand-primary" />}
                color="bg-blue-50"
              />
            </div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
              {/* Recent Notes */}
              <div className="lg:col-span-2">
                <div className="rounded-xl border border-brand-border bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
                    <h2 className="font-sans text-[0.95rem] font-bold text-brand-text">Recent Activity</h2>
                    <Link href="/notes" className="text-[0.75rem] font-bold text-brand-primary hover:underline">
                      View All
                    </Link>
                  </div>

                  <div className="p-0">
                    {isDataLoading ? (
                      <div className="p-6 space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-12 animate-pulse rounded-lg bg-neutral-50" />)}
                      </div>
                    ) : recentNotes.length > 0 ? (
                      <div className="divide-y divide-brand-border">
                        {recentNotes.map((note) => (
                          <div 
                            key={note.id}
                            className="group flex items-center justify-between px-6 py-4 transition-colors hover:bg-neutral-50"
                          >
                            <Link href={`/notes/${note.id}`} className="flex flex-1 items-center gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-50 text-brand-muted group-hover:bg-white group-hover:text-brand-primary">
                                {note.type === 'dsa' ? <Code2 className="h-5 w-5" /> : 
                                 note.type === 'qa' ? <BookOpen className="h-5 w-5" /> : 
                                 <FileText className="h-5 w-5" />}
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-brand-text group-hover:text-brand-primary">{note.title}</h3>
                                <div className="mt-0.5 flex items-center gap-2 text-[0.75rem] text-brand-muted">
                                  <span className="capitalize">{note.type}</span>
                                  <span>•</span>
                                  <span>{note.updatedAt?.toDate ? formatDistanceToNow(note.updatedAt.toDate(), { addSuffix: true }) : 'Recently'}</span>
                                </div>
                              </div>
                            </Link>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={async (e) => {
                                  e.preventDefault();
                                  try {
                                    await updateDoc(doc(db, 'notes', note.id), {
                                      isFavorite: !note.isFavorite,
                                      updatedAt: new Date()
                                    });
                                  } catch (error) {
                                    handleFirestoreError(error, OperationType.UPDATE, `notes/${note.id}`);
                                  }
                                }}
                                className={cn(
                                  "rounded-lg p-1.5 transition-colors",
                                  note.isFavorite ? "text-amber-500 bg-amber-50" : "text-brand-muted hover:bg-neutral-100 hover:text-brand-text"
                                )}
                              >
                                <Star className={cn("h-4 w-4", note.isFavorite && "fill-amber-500")} />
                              </button>
                              <Link href={`/notes/${note.id}`}>
                                <ArrowRight className="h-4 w-4 text-neutral-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-primary" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <p className="text-sm text-brand-muted">No recent activity found.</p>
                        <Link href="/notes/new" className="mt-4 inline-block text-sm font-bold text-brand-primary hover:underline">
                          Create your first note
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Widgets */}
              <div className="space-y-6">
                <div className="rounded-xl border border-brand-border bg-white shadow-sm">
                  <div className="border-b border-brand-border px-6 py-4">
                    <h3 className="font-sans text-[0.95rem] font-bold text-brand-text">Quick Actions</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-6">
                    <QuickActionBtn icon={<Code2 className="h-4 w-4" />} label="DSA Note" href="/notes/new?type=dsa" />
                    <QuickActionBtn icon={<BookOpen className="h-4 w-4" />} label="Q&A Note" href="/notes/new?type=qa" />
                    <QuickActionBtn icon={<Star className="h-4 w-4" />} label="Favorites" href="/notes?filter=favorites" />
                    <QuickActionBtn icon={<Tags className="h-4 w-4" />} label="Tags" href="/tags" />
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border bg-brand-primary p-6 text-white shadow-sm">
                  <h3 className="font-sans text-[0.95rem] font-bold">DSA Progress</h3>
                  <p className="mt-1 text-[0.75rem] text-blue-100">You&apos;ve solved {stats.dsa} problems so far. Keep it up!</p>
                  <div className="mt-6 h-1.5 w-full rounded-full bg-blue-800">
                    <div 
                      className="h-full rounded-full bg-white transition-all duration-1000" 
                      style={{ width: `${Math.min((stats.dsa / 100) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[0.7rem] font-bold uppercase tracking-wider text-blue-100">
                    <span>Progress</span>
                    <span>{stats.dsa}/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="rounded-xl border border-brand-border bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.75rem] font-bold uppercase tracking-wider text-brand-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold text-brand-text">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickActionBtn({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
  return (
    <Link 
      href={href}
      className="flex flex-col items-center justify-center gap-2 rounded-lg border border-brand-border bg-brand-bg p-4 transition-all hover:border-brand-primary hover:bg-blue-50 hover:text-brand-primary"
    >
      {icon}
      <span className="text-[0.7rem] font-bold uppercase tracking-wider">{label}</span>
    </Link>
  );
}

function FileText({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function Tags({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19" />
      <path d="m9.586 5.586-2.586 2.586a2 2 0 0 0 0 2.828l6.414 6.414a2 2 0 0 0 2.828 0l2.586-2.586a2 2 0 0 0 0-2.828l-6.414-6.414a2 2 0 0 0-2.828 0Z" />
      <circle cx="11" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}
