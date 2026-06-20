import React, { useState, useRef, useEffect, useMemo } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

interface SearchableSelectProps {
  options?: SelectOption[];
  groupedOptions?: SelectOptionGroup[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options = [],
  groupedOptions,
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const allOptions = useMemo(() => {
    if (groupedOptions) {
      return groupedOptions.flatMap(g => g.options);
    }
    return options;
  }, [options, groupedOptions]);

  const selectedOption = allOptions.find((opt) => opt.value === value);

  const filteredOptions = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    if (groupedOptions) {
      return groupedOptions.map(group => ({
        label: group.label,
        options: group.options.filter(opt => opt.label.toLowerCase().includes(lowerSearch))
      })).filter(group => group.options.length > 0);
    }
    if (!searchTerm) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(lowerSearch));
  }, [options, groupedOptions, searchTerm]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  const defaultClassName = "w-full min-h-[calc(1.5em+0.75rem+2px)] px-[0.75rem] py-[0.375rem] text-[1rem] font-normal text-[#6e707e] bg-white border border-[#d1d3e2] rounded-[0.35rem] outline-none transition-colors flex items-center justify-between cursor-pointer";
  const activeClassName = isOpen ? "border-[#bac8f3] ring ring-[rgba(78,115,223,0.25)]" : "focus:border-[#bac8f3] focus:ring focus:ring-[rgba(78,115,223,0.25)]";

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <div
        className={`${defaultClassName} ${activeClassName} ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''} ${className}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <span className={selectedOption ? 'text-[#6e707e]' : 'text-[#858796]'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <i className={`fas fa-chevron-down text-xs text-[#858796] transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-[1000] mt-1 w-full bg-white border border-[#d1d3e2] rounded-[0.35rem] shadow-lg animate-fade-in origin-top">
          {/* Search Input */}
          <div className="p-2 border-b border-[#e3e6f0]">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858796]">
                <i className="fas fa-search text-xs"></i>
              </span>
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-[#d1d3e2] rounded-[0.25rem] text-[#6e707e] outline-none focus:bg-white focus:border-[#bac8f3] transition-colors"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking input
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[#858796] text-center italic">
                No results found
              </div>
            ) : groupedOptions ? (
              (filteredOptions as SelectOptionGroup[]).map((group, gIdx) => (
                <div key={gIdx} className="mb-2 last:mb-0">
                  <div className="px-3 py-1.5 text-xs font-bold text-[#858796] uppercase tracking-wider bg-gray-50 border-y border-[#e3e6f0] sticky top-0 z-10">
                    {group.label}
                  </div>
                  {group.options.map((opt) => (
                    <div
                      key={opt.value}
                      className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                        opt.value === value
                          ? 'bg-[#4e73df] text-white font-bold'
                          : 'text-[#5a5c69] hover:bg-[#eaecf4]'
                      }`}
                      onClick={() => handleSelect(opt.value)}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              (filteredOptions as SelectOption[]).map((opt) => (
                <div
                  key={opt.value}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    opt.value === value
                      ? 'bg-[#4e73df] text-white font-bold'
                      : 'text-[#5a5c69] hover:bg-[#eaecf4]'
                  }`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
