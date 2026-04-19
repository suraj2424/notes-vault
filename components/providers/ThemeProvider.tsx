'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function getStoredTheme(): Theme | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored && ['dark', 'light', 'system'].includes(stored)) {
      return stored;
    }
  }
  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize on mount - read localStorage and set mounted
  useEffect(() => {
    setMounted(true);
    const stored = getStoredTheme();
    if (stored) {
      setThemeState(stored);
    }
  }, []);

  // Update resolved theme whenever theme or system preference changes
  useEffect(() => {
    if (!mounted) return;
    const effective = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(effective);
  }, [theme, mounted]);

  // Apply theme class to document
  const applyTheme = useCallback((themeToApply: 'dark' | 'light') => {
    const html = document.documentElement;
    if (themeToApply === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
    }
  }, []);

  // Apply theme on mount and when resolvedTheme changes
  useEffect(() => {
    if (!mounted) return;
    applyTheme(resolvedTheme);
  }, [mounted, resolvedTheme, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
        setResolvedTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted, theme, applyTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(systemDark ? 'dark' : 'light');
      setResolvedTheme(systemDark ? 'dark' : 'light');
    } else {
      applyTheme(newTheme);
      setResolvedTheme(newTheme);
    }
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
