import * as React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  disabled = false,
  icon: Icon,
  children,
  type = "button",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/40 disabled:pointer-events-none disabled:opacity-50 ios-press";

  const variants = {
    default:
      "bg-[#059669] hover:bg-[#047857] text-white shadow-sm shadow-[#059669]/20 rounded-2xl active:bg-[#065F46]",
    secondary:
      "bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-[#1C1C1E] dark:text-[#F5F5F7] rounded-2xl active:bg-black/[0.12]",
    outline:
      "border border-black/[0.1] dark:border-white/[0.12] bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-md text-[#1C1C1E] dark:text-[#F5F5F7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-2xl",
    ghost:
      "bg-transparent text-[#8E8E93] dark:text-[#98989D] hover:text-[#1C1C1E] dark:hover:text-[#F5F5F7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-xl",
    destructive:
      "bg-[#FF3B30] hover:bg-[#D70015] text-white shadow-sm rounded-2xl active:bg-[#B30010]",
    pill:
      "bg-[#059669] hover:bg-[#047857] text-white shadow-md shadow-[#059669]/25 rounded-full active:bg-[#065F46]",
  };

  const sizes = {
    default: "h-11 px-5 text-sm gap-2 min-h-[44px]", // Apple 44px HIG min touch target
    sm: "h-9 px-3.5 text-xs gap-1.5 rounded-xl min-h-[36px]",
    lg: "h-12 px-6 text-base gap-2.5 rounded-2xl min-h-[48px]",
    icon: "h-11 w-11 p-0 rounded-2xl min-h-[44px] min-w-[44px]",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
