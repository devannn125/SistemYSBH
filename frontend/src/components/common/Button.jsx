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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#059669]/30 disabled:pointer-events-none select-none cursor-pointer ios-press';

  const sizeStyles = {
    sm: 'h-9 px-3.5 text-xs gap-1.5 rounded-xl min-h-[36px]',
    md: 'h-11 px-5 text-sm gap-2 min-h-[44px]',
    lg: 'h-12 px-6 text-base gap-2.5 rounded-2xl min-h-[48px]',
    icon: 'h-11 w-11 p-0 rounded-2xl min-h-[44px] min-w-[44px]',
  };

  const variantStyles = {
    primary: 'bg-[#059669] hover:bg-[#047857] text-white shadow-sm shadow-[#059669]/20 active:bg-[#065F46]',
    secondary: 'bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-[#1C1C1E] dark:text-[#F5F5F7] border border-black/[0.05] dark:border-white/[0.08]',
    tertiary: 'bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.1] text-[#1C1C1E] dark:text-[#F5F5F7] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]',
    danger: 'bg-[#FF3B30] hover:bg-[#D70015] text-white shadow-sm active:bg-[#B30010]',
    ghost: 'bg-transparent text-[#8E8E93] dark:text-[#98989D] hover:text-[#1C1C1E] dark:hover:text-[#F5F5F7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
  };

  const disabledStyles = disabled || loading
    ? 'bg-black/[0.04] dark:bg-white/[0.04] border-transparent text-[#8E8E93] dark:text-[#64748B] opacity-50 cursor-not-allowed shadow-none'
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
        <Loader2 className="w-4 h-4 animate-spin shrink-0" strokeWidth={2} />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
      ) : null}
      {children}
    </button>
  );
}
