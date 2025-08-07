import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export interface SelectOption {
  value: string;
  label: string;
  image?: string;
}

interface SelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  allowClear?: boolean;
  clearText?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  allowClear = true,
  clearText = 'No selection'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update selected option when value changes externally
  useEffect(() => {
    if (value) {
      const selected = options.find(option => option.value === value);
      if (selected) {
        setSelectedOption(selected);
      } else {
        setSelectedOption(null);
      }
    } else {
      setSelectedOption(null);
    }
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionSelect = (option: SelectOption | null) => {
    setSelectedOption(option);
    onChange(option ? option.value : null);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-3 border border-border rounded-xl bg-background/80 backdrop-blur-md text-text"
      >
        {selectedOption ? (
          <div className="flex items-center gap-2">
            {selectedOption.image && (
              <div className="relative w-6 h-6 rounded-full overflow-hidden">
                <Image
                  src={selectedOption.image}
                  alt={selectedOption.label}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <span>{selectedOption.label}</span>
          </div>
        ) : (
          <span className="text-text-muted">{placeholder}</span>
        )}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          fill="currentColor" 
          viewBox="0 0 256 256"
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background/80 backdrop-blur-md border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Option to clear selection */}
          {allowClear && (
            <div 
              className="p-3 hover:bg-border/20 cursor-pointer flex items-center"
              onClick={() => handleOptionSelect(null)}
            >
              <span className="text-text-muted">{clearText}</span>
            </div>
          )}

          {/* List of options */}
          {options.map(option => (
            <div
              key={option.value}
              className={`p-3 cursor-pointer flex items-center gap-2 ${
                selectedOption?.value === option.value ? 'bg-primary/10' : 'hover:bg-border/20'
              }`}
              onClick={() => handleOptionSelect(option)}
            >
              {option.image && (
                <div className="relative w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src={option.image}
                    alt={option.label}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <span>{option.label}</span>
            </div>
          ))}

          {options.length === 0 && (
            <div className="p-3 text-text-muted text-center">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Select;
