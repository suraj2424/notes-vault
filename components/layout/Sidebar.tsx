'use client';

import { useState, useEffect } from 'react';
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
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from './ThemeSwitcher';
import Link from 'next/link';
import { useMobileMenu } from './DashboardShell';

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
      {isVisible && (
        <div className="absolute left-full whitespace-nowrap z-[100] px-3 py-2 bg-[#1A1D1E] text-[#FFFFFF] text-sm font-medium rounded-md shadow-md dark:bg-[#E4E6EB] dark:text-[#111111] border border-[#E6E8EB]/10 dark:border-[#2D2D2D]/10">
          {text}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-1.5 h-1.5 bg-[#1A1D1E] rotate-45 dark:bg-[#E4E6EB]" />
        </div>
      )}
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
          isCollapsed ? 'justify-center w-10 h-10 mx-auto rounded-lg' : 'gap-3 px-3 py-2.5 w-full rounded-lg text-sm',
          isActive
            ? 'bg-[#00A3A3]/10 text-[#00A3A3] dark:bg-[#00E0E0]/10 dark:text-[#00E0E0] font-medium'
            : 'text-secondary hover:bg-surface-hover hover:text-primary'
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && (
          <span className="tracking-tight truncate" >
            {item.name}
          </span>
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
  const { isMobileMenuOpen, closeMobileMenu } = useMobileMenu();

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  const sidebarContent = (
    <div className={cn('relative flex h-full flex-col py-4 font-sans', isCollapsed ? 'px-0' : 'px-3')}>
      {/* LOGO SECTION */}
      <div className={cn("mb-6 flex items-center", isCollapsed ? "justify-center" : "justify-between px-1")}>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => isCollapsed && setIsCollapsed(false)}
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            className={cn(
              "relative w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-100 group",
              isCollapsed 
                ? "bg-[#F4F7F6] dark:bg-[#111111] hover:bg-[#00A3A3]/10 dark:hover:bg-[#00E0E0]/10" 
                : "bg-[#00A3A3]/10 dark:bg-[#00E0E0]/10 cursor-default"
            )}
          >
            {isCollapsed && isLogoHovered ? (
              <PanelLeftOpen className="h-5 w-5 text-[#00A3A3] dark:text-[#00E0E0]" />
            ) : (
              <div className="flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="2" width="4" height="4" rx="1" className={isCollapsed ? "fill-[#687076] dark:fill-[#A0A0A0]" : "fill-[#00A3A3] dark:fill-[#00E0E0]"} />
                  <rect x="8" y="2" width="4" height="4" rx="1" fillOpacity="0.5" className={isCollapsed ? "fill-[#687076] dark:fill-[#A0A0A0]" : "fill-[#00A3A3] dark:fill-[#00E0E0]"} />
                  <rect x="2" y="8" width="4" height="4" rx="1" fillOpacity="0.5" className={isCollapsed ? "fill-[#687076] dark:fill-[#A0A0A0]" : "fill-[#00A3A3] dark:fill-[#00E0E0]"} />
                  <rect x="8" y="8" width="4" height="4" rx="1" fillOpacity="0.3" className={isCollapsed ? "fill-[#687076] dark:fill-[#A0A0A0]" : "fill-[#00A3A3] dark:fill-[#00E0E0]"} />
                </svg>
              </div>
            )}
          </button>
          
          {!isCollapsed && (
            <span className="text-sm font-bold tracking-tight text-primary">
              NoteVault
            </span>
          )}
        </div>

        {!isCollapsed && (
            <button 
              onClick={() => setIsCollapsed(true)} 
              className="rounded p-1.5 text-secondary transition-colors duration-100 hover:bg-surface-hover hover:text-primary"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
        )}
      </div>

      {/* Links */}
      <nav className="space-y-1">
        <NavLink item={{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }} isActive={pathname === '/dashboard'} isCollapsed={isCollapsed} />
        <NavLink item={{ name: 'All Notes', href: '/dashboard/notes', icon: FileText }} isActive={pathname.startsWith('/dashboard/notes')} isCollapsed={isCollapsed} />
        <NavLink item={{ name: 'Topics', href: '/dashboard/topics', icon: FolderOpen }} isActive={pathname === '/dashboard/topics' || pathname.startsWith('/dashboard/topics/')} isCollapsed={isCollapsed} />
      </nav>

      <div className="my-4 border-t border-default" />

      <nav className="space-y-1">
        <p className={cn("mb-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-secondary", isCollapsed && "px-0 text-center")}>
          {isCollapsed ? "•••" : "Organize"}
        </p>
        <NavLink item={{ name: 'Tags', href: '/dashboard/tags', icon: Tags }} isActive={pathname === '/dashboard/tags'} isCollapsed={isCollapsed} />
        <NavLink item={{ name: 'Recent', href: '/dashboard/recent', icon: Clock }} isActive={pathname === '/dashboard/recent'} isCollapsed={isCollapsed} />
      </nav>

      <div className="flex-1" />

      <div className="space-y-1 mb-2">
        <NavLink item={{ name: 'Settings', href: '/dashboard/settings', icon: Settings }} isActive={pathname === '/dashboard/settings'} isCollapsed={isCollapsed} />
        <ThemeSwitcher isCollapsed={isCollapsed} TooltipWrapper={Tooltip} />
      </div>

      {/* USER PROFILE */}
      <div 
        className={cn(
          "flex items-center transition-colors duration-100", 
          isCollapsed ? "mx-auto h-10 w-10 justify-center rounded-md" : "w-full gap-2.5 rounded-md p-1.5 hover:bg-surface-hover"
        )}
      >
        <div className="shrink-0 overflow-hidden flex items-center justify-center">
          {user ? (
            <UserButton
              showName={false}
              appearance={{
                elements: {
                  rootBox: "w-8 h-8 flex items-center justify-center",
                  userButtonBox: "w-8 h-8 flex items-center justify-center",
                  avatarBox: "w-8 h-8 rounded-md",
                  userButtonTrigger: "w-8 h-8",
                  userButtonOuterIdentifier: "hidden",
                },
              }}
            />
          ) : (
            <UserIcon className="h-8 w-8 p-1 text-secondary" />
          )}
        </div>

        {!isCollapsed && (
          <div className="flex-1 text-left min-w-0">
            <p className="truncate text-sm font-semibold text-primary">{user?.firstName || 'User'}</p>
            <p className="truncate text-xs text-secondary">{user?.emailAddresses[0]?.emailAddress}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "sticky top-0 z-40 hidden h-screen flex-col border-r border-default bg-surface lg:flex transition-all duration-100",
          isCollapsed ? "w-16" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div className="lg:hidden">
        {/* Backdrop */}
        <div
          className={cn(
            "fixed inset-0 z-50 bg-black/40 transition-opacity duration-200",
            isMobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          onClick={closeMobileMenu}
        />

        {/* Slide-out Panel */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r border-default bg-surface transition-transform duration-200 ease-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Mobile close button */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#00A3A3]/10 dark:bg-[#00E0E0]/10">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="2" width="4" height="4" rx="1" className="fill-[#00A3A3] dark:fill-[#00E0E0]" />
                  <rect x="8" y="2" width="4" height="4" rx="1" fillOpacity="0.5" className="fill-[#00A3A3] dark:fill-[#00E0E0]" />
                  <rect x="2" y="8" width="4" height="4" rx="1" fillOpacity="0.5" className="fill-[#00A3A3] dark:fill-[#00E0E0]" />
                  <rect x="8" y="8" width="4" height="4" rx="1" fillOpacity="0.3" className="fill-[#00A3A3] dark:fill-[#00E0E0]" />
                </svg>
              </div>
              <span className="text-sm font-bold tracking-tight text-primary">NoteVault</span>
            </div>
            <button
              onClick={closeMobileMenu}
              className="rounded p-1.5 text-secondary transition-colors duration-100 hover:bg-surface-hover hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3">
            <nav className="space-y-1">
              <NavLink item={{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }} isActive={pathname === '/dashboard'} isCollapsed={false} />
              <NavLink item={{ name: 'All Notes', href: '/dashboard/notes', icon: FileText }} isActive={pathname.startsWith('/dashboard/notes')} isCollapsed={false} />
              <NavLink item={{ name: 'Topics', href: '/dashboard/topics', icon: FolderOpen }} isActive={pathname === '/dashboard/topics' || pathname.startsWith('/dashboard/topics/')} isCollapsed={false} />
            </nav>

            <div className="my-4 border-t border-default" />

            <nav className="space-y-1">
              <p className="mb-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-secondary">
                Organize
              </p>
              <NavLink item={{ name: 'Tags', href: '/dashboard/tags', icon: Tags }} isActive={pathname === '/dashboard/tags'} isCollapsed={false} />
              <NavLink item={{ name: 'Recent', href: '/dashboard/recent', icon: Clock }} isActive={pathname === '/dashboard/recent'} isCollapsed={false} />
            </nav>
          </div>

          <div className="border-t border-default px-3 py-3 space-y-1">
            <NavLink item={{ name: 'Settings', href: '/dashboard/settings', icon: Settings }} isActive={pathname === '/dashboard/settings'} isCollapsed={false} />
            <ThemeSwitcher isCollapsed={false} TooltipWrapper={Tooltip} />
          </div>
        </aside>
      </div>
    </>
  );
}
