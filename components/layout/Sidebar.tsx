'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
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
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className="absolute left-full whitespace-nowrap z-[100] px-2.5 py-1.5 bg-[#1A1D1E] text-[#FFFFFF] text-[11px] font-bold rounded-md shadow-md dark:bg-[#E4E6EB] dark:text-[#111111] border border-[#E6E8EB]/10 dark:border-[#2D2D2D]/10"
          >
            {text}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-1.5 h-1.5 bg-[#1A1D1E] rotate-45 dark:bg-[#E4E6EB]" />
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
          'flex items-center group transition-colors duration-100',
          isCollapsed ? 'justify-center w-9 h-9 mx-auto rounded-md' : 'gap-2.5 px-2.5 py-1.5 w-full rounded-md text-xs',
          isActive
            ? 'bg-[#00A3A3]/10 text-[#00A3A3] dark:bg-[#00E0E0]/10 dark:text-[#00E0E0] font-medium'
            : 'text-[#687076] hover:bg-[#F4F7F6] hover:text-[#1A1D1E] dark:text-[#A0A0A0] dark:hover:bg-[#2D2D2D] dark:hover:text-[#E4E6EB]'
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.1 }}
            className="font-medium tracking-tight truncate"
          >
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
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      className="sticky top-0 hidden h-screen flex-col lg:flex border-r border-[#E6E8EB] bg-[#FFFFFF] dark:bg-[#1A1A1A] dark:border-[#2D2D2D] z-40"
    >
      <div className={cn('relative flex flex-col h-full py-4 font-sans', isCollapsed ? 'px-0' : 'px-3')}>
        
        {/* LOGO SECTION */}
        <div className={cn("mb-6 flex items-center", isCollapsed ? "justify-center" : "justify-between px-1")}>
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => isCollapsed && setIsCollapsed(false)}
              onMouseEnter={() => setIsLogoHovered(true)}
              onMouseLeave={() => setIsLogoHovered(false)}
              className={cn(
                "relative w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors duration-100 group",
                isCollapsed 
                  ? "bg-[#F4F7F6] dark:bg-[#111111] hover:bg-[#00A3A3]/10 dark:hover:bg-[#00E0E0]/10" 
                  : "bg-[#00A3A3]/10 dark:bg-[#00E0E0]/10 cursor-default"
              )}
            >
              <AnimatePresence mode="wait">
                {(isCollapsed && isLogoHovered) ? (
                  <motion.div 
                    key="expand" 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                  >
                    <PanelLeftOpen className="h-4 w-4 text-[#00A3A3] dark:text-[#00E0E0]" />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="logo" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ duration: 0.1 }}
                    className="flex items-center justify-center"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="2" y="2" width="4" height="4" rx="1" className={isCollapsed ? "fill-[#687076] dark:fill-[#A0A0A0]" : "fill-[#00A3A3] dark:fill-[#00E0E0]"} />
                      <rect x="8" y="2" width="4" height="4" rx="1" fillOpacity="0.5" className={isCollapsed ? "fill-[#687076] dark:fill-[#A0A0A0]" : "fill-[#00A3A3] dark:fill-[#00E0E0]"} />
                      <rect x="2" y="8" width="4" height="4" rx="1" fillOpacity="0.5" className={isCollapsed ? "fill-[#687076] dark:fill-[#A0A0A0]" : "fill-[#00A3A3] dark:fill-[#00E0E0]"} />
                      <rect x="8" y="8" width="4" height="4" rx="1" fillOpacity="0.3" className={isCollapsed ? "fill-[#687076] dark:fill-[#A0A0A0]" : "fill-[#00A3A3] dark:fill-[#00E0E0]"} />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ duration: 0.1 }}
                className="text-sm tracking-tight font-bold text-[#1A1D1E] dark:text-[#E4E6EB]"
              >
                NoteVault
              </motion.span>
            )}
          </div>

          {!isCollapsed && (
             <button 
               onClick={() => setIsCollapsed(true)} 
               className="p-1 rounded text-[#687076] dark:text-[#A0A0A0] hover:text-[#1A1D1E] dark:hover:text-[#E4E6EB] hover:bg-[#F4F7F6] dark:hover:bg-[#111111] transition-colors duration-100"
             >
                <PanelLeftClose className="h-3.5 w-3.5" />
             </button>
          )}
        </div>

        {/* Links */}
        <nav className="space-y-0.5">
          <NavLink item={{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }} isActive={pathname === '/dashboard'} isCollapsed={isCollapsed} />
          <NavLink item={{ name: 'All Notes', href: '/dashboard/notes', icon: FileText }} isActive={pathname === '/dashboard/notes'} isCollapsed={isCollapsed} />
          <NavLink item={{ name: 'Topics', href: '/dashboard/topics', icon: FolderOpen }} isActive={pathname === '/dashboard/topics' || pathname.startsWith('/dashboard/topics/')} isCollapsed={isCollapsed} />
        </nav>

        <div className="my-4 border-t border-[#E6E8EB] dark:border-[#2D2D2D]" />

        <nav className="space-y-0.5">
          <p className={cn("px-2.5 mb-1.5 text-[9px] font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0]", isCollapsed && "text-center px-0")}>
            {isCollapsed ? "•••" : "Organize"}
          </p>
          <NavLink item={{ name: 'Tags', href: '/dashboard/tags', icon: Tags }} isActive={pathname === '/dashboard/tags'} isCollapsed={isCollapsed} />
          <NavLink item={{ name: 'Recent', href: '/dashboard/recent', icon: Clock }} isActive={pathname === '/dashboard/recent'} isCollapsed={isCollapsed} />
        </nav>

        <div className="flex-1" />

        <div className="space-y-0.5 mb-2">
          <NavLink item={{ name: 'Settings', href: '/dashboard/settings', icon: Settings }} isActive={pathname === '/dashboard/settings'} isCollapsed={isCollapsed} />
          <ThemeSwitcher isCollapsed={isCollapsed} TooltipWrapper={Tooltip} />
        </div>

        {/* USER PROFILE */}
        <div 
          className={cn(
            "flex items-center transition-colors duration-100", 
            isCollapsed ? "justify-center w-10 h-10 mx-auto rounded-md" : "gap-2.5 p-1.5 w-full rounded-md hover:bg-[#F4F7F6] dark:hover:bg-[#111111]/50"
          )}
        >
          <div className="shrink-0 overflow-hidden flex items-center justify-center">
            {user ? (
              <UserButton
                showName={false}
                appearance={{
                  elements: {
                    rootBox: "w-7 h-7 flex items-center justify-center",
                    userButtonBox: "w-7 h-7 flex items-center justify-center",
                    avatarBox: "w-7 h-7 rounded-md",
                    userButtonTrigger: "w-7 h-7",
                    userButtonOuterIdentifier: "hidden",
                  },
                }}
              />
            ) : (
              <UserIcon className="p-1 h-7 w-7 text-[#687076] dark:text-[#A0A0A0]" />
            )}
          </div>

          {!isCollapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-[#1A1D1E] dark:text-[#E4E6EB] truncate">{user?.firstName || 'User'}</p>
              <p className="text-[10px] text-[#687076] dark:text-[#A0A0A0] truncate">{user?.emailAddresses[0]?.emailAddress}</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}