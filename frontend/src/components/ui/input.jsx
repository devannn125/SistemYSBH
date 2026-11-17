import * as React from "react";
import { cn } from "../../lib/utils";

export const Input = React.forwardRef(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md px-4 py-2 text-sm text-[#1C1C1E] dark:text-[#F5F5F7] placeholder:text-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] transition-all disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Textarea = React.forwardRef(
  ({ className, rows = 3, ...props }, ref) => {
    return (
      <textarea
        rows={rows}
        className={cn(
          "flex w-full rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md px-4 py-3 text-sm text-[#1C1C1E] dark:text-[#F5F5F7] placeholder:text-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] transition-all disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
