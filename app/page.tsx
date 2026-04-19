'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Shield, Zap, BookOpen, Code2, ArrowRight, MessageSquare, Sun, Moon } from 'lucide-react';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'] });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400' });

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

type NoteType = 'dsa' | 'general' | 'qa';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<NoteType>('dsa');

  return (
    <div
      className={cn(
        'h-screen overflow-hidden bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-neutral-200 dark:selection:bg-neutral-800',
        dmSans.className
      )}
    >
      {/* Slim Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[5px] bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-1.5 h-1.5 bg-white dark:bg-neutral-900 rounded-[1px]" />
              <div className="w-1.5 h-1.5 bg-white/50 dark:bg-neutral-900/50 rounded-[1px]" />
              <div className="w-1.5 h-1.5 bg-white/50 dark:bg-neutral-900/50 rounded-[1px]" />
              <div className="w-1.5 h-1.5 bg-white/20 dark:bg-neutral-900/20 rounded-[1px]" />
            </div>
          </div>
          <span className={cn('text-lg tracking-tight font-medium', dmSerif.className)}>
            NoteVault
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/auth/login"
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors flex items-center gap-2"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl h-[calc(100vh-140px)] px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-start"
        >
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[12px] font-medium uppercase tracking-widest text-neutral-500 mb-6">
            <Zap className="h-3 w-3 fill-current" />
            For Technical Minds
          </div>

          <h1
            className={cn(
              'text-5xl lg:text-6xl leading-[1.05] tracking-tighter mb-6',
              dmSerif.className
            )}
          >
            Your technical memory, <br />
            <span className="text-neutral-400 dark:text-neutral-600">
              systematically organized.
            </span>
          </h1>

          <p className="max-w-md text-sm leading-relaxed text-neutral-500 dark:text-neutral-500 mb-10">
            A specialized workspace for DSA mastery, structured documentation, and interview
            preparation. Built for speed, designed for clarity.
          </p>

          <div className="flex items-center gap-4 mb-12">
            <Link
              href="/auth/login"
              className="group flex items-center gap-2 h-11 px-6 rounded-[8px] bg-neutral-900 text-sm font-medium text-white transition-all hover:bg-neutral-800 active:scale-95 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Start Your Vault
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <div className="flex items-center gap-2 text-[12px] text-neutral-400">
              <Shield className="h-3.5 w-3.5" />
              <span>Private & Encrypted</span>
            </div>
          </div>

          {/* Interactive Task Buttons */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-md">
            <TaskButton
              active={activeTab === 'dsa'}
              onClick={() => setActiveTab('dsa')}
              icon={<Code2 className="h-4 w-4" />}
              label="DSA"
            />
            <TaskButton
              active={activeTab === 'general'}
              onClick={() => setActiveTab('general')}
              icon={<BookOpen className="h-4 w-4" />}
              label="General"
            />
            <TaskButton
              active={activeTab === 'qa'}
              onClick={() => setActiveTab('qa')}
              icon={<MessageSquare className="h-4 w-4" />}
              label="Q&A"
            />
          </div>
        </motion.div>

        {/* Right Column: Visual Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative h-[480px] w-full rounded-xl border border-neutral-200 bg-neutral-50/50 p-2 dark:border-neutral-800 dark:bg-neutral-900/40 overflow-hidden"
        >
          <div className="h-full w-full rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Window Controls */}
            <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
            </div>

            {/* Dynamic Viewport */}
            <div className="flex-1 p-6 font-mono text-[13px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'dsa' && <DSAMockup />}
                  {activeTab === 'general' && <GeneralMockup />}
                  {activeTab === 'qa' && <QAMockup />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 left-8 right-8 flex justify-between items-center text-[12px] font-medium uppercase tracking-[0.2em] text-neutral-400">
        <p>© 2026 NoteVault</p>
        <div className="flex gap-6 lowercase tracking-normal font-normal">
          <a
            href="#"
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            privacy
          </a>
          <a
            href="#"
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            terms
          </a>
        </div>
      </footer>
    </div>
  );
}

/**
 * UI Sub-components
 */

function TaskButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-2 py-3 rounded-lg border transition-all duration-200',
        active
          ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 shadow-lg'
          : 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600 bg-transparent text-neutral-500'
      )}
    >
      {icon}
      <span className="text-[12px] font-bold tracking-wider uppercase">{label}</span>
    </button>
  );
}

