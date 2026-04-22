'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  FileText,
  Tags,
  Clock,
  Settings,
  User as UserIcon,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from './ThemeSwitcher';
import Link from 'next/link';

/**
 * 1. TOOLTIP (High Contrast & Centered)
 */
export const Tooltip = ({ text, children, active }: { text: string; children: React.ReactNode; active: boolean }) => {
  const [isVisible, setIsVisible] = useState(false);
  if (!active) return <>{children}</>;

  return (
    <div 
      className="relative flex items-center justify-center w-full" 
      onMouseEnter={() => setIsVisible(true)} 
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 3 }}
            animate={{ opacity: 1, x: 8 }}
            exit={{ opacity: 0, x: 3 }}
            className="absolute left-full whitespace-nowrap z-[100] px-3 py-1.5 bg-neutral-950 text-white text-[12px] font-bold rounded-md shadow-xl dark:bg-white dark:text-neutral-950 border border-neutral-800 dark:border-neutral-200"
          >
            {text}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-neutral-950 rotate-45 dark:bg-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * 2. NAVLINK (Fixed Centering)
 */
interface NavLinkProps {
  item: { name: string; href: string; icon: React.ElementType };
  isActive: boolean;
  isCollapsed: boolean;
}

const NavLink = ({ item, isActive, isCollapsed }: NavLinkProps) => {
  return (
    <Tooltip text={item.name} active={isCollapsed}>
      <Link
        href={item.href}
        className={cn(
          'flex items-center transition-all duration-200 group',
          isCollapsed ? 'justify-center w-10 h-10 mx-auto rounded-xl' : 'gap-3 px-3 py-2 w-full rounded-lg text-[14px]',
          isActive
            ? 'bg-neutral-950 text-white shadow-md hover:bg-neutral-900 hover:shadow-lg dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-50'
            : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-neutral-50'
        )}
      >
        <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100")} />
        {!isCollapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-semibold tracking-tight">
            {item.name}
          </motion.span>
        )}
      </Link>
    </Tooltip>
  );
};

/**
 * 3. MAIN SIDEBAR
 */
export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="sticky top-0 hidden h-screen flex-col lg:flex border-r border-neutral-200 bg-white dark:bg-neutral-950 dark:border-neutral-900 z-40 transition-colors"
    >
      <div className={cn('relative flex flex-col h-full py-6 transition-all font-sans', isCollapsed ? 'px-0' : 'px-4')}>
        
        {/* LOGO SECTION */}
        <div className={cn("mb-10 flex items-center", isCollapsed ? "justify-center" : "justify-between px-1")}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => isCollapsed && setIsCollapsed(false)}
              onMouseEnter={() => setIsLogoHovered(true)}
              onMouseLeave={() => setIsLogoHovered(false)}
              className={cn(
                "relative w-[34px] h-[34px] rounded-[9px] flex items-center justify-center shrink-0 transition-all group",
                isCollapsed 
                  ? "bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-950 dark:hover:bg-white" 
                  : "bg-neutral-950 dark:bg-white cursor-default"
              )}
            >
              <AnimatePresence mode="wait">
                {(isCollapsed && isLogoHovered) ? (
                  <motion.div key="expand" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                    <PanelLeftOpen className="h-4 w-4 text-white dark:text-neutral-950" />
                  </motion.div>
                ) : (
                  <motion.div key="logo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                      <rect x="2" y="2" width="4" height="4" rx="1" className={isCollapsed ? "fill-neutral-500 dark:fill-neutral-400" : "fill-white dark:fill-neutral-950"} />
                      <rect x="8" y="2" width="4" height="4" rx="1" fillOpacity="0.5" className={isCollapsed ? "fill-neutral-500 dark:fill-neutral-400" : "fill-white dark:fill-neutral-950"} />
                      <rect x="2" y="8" width="4" height="4" rx="1" fillOpacity="0.5" className={isCollapsed ? "fill-neutral-500 dark:fill-neutral-400" : "fill-white dark:fill-neutral-950"} />
                      <rect x="8" y="8" width="4" height="4" rx="1" fillOpacity="0.3" className={isCollapsed ? "fill-neutral-500 dark:fill-neutral-400" : "fill-white dark:fill-neutral-950"} />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[19px] tracking-tight font-bold text-neutral-950 dark:text-white font-serif">
                NoteVault
              </motion.span>
            )}
          </div>

          {!isCollapsed && (
             <button onClick={() => setIsCollapsed(true)} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <PanelLeftClose className="h-4 w-4" />
             </button>
          )}
        </div>

        {/* Links */}
        <nav className="space-y-1">
          <NavLink item={{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }} isActive={pathname === '/dashboard'} isCollapsed={isCollapsed} />
          <NavLink item={{ name: 'All Notes', href: '/dashboard/notes', icon: FileText }} isActive={pathname === '/dashboard/notes'} isCollapsed={isCollapsed} />
        </nav>

        <div className="my-6 mx-4 border-t border-neutral-200 dark:border-neutral-800" />

        <nav className="space-y-1">
          <p className={cn("px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400", isCollapsed && "text-center px-0")}>
            {isCollapsed ? "•••" : "Organize"}
          </p>
          <NavLink item={{ name: 'Tags', href: '/dashboard/tags', icon: Tags }} isActive={pathname === '/dashboard/tags'} isCollapsed={isCollapsed} />
          <NavLink item={{ name: 'Recent', href: '/dashboard/recent', icon: Clock }} isActive={pathname === '/dashboard/recent'} isCollapsed={isCollapsed} />
        </nav>

        <div className="flex-1" />

        <div className="space-y-1 mb-4">
          <NavLink item={{ name: 'Settings', href: '/dashboard/settings', icon: Settings }} isActive={pathname === '/dashboard/settings'} isCollapsed={isCollapsed} />
          <ThemeSwitcher isCollapsed={isCollapsed} TooltipWrapper={Tooltip} />
        </div>

        {/* USER PROFILE */}
        <div className={cn("flex items-center transition-all duration-300", isCollapsed ? "justify-center w-12 h-12 mx-auto rounded-xl" : "gap-3 p-2 w-full rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-900/50")}>
          <div className="shrink-0 overflow-hidden">
            {user ? (
              <UserButton
                showName={false}
                appearance={{
                  elements: {
                    rootBox: "w-full h-full flex items-center justify-center",
                    userButtonBox: "w-full h-full flex items-center justify-center",
                    avatarBox: "w-9 h-9 rounded-xl",
                    userButtonTrigger: "w-full h-full",
                    userButtonOuterIdentifier: "hidden",
                  },
                }}
              />
            ) : (
              <UserIcon className="p-2 text-neutral-400" />
            )}
          </div>

          {!isCollapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-[13px] font-bold text-neutral-950 dark:text-white truncate">{user?.firstName || 'User'}</p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{user?.emailAddresses[0]?.emailAddress}</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
