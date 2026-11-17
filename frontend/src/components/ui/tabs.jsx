import * as React from "react";
import { cn } from "../../lib/utils";

export function TabsList({ className, children }) {
  return (
    <div
      className={cn(
        "inline-flex items-center p-1 bg-black/[0.05] dark:bg-white/[0.08] rounded-full backdrop-blur-md select-none",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabTrigger({ active, onClick, icon: Icon, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 ios-press cursor-pointer",
        active
          ? "bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-[#F5F5F7] shadow-sm shadow-black/[0.08]"
          : "text-[#8E8E93] dark:text-[#98989D] hover:text-[#1C1C1E] dark:hover:text-[#F5F5F7]",
        className
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </button>
  );
}
