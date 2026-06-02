"use client";

import { useMemo } from "react";
import { NoteType } from "@/types";
import { cn } from "@/lib/utils";
import { NOTE_TYPE_META } from "@/lib/note-styles";

type NoteTypeSelectorProps = {
  type: NoteType;
  onTypeChange: (next: NoteType) => void;
  isSaving: boolean;
};

function PillIcon({ type }: { type: NoteType }) {
  const Icon = NOTE_TYPE_META[type].icon;
  return <Icon className="h-3 w-3" />;
}

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
            className={cn(pillBase, type === t ? NOTE_TYPE_META[t].pillActive : NOTE_TYPE_META[t].pillInactive)}
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
              type === t ? NOTE_TYPE_META[t].pillActive : "text-[#687076] dark:text-[#A0A0A0]"
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
