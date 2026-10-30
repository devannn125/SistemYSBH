import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-[10px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#15803D]/20 dark:focus:ring-[#22C55E]/30 disabled:pointer-events-none select-none cursor-pointer';

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-11 px-5 text-base gap-2.5',
    icon: 'h-10 w-10 p-0',
  };

  const variantStyles = {
    primary: 'bg-[#15803D] hover:bg-[#166534] dark:bg-[#16A34A] dark:hover:bg-[#15803D] text-white shadow-sm dark:shadow-none active:bg-[#14532D] dark:active:bg-[#14532D]',
    secondary: 'bg-white dark:bg-[#192821] border border-[#15803D] dark:border-[#22C55E] text-[#15803D] dark:text-[#4ADE80] hover:bg-[#F0FDF4] dark:hover:bg-[#22332A] active:bg-[#DCFCE7] dark:active:bg-[#15803D]/30',
    tertiary: 'bg-white dark:bg-[#192821] border border-[#E3EAE5] dark:border-[#2A3F33] text-[#14201A] dark:text-[#EDF7F1] hover:bg-[#F7FAF8] dark:hover:bg-[#22332A] hover:border-[#CBD5E1] dark:hover:border-[#385444]',
    danger: 'bg-[#DC2626] hover:bg-[#B91C1C] dark:bg-[#DC2626] dark:hover:bg-[#EF4444] text-white shadow-sm dark:shadow-none active:bg-[#991B1B]',
    ghost: 'bg-transparent text-[#586862] dark:text-[#8FA89B] hover:bg-[#F0FDF4] dark:hover:bg-[#192821] hover:text-[#15803D] dark:hover:text-[#4ADE80]',
  };

  const disabledStyles = disabled || loading
    ? 'bg-[#E3EAE5] dark:bg-[#22332A] border-transparent text-[#586862] dark:text-[#64748B] opacity-70 cursor-not-allowed shadow-none'
    : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${disabledStyles || variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
      ) : null}
      {children}
    </button>
  );
}
