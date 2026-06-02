import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { HelpCircle, Book, MessageCircle, ExternalLink, Code2, BookOpen, FileText } from 'lucide-react';

export const revalidate = 60;

export default async function HelpPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/auth/login');
  }

  return (
    <div className="mx-auto max-w-4xl font-sans">
      <header className="mb-10 text-center border-b border-default pb-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[7px] border border-default bg-bg-muted text-secondary">
          <HelpCircle className="h-7 w-7" />
        </div>
        <h1 className="text-2xl tracking-tight text-primary font-serif">How can we help?</h1>
        <p className="mt-2 text-[13px] text-secondary">Everything you need to know about using NoteVault.</p>
      </header>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <section className="space-y-5">
          <h2 className="flex items-center gap-2 text-[15px] font-medium text-primary">
            <Book className="h-5 w-5 text-secondary" />
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
          <h2 className="flex items-center gap-2 text-[15px] font-medium text-primary">
            <MessageCircle className="h-5 w-5 text-secondary" />
            Support & Feedback
          </h2>
          <div className="rounded-[10px] border border-default bg-surface p-6 overflow-hidden">
            <p className="mb-5 text-[13px] text-secondary">Have a question or found a bug? We&apos;re here to help.</p>
            <div className="space-y-3">
              <a
                href="mailto:support@notevault.app"
                className="flex w-full items-center justify-between rounded-[7px] border border-default bg-bg-muted px-4 py-3 text-[12.5px] font-medium text-secondary transition-colors hover:border-border hover:bg-surface-hover"
              >
                Contact Support
                <ExternalLink className="h-4 w-4 text-muted" />
              </a>
              <a
                href="https://github.com/notevault/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-between rounded-[7px] border border-default bg-bg-muted px-4 py-3 text-[12.5px] font-medium text-secondary transition-colors hover:border-border hover:bg-surface-hover"
              >
                Report a Bug
                <ExternalLink className="h-4 w-4 text-muted" />
              </a>
              <a
                href="https://github.com/notevault/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-between rounded-[7px] border border-default bg-bg-muted px-4 py-3 text-[12.5px] font-medium text-secondary transition-colors hover:border-border hover:bg-surface-hover"
              >
                Feature Request
                <ExternalLink className="h-4 w-4 text-muted" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function HelpItem({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) {
  return (
    <div className="rounded-[10px] border border-default bg-surface p-5 overflow-hidden">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-default bg-bg-muted text-secondary">
          {icon}
        </div>
        <h3 className="text-[15px] font-medium text-primary">{title}</h3>
      </div>
      <p className="text-[13px] leading-relaxed text-secondary">{content}</p>
    </div>
  );
}