function DSAMockup() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <span className="px-2 py-0.5 rounded-sm bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-[11px] font-bold uppercase">
          DSA
        </span>
        <span className="px-2 py-0.5 rounded-sm border border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase text-[11px]">
          Medium
        </span>
      </div>
      <div className="p-4 rounded-md bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <code className="text-neutral-600 dark:text-neutral-400">
          {'// Two Sum Implementation'}
        </code>
        <pre className="mt-2 text-neutral-800 dark:text-neutral-300 leading-relaxed">
          {`def twoSum(nums, target):\n    prevMap = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in prevMap:\n            return [prevMap[diff], i]\n        prevMap[n] = i`}
        </pre>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 border border-neutral-100 dark:border-neutral-800 rounded bg-white dark:bg-neutral-900/50">
          <span className="text-neutral-600 dark:text-neutral-400 block mb-0.5 uppercase text-[11px]">Time</span>
          <span className="text-neutral-900 dark:text-neutral-100 font-bold text-sm">O(n)</span>
        </div>
        <div className="p-3 border border-neutral-100 dark:border-neutral-800 rounded bg-white dark:bg-neutral-900/50">
          <span className="text-neutral-600 dark:text-neutral-400 block mb-0.5 uppercase text-[11px]">Space</span>
          <span className="text-neutral-900 dark:text-neutral-100 font-bold text-sm">O(n)</span>
        </div>
      </div>
    </div>
  );
}

function GeneralMockup() {
  return (
    <div className="space-y-4 px-2">
      <h2
        className={cn(
          'text-xl tracking-tight text-neutral-900 dark:text-neutral-100',
          dmSerif.className
        )}
      >
        System Architecture
      </h2>
      <div className="h-[1px] w-full bg-neutral-100 dark:bg-neutral-800" />
      <p className="text-neutral-500 leading-relaxed text-sm font-sans">
        Microservices vs Monolith: Choosing the right pattern for NoteVault&apos;s scaling
        strategy...
      </p>
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-2 bg-neutral-50/50 dark:bg-neutral-800/50 rounded border border-dashed border-neutral-200 dark:border-neutral-800">
          <Zap className="h-3 w-3 text-neutral-400" />
          <span className="text-neutral-600 dark:text-neutral-400">Low Latency Retrieval</span>
        </div>
        <div className="flex items-center gap-3 p-2 bg-neutral-50/50 dark:bg-neutral-800/50 rounded border border-dashed border-neutral-200 dark:border-neutral-800">
          <Zap className="h-3 w-3 text-neutral-400" />
          <span className="text-neutral-600 dark:text-neutral-400">Horizontal Scaling</span>
        </div>
      </div>
    </div>
  );
}

function QAMockup() {
  return (
    <div className="space-y-6">
      <div className="p-4 border-l-2 border-neutral-900 dark:border-neutral-100 bg-neutral-50/50 dark:bg-neutral-900/30">
        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mb-1 uppercase tracking-widest font-sans">
          Topic: OS Fundamentals
        </span>
        <p className="text-neutral-900 dark:text-neutral-100 font-medium text-[13px] font-sans">
          What is a Deadlock and its 4 conditions?
        </p>
      </div>
      <div className="space-y-2">
        <span className="text-[11px] text-neutral-400 dark:text-neutral-600 block uppercase tracking-widest mb-3 font-sans">
          Key Takeaways
        </span>
        {['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait'].map(
          (point, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400 font-sans text-[12px]"
            >
              <div className="w-5 h-5 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-[11px] font-bold">
                {i + 1}
              </div>
              {point}
            </div>
          )
        )}
      </div>
    </div>
  );
}