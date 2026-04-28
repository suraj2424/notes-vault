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
        <body suppressHydrationWarning className="bg-neutral-100 dark:bg-neutral-900 text-[var(--color-text-primary)] antialiased">
          <ThemeProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </ThemeProvider>
          <Script
            id="theme-init"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const stored = localStorage.getItem('theme');
                    if (stored === 'dark' || stored === 'light') {
                      document.documentElement.classList.add(stored);
                    } else if (stored === 'system') {
                      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      document.documentElement.classList.add(isDark ? 'dark' : 'light');
                    } else {
                      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      document.documentElement.classList.add(isDark ? 'dark' : 'light');
                    }
                  } catch (e) {
                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.classList.add(isDark ? 'dark' : 'light');
                  }
                })();
              `,
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
