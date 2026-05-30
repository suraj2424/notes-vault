"use client";

import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SectionDividerProps = HTMLAttributes<HTMLDivElement>;

function SectionDivider({ children, className }: SectionDividerProps) {
  return (
    <div
      className={cn(
        "pt-6 pb-3 border-b border-[#E6E8EB] dark:border-[#2D2D2D] mb-4",
        className
      )}
    >
      <span className="text-[12px] font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0]">
        {children}
      </span>
    </div>
  );
}

export { SectionDivider };
export type { SectionDividerProps };
