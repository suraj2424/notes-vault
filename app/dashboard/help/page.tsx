'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { HelpCircle, Book, MessageCircle, ExternalLink, Code2, BookOpen, FileText } from 'lucide-react';

export default function HelpPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="font-sans">
      <header className="mb-10 text-center border-b border-neutral-100 pb-8 dark:border-[#222222]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[7px] border border-neutral-200 text-neutral-500 dark:border-[#2a2a2a] dark:text-[#888888]">
          <HelpCircle className="h-7 w-7" />
        </div>
        <h1 className="text-2xl tracking-tight text-neutral-900 dark:text-[#ededed] font-serif">How can we help?</h1>
        <p className="mt-2 text-[13px] text-neutral-500 dark:text-[#888888]">Everything you need to know about using NoteVault.</p>
      </header>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <section className="space-y-5">
          <h2 className="flex items-center gap-2 text-[15px] font-medium text-neutral-900 dark:text-[#ededed]">
            <Book className="h-5 w-5 text-neutral-500 dark:text-[#888888]" />
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

        <section className="space-y-5">
          <h2 className="flex items-center gap-2 text-[15px] font-medium text-neutral-900 dark:text-[#ededed]">
            <MessageCircle className="h-5 w-5 text-neutral-500 dark:text-[#888888]" />
            Support & Feedback
          </h2>
          <div className="rounded-[10px] border border-neutral-200 bg-white p-6 overflow-hidden dark:border-[#2a2a2a] dark:bg-[#161616]">
            <p className="mb-5 text-[13px] text-neutral-500 dark:text-[#888888]">Have a question or found a bug? We&apos;re here to help.</p>
            <div className="space-y-3">
              <button className="flex w-full items-center justify-between rounded-[7px] border border-neutral-200 bg-neutral-50 px-4 py-3 text-[12.5px] font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-100 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#888888] dark:hover:border-[#3a3a3a] dark:hover:bg-[#232323]">
                Contact Support
                <ExternalLink className="h-4 w-4 text-neutral-400 dark:text-[#555555]" />
              </button>
              <button className="flex w-full items-center justify-between rounded-[7px] border border-neutral-200 bg-neutral-50 px-4 py-3 text-[12.5px] font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-100 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#888888] dark:hover:border-[#3a3a3a] dark:hover:bg-[#232323]">
                Report a Bug
                <ExternalLink className="h-4 w-4 text-neutral-400 dark:text-[#555555]" />
              </button>
              <button className="flex w-full items-center justify-between rounded-[7px] border border-neutral-200 bg-neutral-50 px-4 py-3 text-[12.5px] font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-100 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#888888] dark:hover:border-[#3a3a3a] dark:hover:bg-[#232323]">
                Feature Request
                <ExternalLink className="h-4 w-4 text-neutral-400 dark:text-[#555555]" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function HelpItem({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) {
  return (
    <div className="rounded-[10px] border border-neutral-200 bg-white p-5 overflow-hidden dark:border-[#2a2a2a] dark:bg-[#161616]">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-neutral-200 text-neutral-500 dark:border-[#2a2a2a] dark:text-[#888888]">
          {icon}
        </div>
        <h3 className="text-[15px] font-medium text-neutral-900 dark:text-[#ededed]">{title}</h3>
      </div>
      <p className="text-[13px] leading-relaxed text-neutral-500 dark:text-[#888888]">{content}</p>
    </div>
  );
}
