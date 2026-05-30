"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type DropdownOption<T extends string> = { label: string; value: T };

type DropdownProps<T extends string> = {
  value: T;
  options: DropdownOption<T>[];
  onChange: (next: T) => void;
  ariaLabel: string;
};

function Dropdown<T extends string>({ value, options, onChange, ariaLabel }: DropdownProps<T>) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const root = target.closest("[data-dropdown-root='true']");
      if (!root) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div className="relative w-full" data-dropdown-root="true">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "h-9 w-full rounded-md border px-3 text-sm font-medium outline-none text-left transition-colors duration-100",
          "border-[#E6E8EB] bg-[#FFFFFF] text-[#1A1D1E]",
          "hover:bg-[#E6E8EB]/50 focus:border-[#687076]/40 focus:bg-[#FFFFFF]",
          "dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#E4E6EB] dark:hover:bg-[#2D2D2D]/50 dark:focus:border-[#A0A0A0]/40 dark:focus:bg-[#1A1A1A]"
        )}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="truncate">{current}</span>
          <ChevronLeft
            className={cn(
              "h-3.5 w-3.5 rotate-[-90deg] text-[#687076]/60 transition-transform duration-100 shrink-0",
              open && "rotate-[90deg]"
            )}
          />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          tabIndex={-1}
          className={cn(
            "absolute z-20 mt-1 w-full overflow-hidden rounded-md border shadow-md",
            "bg-[#FFFFFF] border-[#E6E8EB]",
            "dark:border-[#2D2D2D] dark:bg-[#1A1A1A]"
          )}
        >
          {options.map((opt) => (
            <button
              type="button"
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "w-full px-3 py-2 text-left text-sm font-medium transition-colors duration-100",
                opt.value === value
                  ? "bg-[#F4F7F6] font-bold text-[#1A1D1E] dark:bg-[#111111] dark:text-[#E4E6EB]"
                  : "text-[#687076] hover:bg-[#F4F7F6]/60 dark:text-[#A0A0A0] dark:hover:bg-[#111111]/50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { Dropdown };
export type { DropdownOption, DropdownProps };
