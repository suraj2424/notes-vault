'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, LogOut } from 'lucide-react';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import { cn } from '@/lib/utils';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'] });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400' });

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className={dmSans.className}>
      <header className="mb-8 border-b border-slate-100 pb-6 dark:border-[#222222]">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[7px] border border-slate-200 text-slate-500 dark:border-[#2a2a2a] dark:text-[#888888]">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className={cn('text-2xl tracking-tight text-slate-900 dark:text-[#ededed]', dmSerif.className)}>Settings</h1>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-[#888888]">Manage your account preferences.</p>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="rounded-[10px] border border-slate-200 bg-white p-6 overflow-hidden dark:border-[#2a2a2a] dark:bg-[#161616]">
          <h2 className="mb-5 flex items-center gap-2 text-[13px] font-medium text-slate-900 dark:text-[#ededed]">
            <User className="h-4 w-4 text-slate-500 dark:text-[#888888]" />
            Profile Information
          </h2>
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-[7px] border border-slate-200 bg-slate-50 text-slate-400 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#888888]">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-[15px] font-medium text-slate-900 dark:text-[#ededed]">{user.name}</h3>
              <p className="text-[13px] text-slate-500 dark:text-[#888888]">{user.email}</p>
              <div className="mt-2 inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-[10.5px] font-medium uppercase tracking-wider text-slate-500 dark:bg-[#1e1e1e] dark:text-[#888888]">
                Active Account
              </div>
            </div>
          </div>
        </section>

        {/* Preferences Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SettingsCard
            icon={<Bell className="h-5 w-5" />}
            title="Notifications"
            description="Configure how you receive alerts and updates."
          />
          <SettingsCard
            icon={<Shield className="h-5 w-5" />}
            title="Privacy & Security"
            description="Manage your data and security preferences."
          />
          <SettingsCard
            icon={<Palette className="h-5 w-5" />}
            title="Appearance"
            description="Customize the look and feel of NoteVault."
          />
          <div className="rounded-[10px] border border-slate-200 bg-white p-5 transition-colors hover:border-red-200 hover:bg-red-50/30 dark:border-[#2a2a2a] dark:bg-[#161616] dark:hover:border-red-900 dark:hover:bg-red-950/30">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[7px] border border-slate-200 text-slate-400 dark:border-[#2a2a2a] dark:text-[#555555]">
              <LogOut className="h-5 w-5" />
            </div>
            <h3 className="mb-1 text-[15px] font-medium text-slate-900 dark:text-[#ededed]">Sign Out</h3>
            <p className="mb-4 text-[13px] text-slate-500 dark:text-[#888888]">Log out of your account on this device.</p>
            <button
              onClick={logout}
              className="text-[12.5px] font-medium text-red-400 hover:text-red-500 transition-colors dark:hover:text-red-300"
            >
              Logout now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-[10px] border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-[#2a2a2a] dark:bg-[#161616] dark:hover:border-[#3a3a3a] dark:hover:bg-[#1e1e1e]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[7px] border border-slate-200 text-slate-500 dark:border-[#2a2a2a] dark:text-[#888888]">
        {icon}
      </div>
      <h3 className="mb-1 text-[15px] font-medium text-slate-900 dark:text-[#ededed]">{title}</h3>
      <p className="text-[13px] text-slate-500 dark:text-[#888888]">{description}</p>
    </div>
  );
}
