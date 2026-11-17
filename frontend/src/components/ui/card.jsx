import * as React from "react";
import { cn } from "../../lib/utils";

export function Card({ className, glass = false, ...props }) {
  return (
    <div
      className={cn(
        glass
          ? "ios-glass rounded-3xl p-6 shadow-sm"
          : "ios-card rounded-3xl p-6 bg-white dark:bg-[#1C1C1E]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 pb-4", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn(
        "font-semibold text-lg text-[#1C1C1E] dark:text-[#F5F5F7] tracking-tight leading-none",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return (
    <p
      className={cn("text-xs text-[#8E8E93] dark:text-[#98989D] leading-relaxed", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn("pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn("flex items-center pt-4 border-t border-black/[0.05] dark:border-white/[0.06]", className)}
      {...props}
    />
  );
}
