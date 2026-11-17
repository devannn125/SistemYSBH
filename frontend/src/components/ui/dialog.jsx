import * as React from "react";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

export function Dialog({ open, onClose, children, className }) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Content Container (Bottom sheet on mobile, centered squircle on desktop) */}
      <div
        className={cn(
          "relative z-50 w-full sm:max-w-lg bg-white dark:bg-[#1C1C1E] rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-black/[0.05] dark:border-white/[0.08] overflow-hidden max-h-[92vh] flex flex-col transform transition-transform duration-250 ease-out animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2",
          className
        )}
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-black/20 dark:bg-white/20 rounded-full" />
        </div>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, title, description, onClose }) {
  return (
    <div className={cn("px-6 pt-5 pb-3 flex items-start justify-between border-b border-black/[0.05] dark:border-white/[0.06]", className)}>
      <div className="space-y-1">
        {title && (
          <h2 className="text-lg font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F5F5F7]">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-xs text-[#8E8E93] dark:text-[#98989D]">
            {description}
          </p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F5F5F7] transition-colors ios-press"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function DialogBody({ className, children }) {
  return (
    <div className={cn("p-6 overflow-y-auto space-y-4", className)}>
      {children}
    </div>
  );
}

export function DialogFooter({ className, children }) {
  return (
    <div
      className={cn(
        "px-6 py-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-end gap-2.5",
        className
      )}
    >
      {children}
    </div>
  );
}
