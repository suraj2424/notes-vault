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

export function ThemeSwitcher({ isCollapsed, TooltipWrapper }: { isCollapsed: boolean; TooltipWrapper: any }) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentOption = mounted
    ? themeOptions.find(o => o.value === theme) || themeOptions[2]
    : themeOptions[2];
  const Icon = currentOption.icon;

  return (
    <div className="relative" ref={ref}>
      <TooltipWrapper text="Theme" active={isCollapsed}>
        <button
          onClick={() => mounted && setIsOpen(!isOpen)}
          className={cn(
            'flex items-center transition-all duration-200 group',
            isCollapsed ? 'justify-center w-10 h-10 mx-auto rounded-xl' : 'gap-3 px-3 py-2 w-full rounded-lg text-[14px]',
            isOpen
              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
              : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-neutral-50'
          )}
        >
          <Icon className={cn("h-[18px] w-[18px] shrink-0 transition-opacity", isOpen ? "opacity-100" : "opacity-60 group-hover:opacity-100")} />
          {!isCollapsed && <span className="font-semibold tracking-tight flex-1 text-left">Theme</span>}
        </button>
      </TooltipWrapper>

      <AnimatePresence>
        {mounted && isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="absolute bottom-full left-0 right-0 mb-3 min-w-[140px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-1.5 z-50"
          >
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => { setTheme(option.value); setIsOpen(false); }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 w-full text-[13px] rounded-xl transition-all font-bold group',
                  mounted && theme === option.value ? 'bg-neutral-100 text-neutral-950 dark:bg-neutral-800 dark:text-white' : 'text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800/50'
                )}
              >
                <option.icon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                <span>{option.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
