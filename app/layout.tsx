import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/use-auth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dm-serif',
});

export const metadata: Metadata = {
  title: 'NoteVault | Personal Knowledge & DSA Manager',
  description: 'A premium notes app for serious developers and DSA preparation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body suppressHydrationWarning className="bg-[var(--color-bg)] text-[var(--color-text-primary)] antialiased">
        <ThemeProvider>
          <ErrorBoundary>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
