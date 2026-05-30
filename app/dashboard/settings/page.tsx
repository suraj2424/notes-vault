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
    <div className="mx-auto max-w-4xl font-sans">
      <header className="pb-6">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[#687076] dark:text-[#A0A0A0]">
          Preferences
        </p>
        <h1 className="text-xl font-bold tracking-tight text-[#1A1D1E] dark:text-[#E4E6EB]">
          Settings
        </h1>
        <p className="mt-1 text-xs font-medium text-[#687076]/70 dark:text-[#A0A0A0]/60">
          Minimal account and app preferences.
        </p>
      </header>

      <div className="space-y-4">
        {/* Account Settings Section */}
        <section className="rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] p-5 dark:border-[#2D2D2D] dark:bg-[#1A1A1A]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-[#E6E8EB] bg-[#F4F7F6] text-[#687076] dark:border-[#2D2D2D] dark:bg-[#111111] dark:text-[#A0A0A0]">
              <Settings className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#1A1D1E] dark:text-[#E4E6EB]">
                Account
              </h2>
              <p className="text-[11px] font-medium text-[#687076]/70 dark:text-[#A0A0A0]/60">
                Your current signed-in profile.
              </p>
            </div>
          </div>

          <div className="rounded border border-[#E6E8EB] bg-[#F4F7F6]/50 px-4 py-3 dark:border-[#2D2D2D] dark:bg-[#111111]/30">
            <p className="text-xs font-semibold text-[#1A1D1E] dark:text-[#E4E6EB]">{fullName}</p>
            <p className="mt-0.5 text-[11px] font-medium text-[#687076]/80 dark:text-[#A0A0A0]/70">{email}</p>
          </div>
        </section>

        {/* Display / Privacy Split Grid */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] p-5 dark:border-[#2D2D2D] dark:bg-[#1A1A1A]">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded border border-[#E6E8EB] bg-[#F4F7F6] text-[#687076] dark:border-[#2D2D2D] dark:bg-[#111111] dark:text-[#A0A0A0]">
              <MoonStar className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-xs font-semibold text-[#1A1D1E] dark:text-[#E4E6EB]">
              Appearance
            </h2>
            <p className="mt-1 text-[11px] font-medium text-[#687076]/70 dark:text-[#A0A0A0]/60">
              Theme switching is available from the sidebar.
            </p>
          </div>

          <Link
            href="/user"
            className="group rounded-lg border border-[#E6E8EB] bg-[#FFFFFF] p-5 transition-colors duration-100 hover:bg-[#F4F7F6]/50 active:scale-[0.99] dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:hover:bg-[#111111]/40"
          >
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded border border-[#E6E8EB] bg-[#F4F7F6] text-[#687076] transition-colors duration-100 group-hover:bg-[#1A1D1E] group-hover:text-[#FFFFFF] group-hover:border-transparent dark:border-[#2D2D2D] dark:bg-[#111111] dark:text-[#A0A0A0] dark:group-hover:bg-[#E4E6EB] dark:group-hover:text-[#111111]">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xs font-semibold text-[#1A1D1E] transition-colors duration-100 group-hover:text-[#00A3A3] dark:text-[#E4E6EB] dark:group-hover:text-[#00E0E0]">
                  Security
                </h2>
                <p className="mt-1 text-[11px] font-medium text-[#687076]/70 dark:text-[#A0A0A0]/60">
                  Manage password, sessions, and account details.
                </p>
              </div>
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#687076]/40 transition-colors duration-100 group-hover:text-[#00A3A3] dark:text-[#A0A0A0]/30 dark:group-hover:text-[#00E0E0]" />
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}