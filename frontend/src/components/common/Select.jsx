import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';

export function Select({
  label,
  value,
  onChange,
  options,
  children,
  placeholder = 'Pilih opsi...',
  className = '',
  selectClassName = '',
  error,
  icon: Icon,
  required = false,
  disabled = false,
  name,
  id: customId,
  searchable = false,
  size = 'md', // 'sm' | 'md'
  ...props
}) {
  const generatedId = useId();
  const id = customId || generatedId;
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0, openUpwards: false });

  // Parse options from `options` prop or from `<option>` children
  const parsedOptions = useMemo(() => {
    if (options && Array.isArray(options) && options.length > 0) {
      return options.map((opt) => {
        if (typeof opt === 'object' && opt !== null) {
          return {
            value: opt.value ?? '',
            label: opt.label ?? opt.name ?? String(opt.value),
            sublabel: opt.sublabel ?? opt.description,
            badge: opt.badge,
            disabled: opt.disabled ?? false,
          };
        }
        return { value: opt, label: String(opt), disabled: false };
      });
    }

    const items = [];
    const extractFromChildren = (kids) => {
      React.Children.forEach(kids, (child) => {
        if (!child) return;
        if (React.isValidElement(child)) {
          if (child.type === 'option') {
            const rawLabel = child.props.children;
            const str = typeof rawLabel === 'string' ? rawLabel : String(rawLabel ?? '');
            
            // Check if label contains technical format template e.g. "(Format: {seq:3}/...)"
            const formatMatch = str.match(/\(Format:\s*([^\)]+)\)/i);
            if (formatMatch) {
              const cleanLabel = str.replace(/\(Format:\s*[^\)]+\)/i, '').trim();
              const template = formatMatch[1];
              const examplePreview = template
                .replace('{seq:3}', '001')
                .replace('{month_roman}', 'X')
                .replace('{year}', '2026')
                .replace('{code}', '');

              items.push({
                value: child.props.value ?? '',
                label: cleanLabel,
                sublabel: `Contoh format: ${examplePreview}`,
                badge: child.props['data-badge'] || child.props.badge,
                disabled: child.props.disabled ?? false,
              });
            } else {
              items.push({
                value: child.props.value ?? '',
                label: rawLabel,
                sublabel: child.props['data-sublabel'] || child.props.sublabel,
                badge: child.props['data-badge'] || child.props.badge,
                disabled: child.props.disabled ?? false,
              });
            }
          } else if (child.props && child.props.children) {
            extractFromChildren(child.props.children);
          }
        }
      });
    };

    extractFromChildren(children);
    return items;
  }, [options, children]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return parsedOptions.find((opt) => String(opt.value) === String(value));
  }, [parsedOptions, value]);

  // Filter options by search term if search enabled or large list
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return parsedOptions;
    const term = searchTerm.toLowerCase();
    return parsedOptions.filter((opt) => {
      const matchLabel = typeof opt.label === 'string' && opt.label.toLowerCase().includes(term);
      const matchSub = typeof opt.sublabel === 'string' && opt.sublabel.toLowerCase().includes(term);
      const matchBadge = typeof opt.badge === 'string' && opt.badge.toLowerCase().includes(term);
      return matchLabel || matchSub || matchBadge;
    });
  }, [parsedOptions, searchTerm]);

  // Position calculation for Portal dropdown
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const menuEstimatedHeight = Math.min(300, filteredOptions.length * 44 + 50);

    const openUpwards = spaceBelow < menuEstimatedHeight && spaceAbove > spaceBelow;

    setMenuPosition({
      top: openUpwards ? rect.top - 6 : rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      openUpwards,
      maxHeight: Math.min(280, openUpwards ? spaceAbove - 20 : spaceBelow - 20),
    });
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setSearchTerm('');
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelect = (option) => {
    if (option.disabled) return;
    if (onChange) {
      onChange({
        target: { value: option.value, name: name || id },
        currentTarget: { value: option.value, name: name || id },
      }, option.value);
    }
    setIsOpen(false);
  };

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleScrollOrResize = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      updatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, filteredOptions.length]);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen && (searchable || parsedOptions.length > 8) && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, searchable, parsedOptions.length]);

  // Determine dark mode
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const showSearch = searchable || parsedOptions.length > 8;

  // Display label
  const displayLabel = selectedOption
    ? selectedOption.label
    : (placeholder || (parsedOptions[0]?.label ?? ''));

  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-[#14201A] dark:text-[#EDF7F1] mb-1.5"
        >
          {label} {required && <span className="text-[#DC2626]">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full ${
          size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-10 px-3.5 text-sm'
        } bg-white dark:bg-[#192821] rounded-[10px] border ${
          error
            ? 'border-[#DC2626] ring-1 ring-[#DC2626]'
            : isOpen
            ? 'border-[#15803D] dark:border-[#22C55E] ring-2 ring-[#15803D]/20 dark:ring-[#22C55E]/20'
            : 'border-[#E3EAE5] dark:border-[#2A3F33] hover:border-[#CBD5E1] dark:hover:border-[#334D3F] focus:border-[#15803D] dark:focus:border-[#22C55E] focus:ring-2 focus:ring-[#15803D]/20'
        } text-[#14201A] dark:text-white flex items-center justify-between gap-2 cursor-pointer transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_1px_2px_rgba(20,32,26,0.02)] ${selectClassName}`}
        {...props}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          {Icon && (
            <Icon
              className="w-4 h-4 text-[#586862] dark:text-[#8FA89B] shrink-0"
              strokeWidth={1.75}
            />
          )}
          {selectedOption?.badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-[4px] bg-[#DCFCE7] dark:bg-[#15803D]/30 text-[#15803D] dark:text-[#4ADE80] shrink-0">
              {selectedOption.badge}
            </span>
          )}
          <span
            className={`truncate ${
              !selectedOption && placeholder ? 'text-[#586862] dark:text-[#6E8578]' : ''
            }`}
          >
            {displayLabel}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-[#586862] dark:text-[#8FA89B] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#15803D] dark:text-[#22C55E]' : ''
          }`}
          strokeWidth={2}
        />
      </button>

      {/* Hidden input for native form validation */}
      <input
        type="text"
        tabIndex={-1}
        className="opacity-0 pointer-events-none absolute bottom-0 left-1/2 w-px h-px"
        name={name || id}
        value={value || ''}
        required={required}
        onChange={() => {}}
      />

      {error && <p className="mt-1 text-xs text-[#DC2626]">{error}</p>}

      {/* Portal Dropdown Menu */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className={isDark ? 'dark' : ''}>
            <div
              ref={menuRef}
              role="listbox"
              style={{
                position: 'fixed',
                left: `${menuPosition.left}px`,
                width: `${menuPosition.width}px`,
                top: menuPosition.openUpwards ? 'auto' : `${menuPosition.top}px`,
                bottom: menuPosition.openUpwards
                  ? `${window.innerHeight - menuPosition.top}px`
                  : 'auto',
                maxHeight: `${menuPosition.maxHeight || 280}px`,
                zIndex: 99999,
              }}
              className="bg-white dark:bg-[#192821] text-[#14201A] dark:text-[#EDF7F1] border border-[#E3EAE5] dark:border-[#2A3F33] rounded-[10px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
            >
              {/* Optional Search Input */}
              {showSearch && (
                <div className="p-2 border-b border-[#E3EAE5] dark:border-[#22332A] bg-[#F7FAF8] dark:bg-[#14201A]">
                  <div className="relative">
                    <Search
                      className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#586862] dark:text-[#8FA89B]"
                      strokeWidth={2}
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Cari pilihan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#192821] border border-[#E3EAE5] dark:border-[#2A3F33] rounded-[6px] text-[#14201A] dark:text-white placeholder-[#586862] dark:placeholder-[#6E8578] focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                    />
                  </div>
                </div>
              )}

              {/* Options List */}
              <div className="overflow-y-auto py-1 max-h-60 divide-y divide-transparent">
                {filteredOptions.length === 0 ? (
                  <div className="px-3.5 py-4 text-center text-xs text-[#586862] dark:text-[#8FA89B]">
                    Tidak ada opsi yang cocok
                  </div>
                ) : (
                  filteredOptions.map((opt, index) => {
                    const isSelected = String(opt.value) === String(value);
                    return (
                      <div
                        key={`${opt.value}-${index}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(opt)}
                        className={`px-3.5 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                          opt.disabled
                            ? 'opacity-40 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#DCFCE7]/70 dark:bg-[#15803D]/25 text-[#15803D] dark:text-[#4ADE80] font-semibold'
                            : 'text-[#14201A] dark:text-[#EDF7F1] hover:bg-[#F0FDF4] dark:hover:bg-[#22332A] hover:text-[#15803D] dark:hover:text-[#4ADE80]'
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            {opt.badge && (
                              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-[4px] bg-[#DCFCE7] dark:bg-[#15803D]/30 text-[#15803D] dark:text-[#4ADE80] shrink-0">
                                {opt.badge}
                              </span>
                            )}
                            <span className="truncate">{opt.label}</span>
                          </div>
                          {opt.sublabel && (
                            <span className="text-[11px] text-[#586862] dark:text-[#8FA89B] font-mono mt-0.5 truncate">
                              {opt.sublabel}
                            </span>
                          )}
                        </div>

                        {isSelected && (
                          <Check
                            className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0"
                            strokeWidth={2.2}
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
