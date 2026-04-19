'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';
import { Monitor, Sun, Moon } from 'lucide-react';

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = themeOptions.find(o => o.value === theme)!;
  const Icon = currentOption.icon;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2.5 px-2.5 py-[7px] w-full rounded-[7px] text-[13px] font-normal transition-colors',
          isOpen
            ? 'bg-neutral-800 text-white font-medium dark:bg-neutral-700 dark:text-neutral-100'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
        )}
      >
        <Icon className="h-[15px] w-[15px] flex-shrink-0 opacity-70 [&]:currentColor" />
        <span className="flex-1 text-left">Theme</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-1.5 rounded-[7px] border border-neutral-200 bg-white shadow-lg overflow-hidden z-50 dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-2xl">
          <div className="py-1">
            {themeOptions.map((option) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-2 w-full text-[12.5px] transition-colors',
                    theme === option.value
                      ? 'bg-neutral-800 text-white font-medium dark:bg-neutral-700 dark:text-neutral-100'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                  )}
                >
                  <OptionIcon className="h-3.5 w-3.5" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
