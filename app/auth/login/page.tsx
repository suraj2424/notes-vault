'use client';

import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  return (
    <div className="flex h-screen bg-white dark:bg-neutral-950 font-sans">

      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 h-full flex-col justify-between px-16 py-12 bg-neutral-50 border-r border-neutral-200 dark:bg-neutral-900/30 dark:border-neutral-800">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-7 w-7 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center transition-transform group-hover:scale-105">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="2" width="4" height="4" rx="1" fill="white" className="dark:fill-neutral-900" />
              <rect x="8" y="2" width="4" height="4" rx="1" fill="white" fillOpacity="0.7" className="dark:fill-neutral-900" />
              <rect x="2" y="8" width="4" height="4" rx="1" fill="white" fillOpacity="0.7" className="dark:fill-neutral-900" />
              <rect x="8" y="8" width="4" height="4" rx="1" fill="white" fillOpacity="0.4" className="dark:fill-neutral-900" />
            </svg>
          </div>
          <span className="text-xl tracking-tight text-neutral-900 dark:text-neutral-100 font-serif">
            Notes Vault
          </span>
        </Link>

        <div className="space-y-6">
          <h2 className="text-5xl tracking-tight leading-[1.1] text-neutral-900 dark:text-neutral-50 font-serif">
            Your technical memory, <br />
            <span className="text-neutral-400 dark:text-neutral-500">
              systematically organized.
            </span>
          </h2>
          <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
             Access your notes, DSA templates, and interview prep materials — all in one place.
          </p>

          <div className="pt-4 space-y-4">
            {[
              'DSA problem notes with code & complexity',
              'Topic Q&A with key takeaways',
              'Tag-based organization & search',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                   <div className="h-1.5 w-1.5 rounded-full bg-neutral-600 dark:bg-neutral-400" />
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-bold tracking-[0.2em] uppercase">
          &copy; 2026 Notes Vault
        </p>
      </div>

      {/* Right — Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-white dark:bg-neutral-950 px-8 relative">
        
        {/* Back Link - Consistent with Signup */}
        <Link
          href="/"
          className="absolute top-10 left-8 lg:left-12 inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile logo (hidden on LG) */}
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <div className="h-7 w-7 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="2" width="4" height="4" rx="1" fill="white" className="dark:fill-neutral-900" />
                <rect x="8" y="2" width="4" height="4" rx="1" fill="white" fillOpacity="0.7" className="dark:fill-neutral-900" />
                <rect x="2" y="8" width="4" height="4" rx="1" fill="white" fillOpacity="0.7" className="dark:fill-neutral-900" />
                <rect x="8" y="8" width="4" height="4" rx="1" fill="white" fillOpacity="0.4" className="dark:fill-neutral-900" />
              </svg>
            </div>
            <span className="text-xl tracking-tight text-neutral-900 dark:text-neutral-100 font-serif">
              Notes Vault
            </span>
          </div>

          <SignIn 
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-none bg-transparent p-0",
                headerTitle: "font-serif text-2xl text-neutral-900 dark:text-neutral-50",
                headerSubtitle: "text-neutral-500 dark:text-neutral-400",
                socialButtonsBlockButton: "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all",
                formButtonPrimary: "bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 shadow-none normal-case text-sm",
                formFieldLabel: "text-neutral-700 dark:text-neutral-300 font-semibold",
                formFieldInput: "border-neutral-200 dark:border-neutral-800 focus:ring-1 focus:ring-neutral-400 transition-all",
                footer: "hidden", 
              }
            }}
          />

          {/* Custom Footer to match Signup style */}
          <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/signup"
              className="font-bold text-neutral-900 dark:text-neutral-100 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
