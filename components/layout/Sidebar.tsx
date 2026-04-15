'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Code2, 
  Star, 
  Tags, 
  Settings,
  HelpCircle,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'All Notes', href: '/notes', icon: FileText },
  { name: 'DSA Prep', href: '/notes?type=dsa', icon: Code2 },
  { name: 'Topic Q&A', href: '/notes?type=qa', icon: BookOpen },
  { name: 'Favorites', href: '/notes?filter=favorites', icon: Star },
];

const secondaryItems = [
  { name: 'Tags', href: '/tags', icon: Tags },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-[240px] flex-col border-r border-brand-border bg-brand-sidebar lg:flex">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto py-6">
        <div>
          <nav className="flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 text-[0.9rem] font-medium transition-all border-l-4",
                  pathname === item.href 
                    ? "bg-blue-50 text-brand-primary border-brand-primary" 
                    : "text-brand-muted border-transparent hover:text-brand-text hover:bg-neutral-50"
                )}
              >
                <item.icon className={cn("h-4 w-4", pathname === item.href ? "text-brand-primary" : "text-brand-muted")} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="mb-2 px-6 text-[0.7rem] font-bold uppercase tracking-widest text-brand-muted">
            Organization
          </p>
          <nav className="flex flex-col">
            {secondaryItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 text-[0.9rem] font-medium transition-all border-l-4",
                  pathname === item.href 
                    ? "bg-blue-50 text-brand-primary border-brand-primary" 
                    : "text-brand-muted border-transparent hover:text-brand-text hover:bg-neutral-50"
                )}
              >
                <item.icon className={cn("h-4 w-4", pathname === item.href ? "text-brand-primary" : "text-brand-muted")} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-brand-border p-6">
        <div className="rounded-xl bg-brand-text p-4 text-white">
          <p className="text-[0.7rem] font-bold uppercase tracking-widest text-brand-muted">Pro Plan</p>
          <p className="mt-1 text-sm font-bold">Unlimited Notes</p>
          <button className="mt-3 w-full rounded-lg bg-brand-primary py-2 text-xs font-bold transition-colors hover:bg-blue-700">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}
