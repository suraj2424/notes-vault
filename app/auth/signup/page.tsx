'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'motion/react';
import { Eye, EyeOff, ArrowLeft, UserPlus } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await signup(name, email, password);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Signup failed');
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0f0f0f]">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-50 border-r border-neutral-100 h-full flex-col justify-center px-16 dark:bg-[#161616] dark:border-[#222222]">
        <Link href="/" className="flex items-center gap-3 mb-16">
          <div className="h-10 w-10 bg-[#1a1a1a] dark:bg-white" />
          <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-[#ededed]">NoteVault</span>
        </Link>
        <h2 className="text-4xl font-bold tracking-tight text-neutral-900 leading-tight dark:text-[#ededed]">
          Your technical memory,{' '}
          <span className="text-neutral-700 dark:text-[#aaaaaa]">
            systematically organized.
          </span>
        </h2>
        <p className="mt-6 text-base text-neutral-500 leading-relaxed dark:text-[#888888]">
          Join thousands of developers who organize their DSA prep and technical knowledge with NoteVault.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 px-8 max-w-md mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 mb-8 dark:text-[#888888] dark:hover:text-[#ededed]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 bg-[#1a1a1a] lg:hidden dark:bg-white" />
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-[#ededed]">Create account</h1>
            </div>
            <p className="text-neutral-500 dark:text-[#888888]">
              Start organizing your technical knowledge today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-[#ededed]">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1.5 block w-full border border-neutral-200 px-3 py-2.5 text-sm placeholder-neutral-400 focus:border-neutral-300 focus:outline-none focus:ring-0 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#ededed] dark:placeholder:text-[#444444]"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-[#ededed]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 block w-full border border-neutral-200 px-3 py-2.5 text-sm placeholder-neutral-400 focus:border-neutral-300 focus:outline-none focus:ring-0 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#ededed] dark:placeholder:text-[#444444]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-[#ededed]">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full border border-neutral-200 px-3 py-2.5 pr-10 text-sm placeholder-neutral-400 focus:border-neutral-300 focus:outline-none focus:ring-0 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#ededed] dark:placeholder:text-[#444444]"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 dark:text-[#555555] dark:hover:text-[#ededed]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-[#ededed]">
                Confirm Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="block w-full border border-neutral-200 px-3 py-2.5 pr-10 text-sm placeholder-neutral-400 focus:border-neutral-300 focus:outline-none focus:ring-0 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#ededed] dark:placeholder:text-[#444444]"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 dark:text-[#555555] dark:hover:text-[#ededed]"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 dark:bg-[#ededed] dark:text-[#0f0f0f] dark:hover:bg-[#d4d4d4]"
            >
              {loading ? 'Creating account...' : 'Create account'}
              {!loading && <UserPlus className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-500 border-t border-neutral-100 pt-8 dark:text-[#888888] dark:border-[#222222]">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-neutral-600 hover:text-neutral-900 dark:text-[#888888] dark:hover:text-[#ededed]">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}