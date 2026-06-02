'use client';

import { useState, useCallback, createContext, useContext } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface MobileMenuContextType {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const MobileMenuContext = createContext<MobileMenuContextType>({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => {},
  closeMobileMenu: () => {},
});

export function useMobileMenu() {
  return useContext(MobileMenuContext);
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <MobileMenuContext.Provider value={{ isMobileMenuOpen, toggleMobileMenu, closeMobileMenu }}>
      <div className="flex h-screen overflow-hidden bg-[#FFFFFF] dark:bg-[#1A1A1A]">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <Navbar />
          <main className="flex-1 overflow-y-auto transition-colors duration-100">
            <div className="">{children}</div>
          </main>
        </div>
      </div>
    </MobileMenuContext.Provider>
  );
}
