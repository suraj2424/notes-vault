import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import Script from 'next/script';
import './globals.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'NoteVault | Personal Knowledge & DSA Manager',
  description: 'A premium notes app for serious developers and DSA preparation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning className="bg-[var(--color-bg)] text-[var(--color-text-primary)] antialiased">
          <ThemeProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </ThemeProvider>
           <Script
             id="theme-init"
             src="/theme-init.js"
             strategy="beforeInteractive"
           />
        </body>
      </html>
    </ClerkProvider>
  );
}
