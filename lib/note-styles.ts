import { LucideIcon, Code2, BookOpen, FileText } from 'lucide-react';
import { NoteType } from '@/types';

export const NOTE_TYPE_META: Record<
  NoteType,
  {
    label: string;
    icon: LucideIcon;
    iconWrap: string;
    typeBadge: string;
    accentBorder: string;
    filterChip: string;
    filterChipActive: string;
    badge: string;
    accent: string;
    pillActive: string;
    pillInactive: string;
  }
> = {
  dsa: {
    label: 'DSA',
    icon: Code2,
    iconWrap:
      'border-[#00A3A3]/15 bg-[#00A3A3]/5 text-[#00A3A3] dark:border-[#00E0E0]/15 dark:bg-[#00E0E0]/5 dark:text-[#00E0E0]',
    typeBadge:
      'border-[#00A3A3]/20 bg-[#00A3A3]/5 text-[#00A3A3] dark:border-[#00E0E0]/20 dark:bg-[#00E0E0]/5 dark:text-[#00E0E0]',
    accentBorder: 'hover:border-[#00A3A3]/40 dark:hover:border-[#00E0E0]/30',
    filterChip:
      'border-[#00A3A3]/20 bg-[#00A3A3]/5 text-[#00A3A3] hover:bg-[#00A3A3]/10 dark:border-[#00E0E0]/20 dark:bg-[#00E0E0]/5 dark:text-[#00E0E0] dark:hover:bg-[#00E0E0]/10',
    filterChipActive:
      'border-[#00A3A3] bg-[#00A3A3] text-white dark:border-[#00E0E0] dark:bg-[#00E0E0] dark:text-[#111111]',
    badge:
      'border-[#00A3A3]/25 bg-[#00A3A3]/5 text-[#00A3A3] dark:border-[#00E0E0]/25 dark:bg-[#00E0E0]/5 dark:text-[#00E0E0]',
    accent: 'text-[#00A3A3] dark:text-[#00E0E0]',
    pillActive:
      'bg-[#FFFFFF] text-[#00A3A3] border-[#00A3A3]/30 shadow-sm dark:bg-[#1A1A1A] dark:text-[#00E0E0] dark:border-[#00E0E0]/30',
    pillInactive:
      'bg-transparent text-[#687076] hover:text-[#1A1D1E] border-transparent dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB]',
  },
  qa: {
    label: 'Q&A',
    icon: BookOpen,
    iconWrap:
      'border-amber-500/15 bg-amber-500/5 text-amber-600 dark:border-amber-500/15 dark:bg-amber-500/5 dark:text-amber-400',
    typeBadge:
      'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400',
    accentBorder: 'hover:border-amber-500/40 dark:hover:border-amber-500/30',
    filterChip:
      'border-amber-500/20 bg-amber-500/5 text-amber-600 hover:bg-amber-500/10 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400 dark:hover:bg-amber-500/10',
    filterChipActive:
      'border-amber-500 bg-amber-500 text-white dark:border-amber-400 dark:bg-amber-400 dark:text-[#111111]',
    badge:
      'border-amber-500/25 bg-amber-500/5 text-amber-600 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400',
    accent: 'text-amber-600 dark:text-amber-400',
    pillActive:
      'bg-[#FFFFFF] text-amber-600 border-amber-500/30 shadow-sm dark:bg-[#1A1A1A] dark:text-amber-400 dark:border-amber-500/30',
    pillInactive:
      'bg-transparent text-[#687076] hover:text-[#1A1D1E] border-transparent dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB]',
  },
  general: {
    label: 'General',
    icon: FileText,
    iconWrap:
      'border-default bg-bg-muted text-secondary dark:bg-[#A0A0A0]/5',
    typeBadge:
      'border-default bg-bg-muted text-secondary dark:bg-[#A0A0A0]/10',
    accentBorder: 'hover:border-[#687076]/40 dark:hover:border-[#A0A0A0]/30',
    filterChip:
      'border-default bg-bg-muted text-secondary hover:bg-[#E6E8EB] dark:hover:bg-[#2D2D2D]',
    filterChipActive:
      'border-[#1A1D1E] bg-[#1A1D1E] text-white dark:border-[#E4E6EB] dark:bg-[#E4E6EB] dark:text-[#111111]',
    badge: 'border-default bg-bg-muted text-primary dark:bg-[#A0A0A0]/10',
    accent: 'text-secondary',
    pillActive:
      'bg-[#FFFFFF] text-[#1A1D1E] border-[#687076]/30 shadow-sm dark:bg-[#1A1A1A] dark:text-[#E4E6EB] dark:border-[#A0A0A0]/30',
    pillInactive:
      'bg-transparent text-[#687076] hover:text-[#1A1D1E] border-transparent dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB]',
  },
};

export const DIFFICULTY_STYLES = {
  Easy: 'border-green-200/60 bg-green-100/70 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400',
  Medium:
    'border-yellow-200/70 bg-yellow-100/70 text-yellow-700 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-400',
  Hard: 'border-red-200/60 bg-red-100/70 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400',
} as const;
