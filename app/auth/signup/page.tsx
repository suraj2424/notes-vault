'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'motion/react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import { cn } from '@/lib/utils';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'] });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400' });

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

  const inputClass =
    'w-full h-9 rounded-[7px] border border-neutral-200 bg-neutral-50 px-3.5 text-[14px] text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-300 focus:bg-white transition-colors dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-700 dark:focus:border-neutral-700 dark:focus:bg-neutral-800';

  const labelClass =
    'block text-[12px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-600';

  return (
    <div className={cn('flex h-screen bg-white dark:bg-neutral-950', dmSans.className)}>

      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 h-full flex-col justify-between px-14 py-12 bg-neutral-50 border-r border-neutral-100 dark:bg-neutral-900 dark:border-neutral-800">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-[26px] w-[26px] rounded-[7px] bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="2" width="4" height="4" rx="1" fill="white" className="dark:fill-neutral-900" />
              <rect x="8" y="2" width="4" height="4" rx="1" fill="white" fillOpacity="0.5" className="dark:fill-neutral-900" />
              <rect x="2" y="8" width="4" height="4" rx="1" fill="white" fillOpacity="0.5" className="dark:fill-neutral-900" />
              <rect x="8" y="8" width="4" height="4" rx="1" fill="white" fillOpacity="0.3" className="dark:fill-neutral-900" />
            </svg>
          </div>
          <span className={cn('text-[18px] tracking-tight text-neutral-900 dark:text-neutral-100', dmSerif.className)}>
            Notes Vault
          </span>
        </Link>

        {/* Headline */}
        <div className="space-y-5">
          <h2 className={cn('text-[40px] tracking-tight leading-tight text-neutral-900 dark:text-neutral-100', dmSerif.className)}>
            Start building your{' '}
            <span className="text-neutral-400 dark:text-neutral-500">
              technical knowledge base.
            </span>
          </h2>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-500 leading-6 max-w-sm">
            Join developers who organize their DSA prep and technical notes in one structured place.
          </p>

          <div className="pt-4 space-y-3">
            {[
              'DSA problem notes with code & complexity',
              'Topic Q&A with key takeaways',
              'Tag-based organization & search',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 flex-shrink-0" />
                <span className="text-[14px] text-neutral-500 dark:text-neutral-500">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[12px] text-neutral-400 dark:text-neutral-600">
          &copy; {2026} Notes Vault
        </p>
      </div>

      {/* Right — Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8">
        <div className="mx-auto w-full max-w-[360px]">

          {/* Back */}
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-1.5 text-[14px] font-medium text-neutral-400 hover:text-neutral-700 dark:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Mobile logo */}
            <div className="mb-8 flex items-center gap-2.5 lg:hidden">
              <div className="h-[26px] w-[26px] rounded-[7px] bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="2" width="4" height="4" rx="1" fill="white" className="dark:fill-neutral-900" />
                  <rect x="8" y="2" width="4" height="4" rx="1" fill="white" fillOpacity="0.5" className="dark:fill-neutral-900" />
                  <rect x="2" y="8" width="4" height="4" rx="1" fill="white" fillOpacity="0.5" className="dark:fill-neutral-900" />
                  <rect x="8" y="8" width="4" height="4" rx="1" fill="white" fillOpacity="0.3" className="dark:fill-neutral-900" />
                </svg>
              </div>
              <span className={cn('text-[18px] tracking-tight text-neutral-900 dark:text-neutral-100', dmSerif.className)}>
                Notes Vault
              </span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className={cn('text-[26px] tracking-tight text-neutral-900 dark:text-neutral-100', dmSerif.className)}>
                Create account
              </h1>
              <p className="mt-1.5 text-[14px] text-neutral-500 dark:text-neutral-500">
                Start organizing your technical knowledge today
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {error && (
                <div className="rounded-[7px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-500 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className={labelClass}>Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className={labelClass}>Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a password"
                    className={cn(inputClass, 'pr-10')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-700 dark:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                    className={cn(inputClass, 'pr-10', confirmPassword && password !== confirmPassword
                      ? 'border-red-300 dark:border-red-800'
                      : ''
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-700 dark:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[12px] text-red-400">Passwords do not match</p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-9 rounded-[7px] bg-neutral-900 text-[14px] font-medium text-white hover:bg-neutral-700 transition-colors disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>

            {/* Footer */}
            <p className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 text-center text-[14px] text-neutral-400 dark:text-neutral-600">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}