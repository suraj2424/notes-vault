"use client";

import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InlineLabelProps = HTMLAttributes<HTMLElement> & {
  htmlFor?: string;
};

function InlineLabel({ children, htmlFor, className }: InlineLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-[12px] font-bold uppercase tracking-wider text-[#687076] dark:text-[#A0A0A0]",
        className
      )}
    >
      {children}
    </label>
  );
}

export { InlineLabel };
export type { InlineLabelProps };
