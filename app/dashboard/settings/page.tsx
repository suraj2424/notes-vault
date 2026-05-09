import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Settings, MoonStar, ShieldCheck, ChevronRight } from 'lucide-react';

export const revalidate = 60;

export default async function SettingsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/auth/login');
  }

  const fullName = user.fullName || user.firstName || 'User';
  const email = user.primaryEmailAddress?.emailAddress || 'No email available';

  return (
    <div className="font-sans">
      <header className="pb-6">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
          Preferences
        </p>
        <h1 className="font-serif text-2xl tracking-tight text-neutral-950 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-[13px] text-neutral-500 dark:text-neutral-400">
          Minimal account and app preferences.
        </p>
      </header>

      <div className="space-y-4">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-900 dark:bg-neutral-950">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold tracking-tight text-neutral-950 dark:text-white">
                Account
              </h2>
              <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
                Your current signed-in profile.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-900 dark:bg-neutral-900/60">
            <p className="text-[14px] font-semibold text-neutral-950 dark:text-white">{fullName}</p>
            <p className="mt-1 text-[12px] text-neutral-500 dark:text-neutral-400">{email}</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-900 dark:bg-neutral-950">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-950 dark:bg-neutral-900 dark:text-white">
              <MoonStar className="h-4 w-4" />
            </div>
            <h2 className="text-[14px] font-semibold tracking-tight text-neutral-950 dark:text-white">
              Appearance
            </h2>
            <p className="mt-1 text-[12px] text-neutral-500 dark:text-neutral-400">
              Theme switching is available from the sidebar.
            </p>
          </div>

          <Link
            href="/user"
            className="group rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950 dark:hover:bg-neutral-900/60"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-950 dark:bg-neutral-900 dark:text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-semibold tracking-tight text-neutral-950 dark:text-white">
                  Security
                </h2>
                <p className="mt-1 text-[12px] text-neutral-500 dark:text-neutral-400">
                  Manage password, sessions, and account details.
                </p>
              </div>
              <ChevronRight className="mt-0.5 h-4 w-4 text-neutral-400 transition-colors group-hover:text-neutral-950 dark:group-hover:text-white" />
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
