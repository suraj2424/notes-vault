'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { LogIn, Shield, Zap, BookOpen, Code2, ArrowRight } from 'lucide-react';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import { cn } from '@/lib/utils';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'] });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400' });

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0f0f0f]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-8 w-8 rounded-full border-2 border-black dark:border-white border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className={cn('h-screen overflow-y-auto bg-white dark:bg-[#0f0f0f]', dmSans.className)}>
      {/* Navigation */}
      <nav className={cn(
        'mx-auto flex max-w-6xl items-center justify-between px-8 py-6 border-b bg-white dark:bg-[#161616]',
        'border-slate-100 dark:border-[#222222]'
      )}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="h-8 w-8 bg-[#1a1a1a] dark:bg-[#ededed]" />
          <span className={cn('text-[16px] tracking-tight text-slate-900 dark:text-[#ededed]', dmSerif.className)}>NoteVault</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Link
            href="/auth/login"
            className="flex items-center gap-2 h-8 px-3 rounded-[7px] border border-slate-200 text-[12.5px] font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#2a2a2a] dark:text-[#888888] dark:hover:bg-[#1e1e1e] dark:hover:text-[#ededed]"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In
          </Link>
        </motion.div>
      </nav>

      <main className="mx-auto max-w-6xl px-8">
        {/* Hero Section */}
        <section className="flex min-h-[calc(100vh-140px)] flex-col justify-center py-20 border-b border-slate-100 dark:border-[#222222]">
          <motion.div
            style={{ opacity }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10.5px] font-medium uppercase tracking-widest text-slate-500 border border-slate-200 bg-slate-50 mb-8 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#888888]">
              <Zap className="h-3 w-3" />
              For Developers
            </div>

            <h1 className={cn('text-4xl leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-[#ededed]', dmSerif.className)}>
              Your technical memory,{' '}
              <span className="text-slate-600 dark:text-[#888888]">
                systematically organized.
              </span>
            </h1>

            <p className="mt-8 max-w-lg text-[13px] font-normal leading-relaxed text-slate-500 dark:text-[#888888]">
              A high-performance workspace for DSA mastery and interview preparation. Built for speed, designed for focus.
            </p>

            <div className="mt-12 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <Link
                href="/auth/login"
                className="group flex items-center gap-3 h-10 px-7 rounded-[7px] bg-[#1a1a1a] text-[12.5px] font-medium text-white transition-colors hover:bg-slate-800 active:scale-[0.98] dark:bg-[#ededed] dark:text-[#0f0f0f] dark:hover:bg-[#d4d4d4]"
              >
                Start Your Vault
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <div className="flex items-center gap-2 text-[13px] font-normal text-slate-500 dark:text-[#888888]">
                <Shield className="h-4 w-4" />
                <span>Private & Encrypted</span>
              </div>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-5"
          >
            <FeatureItem
              icon={<Code2 className="h-4 w-4" />}
              title="DSA Optimized"
              description="Templates for LeetCode logic and complexity analysis."
            />
            <FeatureItem
              icon={<BookOpen className="h-4 w-4" />}
              title="Topic Modules"
              description="Structured modules for System Design and CS theory."
            />
            <FeatureItem
              icon={<Zap className="h-4 w-4" />}
              title="Instant Search"
              description="Retrieve any code snippet in less than 50 milliseconds."
            />
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-8">
        <div className="mx-auto max-w-6xl flex justify-between items-center text-[11px] font-normal uppercase tracking-widest text-slate-400 dark:text-[#555555]">
          <p>© {new Date().getFullYear()} NoteVault</p>
          <div className="flex gap-8">
            <a href="#" className="transition-colors hover:text-slate-600 hover:dark:text-[#ededed]">Privacy</a>
            <a href="#" className="transition-colors hover:text-slate-600 hover:dark:text-[#ededed]">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-[10px] border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-[#2a2a2a] dark:bg-[#161616] dark:hover:border-[#3a3a3a]"
    >
      <div className="text-slate-900 dark:text-[#ededed]">{icon}</div>
      <h3 className={cn('mt-4 text-[13px] font-medium tracking-tight text-slate-900 dark:text-[#ededed]', dmSerif.className)}>{title}</h3>
      <p className="mt-2 text-[13px] font-normal leading-relaxed text-slate-500 dark:text-[#888888]">{description}</p>
    </motion.div>
  );
}