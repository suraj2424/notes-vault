'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';
import { Monitor, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

export function ThemeSwitcher({ 
  isCollapsed, 
  TooltipWrapper 
}: { 
  isCollapsed: boolean; 
  TooltipWrapper: any; 
}) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentOption = themeOptions.find(o => o.value === theme) || themeOptions[2];
  const Icon = currentOption.icon;

  return (
    <div className="relative" ref={ref}>
      <TooltipWrapper text="Theme" active={isCollapsed}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center group transition-colors duration-100 outline-none',
            isCollapsed 
              ? 'justify-center w-9 h-9 mx-auto rounded-md' 
              : 'gap-2.5 px-2.5 py-1.5 w-full rounded-md text-xs',
            isOpen
              ? 'bg-[#F4F7F6] text-[#1A1D1E] dark:bg-[#2D2D2D] dark:text-[#E4E6EB]'
              : 'text-[#687076] hover:bg-[#F4F7F6] hover:text-[#1A1D1E] dark:text-[#A0A0A0] dark:hover:bg-[#2D2D2D] dark:hover:text-[#E4E6EB]'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" suppressHydrationWarning />
          {!isCollapsed && (
            <span className="font-medium tracking-tight flex-1 text-left truncate">
              Theme
            </span>
          )}
        </button>
      </TooltipWrapper>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={isCollapsed ? { opacity: 0, x: 3 } : { opacity: 0, y: 4 }} 
            animate={isCollapsed ? { opacity: 1, x: 8 } : { opacity: 1, y: 0 }} 
            exit={isCollapsed ? { opacity: 0, x: 3 } : { opacity: 0, y: 4 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className={cn(
              "absolute z-[100] p-1 bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E6E8EB] dark:border-[#2D2D2D] rounded-md shadow-md",
              isCollapsed 
                ? "left-full bottom-0 w-32" 
                : "bottom-full left-0 right-0 mb-1.5 w-full"
            )}
          >
            <div className="flex flex-col gap-0.5">
              {themeOptions.map((option) => {
                const OptionIcon = option.icon;
                const isSelected = theme === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => { 
                      setTheme(option.value); 
                      setIsOpen(false); 
                    }}
                    className={cn(
                      'flex items-center gap-2.5 px-2 py-1.5 w-full text-xs rounded-md transition-colors duration-100 font-medium outline-none text-left',
                      isSelected 
                        ? 'bg-[#00A3A3]/10 text-[#00A3A3] dark:bg-[#00E0E0]/10 dark:text-[#00E0E0]' 
                        : 'text-[#687076] hover:bg-[#F4F7F6] hover:text-[#1A1D1E] dark:text-[#A0A0A0] dark:hover:bg-[#2D2D2D] dark:hover:text-[#E4E6EB]'
                    )}
                  >
                    <OptionIcon className="h-4 w-4 shrink-0" />
                    <span className="tracking-tight truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}