import React from 'react';

export function Card({ children, className = '', header, footer, padding = 'p-6', ...props }) {
  return (
    <div
      className={`bg-white dark:bg-[#14201A] text-[#14201A] dark:text-[#EDF7F1] rounded-[10px] border border-[#E3EAE5] dark:border-[#22332A] shadow-[0_2px_4px_rgba(20,32,26,0.03)] overflow-hidden transition-colors ${className}`}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-[#E3EAE5] dark:border-[#22332A] flex items-center justify-between">
          {header}
        </div>
      )}
      <div className={padding}>{children}</div>
      {footer && (
        <div className="px-6 py-3.5 bg-[#F7FAF8] dark:bg-[#192821] border-t border-[#E3EAE5] dark:border-[#22332A] flex items-center justify-between text-[#586862] dark:text-[#8FA89B]">
          {footer}
        </div>
      )}
    </div>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeStatus = 'draft',
  trend,
  className = '',
}) {
  return (
    <Card className={`relative overflow-hidden ${className}`} padding="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#586862] dark:text-[#8FA89B] tracking-wide uppercase mb-1.5">{title}</p>
          <p className="text-2xl font-bold font-mono tracking-tight text-[#14201A] dark:text-white">{value}</p>
        </div>
        {Icon && (
          <div className="p-2.5 rounded-[10px] bg-[#F0FDF4] dark:bg-[#15803D]/20 border border-[#DCFCE7] dark:border-[#15803D]/40 text-[#15803D] dark:text-[#4ADE80]">
            <Icon className="w-5 h-5" strokeWidth={1.75} />
          </div>
        )}
      </div>

      {(subtitle || trend || badgeText) && (
        <div className="mt-3.5 pt-3 border-t border-[#E3EAE5] dark:border-[#22332A] flex items-center justify-between text-xs text-[#586862] dark:text-[#8FA89B]">
          <span>{subtitle}</span>
          {badgeText && (
            <span className="font-semibold text-[#15803D] dark:text-[#4ADE80] bg-[#DCFCE7] dark:bg-[#15803D]/25 px-2 py-0.5 rounded-full text-[11px]">
              {badgeText}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
