import * as React from "react";
import { cn } from "../../lib/utils";

export function Badge({
  className,
  variant = "default",
  dot = false,
  children,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-colors select-none";

  const variants = {
    default:
      "bg-[#059669]/10 text-[#059669] dark:bg-[#059669]/20 dark:text-[#34D399]",
    success:
      "bg-[#34C759]/10 text-[#248A3D] dark:bg-[#34C759]/20 dark:text-[#30D158]",
    warning:
      "bg-[#FF9500]/10 text-[#B26A00] dark:bg-[#FF9500]/20 dark:text-[#FF9F0A]",
    danger:
      "bg-[#FF3B30]/10 text-[#D70015] dark:bg-[#FF3B30]/20 dark:text-[#FF453A]",
    info:
      "bg-[#007AFF]/10 text-[#0062CC] dark:bg-[#007AFF]/20 dark:text-[#0A84FF]",
    neutral:
      "bg-black/[0.05] text-[#8E8E93] dark:bg-white/[0.08] dark:text-[#98989D]",
  };

  const dotColors = {
    default: "bg-[#059669]",
    success: "bg-[#34C759]",
    warning: "bg-[#FF9500]",
    danger: "bg-[#FF3B30]",
    info: "bg-[#007AFF]",
    neutral: "bg-[#8E8E93]",
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}
