import React from 'react';

export function Card({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  footer,
  padding = true,
  glass = false,
  ...props
}) {
  return (
    <div
      className={`${
        glass
          ? 'ios-glass rounded-3xl shadow-sm'
          : 'ios-card rounded-3xl bg-white dark:bg-[#1C1C1E]'
      } ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-black/[0.05] dark:border-white/[0.06]">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-[#1C1C1E] dark:text-[#F5F5F7] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className={padding ? 'p-6' : ''}>{children}</div>

      {footer && (
        <div className="px-6 py-4 bg-black/[0.015] dark:bg-white/[0.02] border-t border-black/[0.05] dark:border-white/[0.06] rounded-b-3xl">
          {footer}
        </div>
      )}
    </div>
  );
}
