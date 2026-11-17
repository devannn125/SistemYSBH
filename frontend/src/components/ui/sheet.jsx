import * as React from "react";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

export function Sheet({ open, onClose, side = "left", children, className }) {
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

  const sideAnimations = {
    left: "left-0 top-0 bottom-0 max-w-[300px] w-full rounded-r-3xl animate-in slide-in-from-left duration-300",
    right: "right-0 top-0 bottom-0 max-w-[300px] w-full rounded-l-3xl animate-in slide-in-from-right duration-300",
    bottom: "bottom-0 left-0 right-0 max-h-[85vh] rounded-t-[32px] animate-in slide-in-from-bottom duration-300",
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed z-50 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl shadow-2xl border-black/[0.06] dark:border-white/[0.08] flex flex-col overflow-hidden",
          sideAnimations[side],
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ title, description, onClose, className }) {
  return (
    <div className={cn("p-6 pb-4 flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.06]", className)}>
      <div className="space-y-1">
        {title && (
          <h2 className="text-base font-semibold text-[#1C1C1E] dark:text-[#F5F5F7]">
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

export function SheetBody({ className, children }) {
  return (
    <div className={cn("p-6 overflow-y-auto flex-1 space-y-4", className)}>
      {children}
    </div>
  );
}
