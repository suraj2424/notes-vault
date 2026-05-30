"use client";

import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement>;

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      {...props}
      className={cn(
        "h-9 w-full rounded-md border px-3 text-sm font-medium outline-none transition-colors duration-100",
        "border-[#E6E8EB] bg-[#FFFFFF] hover:bg-[#E6E8EB]/50 text-[#1A1D1E] placeholder:text-[#687076]/50",
        "focus:border-[#687076]/40 focus:bg-[#FFFFFF]",
        "dark:border-[#2D2D2D] dark:bg-[#1A1A1A] dark:text-[#E4E6EB] dark:placeholder:text-[#A0A0A0]/40 dark:focus:border-[#A0A0A0]/40 dark:focus:bg-[#1A1A1A] dark:hover:bg-[#2D2D2D]/50",
        className
      )}
    />
  )
);

InputField.displayName = "InputField";

export { InputField };
export type { InputFieldProps };
