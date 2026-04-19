'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Tags,
  Clock,
  Settings,
  HelpCircle,
  ChevronUp,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import { useAuth } from '@/hooks/use-auth';
import { ThemeSwitcher } from './ThemeSwitcher';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'] });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400' });

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'All Notes', href: '/dashboard/notes', icon: FileText },
];

const secondaryItems = [
  { name: 'Tags', href: '/dashboard/tags', icon: Tags },
  { name: 'Recent', href: '/dashboard/recent', icon: Clock },
];

const bottomItems = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Help', href: '/dashboard/help', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

      const NavLink = ({
        item,
      }: {
        item: { name: string; href: string; icon: React.ElementType; badge?: string };
      }) => {
        const isActive = pathname === item.href;
        return (
          <Link
            href={item.href}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-[7px] rounded-[7px] text-[14px] font-normal transition-colors',
              isActive
                ? 'bg-neutral-800 text-white font-medium dark:bg-neutral-700 dark:text-neutral-100'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
            )}
          >
            <item.icon className="h-[17px] w-[17px] flex-shrink-0 opacity-70" />
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className="ml-auto text-[11px] font-medium bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full dark:bg-neutral-700 dark:text-neutral-300">
                {item.badge}
              </span>
            )}
          </Link>
        );
      };

   return (
       <aside className="sticky top-0 hidden h-screen w-[220px] flex-col lg:flex border-r border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800">
        <div className={cn('relative flex flex-col h-full py-5 px-3', dmSans.className)}>

            {/* Logo */}
            <div className="flex items-center gap-2.5 px-2 pb-5">
              <div className="w-[26px] h-[26px] rounded-[7px] bg-neutral-800 flex items-center justify-center flex-shrink-0 dark:bg-white dark:text-neutral-900">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="dark:hidden">
                  <rect x="2" y="2" width="4" height="4" rx="1" fill="white" />
                  <rect x="8" y="2" width="4" height="4" rx="1" fill="white" fillOpacity="0.5" />
                  <rect x="2" y="8" width="4" height="4" rx="1" fill="white" fillOpacity="0.5" />
                  <rect x="8" y="8" width="4" height="4" rx="1" fill="white" fillOpacity="0.3" />
                </svg>
                 <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="hidden dark:block">
                  <rect x="2" y="2" width="4" height="4" rx="1" fill="#18181b" />
                  <rect x="8" y="2" width="4" height="4" rx="1" fill="#18181b" fillOpacity="0.5" />
                  <rect x="2" y="8" width="4" height="4" rx="1" fill="#18181b" fillOpacity="0.5" />
                  <rect x="8" y="8" width="4" height="4" rx="1" fill="#18181b" fillOpacity="0.3" />
                </svg>
              </div>
              <span className={cn('text-[18px] tracking-tight text-neutral-900 dark:text-neutral-100', dmSerif.className)}>
                NoteVault
              </span>
           </div>

         {/* Main nav */}
         <nav className="flex flex-col gap-0.5">
           {navItems.map((item) => (
             <NavLink key={item.name} item={item} />
           ))}
         </nav>

        {/* Divider */}
        <div className="my-2.5 border-t border-neutral-200 dark:border-neutral-800" />

         {/* Organization */}
          <div className="flex flex-col gap-0.5">
            <p className="px-2.5 pt-1 pb-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
              Organize
            </p>
            {secondaryItems.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom items */}
        <div className="flex flex-col gap-0.5">
          {bottomItems.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </div>

         {/* Theme Switcher */}
         <ThemeSwitcher />

        {/* Divider */}
        <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />

        {/* User panel with dropdown */}
        <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 w-full rounded-[7px] text-[14px] font-normal transition-colors',
                isUserMenuOpen
                  ? 'bg-neutral-100 text-neutral-900 font-medium dark:bg-neutral-700 dark:text-neutral-100'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
              )}
            >
              <div className="w-[26px] h-[26px] rounded-full bg-neutral-200 flex items-center justify-center text-[11px] font-medium text-neutral-700 dark:bg-neutral-600 dark:text-neutral-200 flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-medium text-neutral-800 truncate dark:text-neutral-100">{user?.name || 'User'}</p>
              </div>
             <ChevronUp className={cn(
               'h-[17px] w-[17px] flex-shrink-0 opacity-70 transition-transform',
               isUserMenuOpen && 'rotate-180'
             )} />
            </button>

             {/* Dropdown menu */}
             {isUserMenuOpen && (
               <div className="absolute bottom-full left-0 right-0 mb-1.5 rounded-[7px] border border-neutral-200 bg-white shadow-lg overflow-hidden z-50 dark:border-neutral-800 dark:bg-neutral-800">
                  <div className="py-1">
                   <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-2.5 py-2 w-full text-[13.5px] text-red-500 hover:bg-red-50 transition-colors dark:hover:bg-red-950/50 dark:text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
               </div>
             )}
        </div>

      </div>
    </aside>
  );
}