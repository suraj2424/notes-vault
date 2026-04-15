'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { LogIn, Shield, Zap, BookOpen, Code2, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-2 font-bold tracking-tighter text-xl">
          <div className="h-5 w-5 bg-slate-900" />
          NoteVault
        </div>
        <button 
          onClick={signInWithGoogle}
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          Sign In
        </button>
      </nav>

      <main className="mx-auto max-w-6xl px-6">
        {/* Hero Section */}
        <section className="py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="max-w-4xl text-5xl font-bold leading-[1.1] tracking-tighter sm:text-7xl lg:text-8xl">
              Your technical memory, <br />
              <span className="text-slate-400 font-medium">systematically organized.</span>
            </h1>
            
            <p className="mt-10 max-w-xl text-lg leading-relaxed text-slate-500 sm:text-xl">
              A high-performance workspace for DSA mastery and interview preparation. Minimalist by design, powerful by default.
            </p>

            <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <button
                onClick={signInWithGoogle}
                className="group flex items-center gap-3 bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
              >
                Start Your Vault
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 sm:ml-6">
                <Shield className="h-4 w-4" />
                Private & Encrypted
              </div>
            </div>
          </motion.div>
        </section>

        {/* Minimal Feature Grid */}
        <section className="grid grid-cols-1 gap-12 border-t border-slate-100 py-20 sm:grid-cols-3">
          <FeatureItem 
            icon={<Code2 className="h-5 w-5" />}
            title="DSA Optimized"
            description="Templates for LeetCode logic and complexity analysis."
          />
          <FeatureItem 
            icon={<BookOpen className="h-5 w-5" />}
            title="Topic Modules"
            description="Structured modules for System Design and CS theory."
          />
          <FeatureItem 
            icon={<Zap className="h-5 w-5" />}
            title="Instant Search"
            description="Retrieve any code snippet in less than 50 milliseconds."
          />
        </section>

        {/* Minimal Preview Card */}
        <section className="pb-32">
          <div className="group relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-200 p-8 lg:p-12">
            <div className="flex items-center gap-4 border-b border-slate-200 pb-8 mb-8">
              <div className="h-3 w-3 rounded-full bg-slate-300" />
              <div className="h-2 w-32 rounded bg-slate-200" />
            </div>
            <div className="space-y-4">
              <div className="h-4 w-1/2 rounded bg-slate-200" />
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="mt-12 h-40 w-full rounded-lg bg-white border border-slate-200 shadow-sm transition-transform duration-500 group-hover:scale-[1.01]" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-12 px-6">
        <div className="mx-auto max-w-6xl flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
          <p>© {new Date().getFullYear()} NoteVault</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="space-y-4">
      <div className="text-slate-900">{icon}</div>
      <h3 className="text-lg font-bold tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}