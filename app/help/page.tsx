'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { HelpCircle, Book, MessageCircle, ExternalLink, Code2, BookOpen, FileText } from 'lucide-react';

export default function HelpPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-4xl">
            <header className="mb-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-blue-600/20">
                <HelpCircle className="h-8 w-8" />
              </div>
              <h1 className="font-sans text-4xl font-bold text-neutral-900">How can we help?</h1>
              <p className="mt-2 text-lg text-neutral-500">Everything you need to know about using NoteVault effectively.</p>
            </header>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <section className="space-y-6">
                <h2 className="flex items-center gap-2 font-sans text-xl font-bold text-neutral-900">
                  <Book className="h-5 w-5 text-brand-primary" />
                  Quick Start Guide
                </h2>
                <div className="space-y-4">
                  <HelpItem 
                    icon={<Code2 className="h-4 w-4" />} 
                    title="DSA Preparation" 
                    content="Use the DSA template to track LeetCode problems, time complexity, and multiple language implementations." 
                  />
                  <HelpItem 
                    icon={<BookOpen className="h-4 w-4" />} 
                    title="Topic Q&A" 
                    content="Perfect for interview prep. Store questions and detailed answers with key takeaways." 
                  />
                  <HelpItem 
                    icon={<FileText className="h-4 w-4" />} 
                    title="General Notes" 
                    content="Standard markdown-supported notes for anything else you need to remember." 
                  />
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="flex items-center gap-2 font-sans text-xl font-bold text-neutral-900">
                  <MessageCircle className="h-5 w-5 text-brand-primary" />
                  Support & Feedback
                </h2>
                <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
                  <p className="mb-6 text-neutral-600">Have a question or found a bug? We&apos;re here to help you get the most out of NoteVault.</p>
                  <div className="space-y-3">
                    <button className="flex w-full items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-700 transition-all hover:border-brand-primary hover:bg-white">
                      Contact Support
                      <ExternalLink className="h-4 w-4 text-neutral-400" />
                    </button>
                    <button className="flex w-full items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-700 transition-all hover:border-brand-primary hover:bg-white">
                      Report a Bug
                      <ExternalLink className="h-4 w-4 text-neutral-400" />
                    </button>
                    <button className="flex w-full items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-700 transition-all hover:border-brand-primary hover:bg-white">
                      Feature Request
                      <ExternalLink className="h-4 w-4 text-neutral-400" />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function HelpItem({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-50 text-brand-primary">
          {icon}
        </div>
        <h3 className="font-bold text-neutral-900">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-neutral-500">{content}</p>
    </div>
  );
}
