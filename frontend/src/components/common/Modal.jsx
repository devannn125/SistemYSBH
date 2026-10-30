import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  variant = 'default', // 'default' | 'danger'
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#14201A]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div 
        className={`relative w-full ${maxWidth} bg-white dark:bg-[#14201A] text-[#14201A] dark:text-[#EDF7F1] rounded-[10px] border border-[#E3EAE5] dark:border-[#22332A] shadow-xl overflow-hidden z-10 animate-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E3EAE5] dark:border-[#22332A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {variant === 'danger' && (
              <div className="p-2 rounded-full bg-[#FEE2E2] dark:bg-[#DC2626]/20 text-[#DC2626] dark:text-[#F87171]">
                <AlertTriangle className="w-5 h-5" strokeWidth={1.75} />
              </div>
            )}
            <div>
              <h3 className="text-base font-semibold text-[#14201A] dark:text-white">{title}</h3>
              {subtitle && <p className="text-xs text-[#586862] dark:text-[#8FA89B] mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[8px] text-[#586862] dark:text-[#8FA89B] hover:text-[#14201A] dark:hover:text-white hover:bg-[#F7FAF8] dark:hover:bg-[#192821] transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-[#F7FAF8] dark:bg-[#192821] border-t border-[#E3EAE5] dark:border-[#22332A] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
