'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, LogOut } from 'lucide-react';
import Image from 'next/image';

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-4xl">
            <header className="mb-10">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary text-white">
                  <SettingsIcon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="font-sans text-3xl font-bold text-neutral-900">Settings</h1>
                  <p className="mt-1 text-neutral-500">Manage your account preferences and application settings.</p>
                </div>
              </div>
            </header>

            <div className="space-y-6">
              {/* Profile Section */}
              <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 flex items-center gap-2 font-sans text-xl font-bold text-neutral-900">
                  <User className="h-5 w-5 text-brand-primary" />
                  Profile Information
                </h2>
                <div className="flex items-center gap-6">
                  {user.photoURL ? (
                    <Image 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      width={80} 
                      height={80} 
                      className="rounded-full border-4 border-neutral-50 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                      <User className="h-10 w-10" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">{user.displayName}</h3>
                    <p className="text-neutral-500">{user.email}</p>
                    <div className="mt-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-brand-primary">
                      Google Account Connected
                    </div>
                  </div>
                </div>
              </section>

              {/* Preferences Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <SettingsCard 
                  icon={<Bell className="h-5 w-5" />} 
                  title="Notifications" 
                  description="Configure how you receive alerts and updates."
                  disabled
                />
                <SettingsCard 
                  icon={<Shield className="h-5 w-5" />} 
                  title="Privacy & Security" 
                  description="Manage your data and security preferences."
                  disabled
                />
                <SettingsCard 
                  icon={<Palette className="h-5 w-5" />} 
                  title="Appearance" 
                  description="Customize the look and feel of NoteVault."
                  disabled
                />
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50/30">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1 font-bold text-neutral-900">Sign Out</h3>
                  <p className="mb-4 text-sm text-neutral-500">Log out of your account on this device.</p>
                  <button 
                    onClick={logout}
                    className="text-sm font-bold text-rose-500 hover:underline"
                  >
                    Logout now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SettingsCard({ icon, title, description, disabled }: { icon: React.ReactNode, title: string, description: string, disabled?: boolean }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm opacity-60">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-400">
        {icon}
      </div>
      <h3 className="mb-1 font-bold text-neutral-900">{title}</h3>
      <p className="mb-4 text-sm text-neutral-500">{description}</p>
      {disabled && (
        <span className="text-[0.7rem] font-bold uppercase tracking-widest text-neutral-400">Coming Soon</span>
      )}
    </div>
  );
}
