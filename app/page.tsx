'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { LogIn, Shield, Zap, BookOpen, Code2 } from 'lucide-react';

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
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-border bg-white px-4 py-1.5 text-sm font-medium text-brand-muted shadow-sm">
            <Shield className="h-4 w-4 text-brand-primary" />
            <span>Secure & Private Knowledge Management</span>
          </div>
          
          <h1 className="mb-6 font-sans text-6xl font-bold tracking-tight text-brand-text sm:text-7xl">
            Your Personal <span className="text-brand-primary">Second Brain</span> for Coding.
          </h1>
          
          <p className="mb-10 text-lg leading-relaxed text-brand-muted sm:text-xl">
            NoteVault helps you organize DSA problems, topic-wise Q&A, and interview preparation in one premium, high-performance workspace.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={signInWithGoogle}
              className="group flex items-center gap-3 rounded-xl bg-brand-primary px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
            >
              <LogIn className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              Get Started with Google
            </button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="mt-32 grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-3">
          <FeatureCard 
            icon={<Code2 className="h-6 w-6 text-brand-primary" />}
            title="DSA Specialized"
            description="Structured templates for LeetCode, complexities, and multi-language implementations."
          />
          <FeatureCard 
            icon={<BookOpen className="h-6 w-6 text-brand-primary" />}
            title="Topic-wise Q&A"
            description="Master core concepts with dedicated question and answer modules for theory."
          />
          <FeatureCard 
            icon={<Zap className="h-6 w-6 text-amber-500" />}
            title="Blazing Fast"
            description="Built for speed with real-time sync, instant search, and a clean, focused UI."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-12 text-center text-sm text-neutral-500">
        <p>© {new Date().getFullYear()} NoteVault. Built for serious developers.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="flex flex-col items-center rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-50">
        {icon}
      </div>
      <h3 className="mb-2 font-sans text-xl font-bold text-neutral-900">{title}</h3>
      <p className="text-neutral-600">{description}</p>
    </motion.div>
  );
}
