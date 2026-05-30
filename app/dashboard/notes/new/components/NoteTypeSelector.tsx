"use client";

import { useMemo } from "react";
import { NoteType } from "@/types";
import { FileText, Code2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_PILL_STYLES = {
  general: {
    active: "bg-[#FFFFFF] text-[#1A1D1E] border-[#687076]/30 shadow-sm dark:bg-[#1A1A1A] dark:text-[#E4E6EB] dark:border-[#A0A0A0]/30",
    inactive: "bg-transparent text-[#687076] hover:text-[#1A1D1E] border-transparent dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB]",
  },
  dsa: {
    active: "bg-[#FFFFFF] text-[#00A3A3] border-[#00A3A3]/30 shadow-sm dark:bg-[#1A1A1A] dark:text-[#00E0E0] dark:border-[#00E0E0]/30",
    inactive: "bg-transparent text-[#687076] hover:text-[#1A1D1E] border-transparent dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB]",
  },
  qa: {
    active: "bg-[#FFFFFF] text-amber-600 border-amber-500/30 shadow-sm dark:bg-[#1A1A1A] dark:text-amber-400 dark:border-amber-500/30",
    inactive: "bg-transparent text-[#687076] hover:text-[#1A1D1E] border-transparent dark:text-[#A0A0A0] dark:hover:text-[#E4E6EB]",
  },
} as const;

const TYPE_ICONS = {
  general: FileText,
  dsa: Code2,
  qa: BookOpen,
} as const;

function PillIcon({ type }: { type: NoteType }) {
  const Icon = TYPE_ICONS[type];
  return <Icon className="h-3 w-3" />;
}

type NoteTypeSelectorProps = {
  type: NoteType;
  onTypeChange: (next: NoteType) => void;
  isSaving: boolean;
};

function NoteTypeSelector({ type, onTypeChange, isSaving }: NoteTypeSelectorProps) {
  const pillBase = useMemo(
    () =>
      cn(
        "flex items-center gap-1.5 px-3 h-7 rounded-full text-[12px] font-bold uppercase tracking-wide border border-transparent transition-all duration-100",
        "disabled:opacity-50"
      ),
    []
  );

  return (
    <>
      {/* Desktop pill selectors */}
      <div className="hidden sm:flex items-center gap-0.5 p-0.5 rounded-full bg-[#F4F7F6] dark:bg-[#111111] border border-[#E6E8EB] dark:border-[#2D2D2D]">
        {(["general", "dsa", "qa"] as const).map((t) => (
          <button
            key={t}
            type="button"
            disabled={isSaving}
            onClick={() => onTypeChange(t)}
            className={cn(pillBase, type === t ? TYPE_PILL_STYLES[t].active : TYPE_PILL_STYLES[t].inactive)}
          >
            <PillIcon type={t} />
            {t === "qa" ? "Q&A" : t}
          </button>
        ))}
      </div>

      {/* Mobile minimalist icon selectors */}
      <div className="flex sm:hidden items-center gap-0.5 p-0.5 rounded-full bg-[#F4F7F6] dark:bg-[#111111] border border-[#E6E8EB] dark:border-[#2D2D2D]">
        {(["general", "dsa", "qa"] as const).map((t) => (
          <button
            key={t}
            type="button"
            disabled={isSaving}
            onClick={() => onTypeChange(t)}
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-full border border-transparent transition-all duration-100",
              "disabled:opacity-50",
              type === t ? TYPE_PILL_STYLES[t].active : "text-[#687076] dark:text-[#A0A0A0]"
            )}
          >
            <PillIcon type={t} />
          </button>
        ))}
      </div>
    </>
  );
}

export { NoteTypeSelector };
export type { NoteTypeSelectorProps };
