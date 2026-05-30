
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
        <main className="flex-1 overflow-y-auto bg-[#F4F7F6] dark:bg-[#111111] transition-colors duration-100">
          <div className="">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}