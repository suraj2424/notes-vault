'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFFFF] dark:bg-[#1A1A1A]">
      {/* Structural Navigation */}
      <Sidebar />
      
      {/* Core Viewport Wrapper */}
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar />
        
        {/* Main Content Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[#F4F7F6] dark:bg-[#111111] transition-colors duration-100">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}