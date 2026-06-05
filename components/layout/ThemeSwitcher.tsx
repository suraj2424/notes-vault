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
              ? 'justify-center w-10 h-10 mx-auto rounded-lg' 
              : 'gap-3 px-3 py-2.5 w-full rounded-lg text-sm',
            isOpen
              ? 'bg-[#F4F7F6] text-[#1A1D1E] dark:bg-[#2D2D2D] dark:text-[#E4E6EB]'
              : 'text-secondary hover:bg-surface-hover hover:text-primary'
          )}
        >
          <Icon className={cn("shrink-0", isCollapsed ? "h-4 w-4" : "h-5 w-5")} suppressHydrationWarning />
          {!isCollapsed && (
            <span className="tracking-tight flex-1 text-left truncate font-normal">
              Theme
            </span>
          )}
        </button>
      </TooltipWrapper>

      <div 
        className={cn(
          "absolute z-[100] p-1 bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E6E8EB] dark:border-[#2D2D2D] rounded-md shadow-sm",
          isCollapsed 
            ? "left-full bottom-0 w-32" 
            : "bottom-full left-0 right-0 mb-1.5 w-full",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-0.5 pointer-events-none invisible"
        )}
        style={{
          transition: isOpen
            ? 'opacity 100ms ease-out, transform 100ms ease-out, visibility 0s linear 0s'
            : 'opacity 100ms ease-out, transform 100ms ease-out, visibility 0s linear 100ms',
        }}
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
                  'flex items-center gap-2 px-3 py-1.5 w-full text-sm rounded-md transition-colors duration-100 font-normal outline-none text-left',
                  isSelected 
                    ? 'bg-[#00A3A3]/10 text-[#00A3A3] dark:bg-[#00E0E0]/10 dark:text-[#00E0E0]' 
                    : 'text-secondary hover:bg-surface-hover hover:text-primary'
                )}
              >
                  <OptionIcon className="h-4 w-4 shrink-0" />
                <span className="tracking-tight truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
