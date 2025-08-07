import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  onFocus?: () => void;
  onBlur?: () => void;
}

const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  placeholder = 'Add tags...',
  maxTags = 10,
  onFocus,
  onBlur
}) => {
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click on container focuses the input
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // If the input has a comma, add as a tag
    if (newValue.includes(',')) {
      const parts = newValue.split(',');
      const newTags = parts
        .map(part => part.trim())
        .filter(part => part && !value.includes(part));
      
      if (newTags.length > 0 && value.length < maxTags) {
        const tagsToAdd = newTags.slice(0, maxTags - value.length);
        onChange([...value, ...tagsToAdd]);
      }
      
      // Clear the input or keep the remainder
      setInputValue(parts[parts.length - 1].trim());
    } else {
      setInputValue(newValue);
    }
  };

  // Handle key down events (enter, backspace)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      
      if (value.length < maxTags && !value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove the last tag when backspace is pressed on empty input
      const newTags = [...value];
      newTags.pop();
      onChange(newTags);
    }
  };

  // Handle removing a tag by clicking the X
  const removeTag = (index: number) => {
    const newTags = [...value];
    newTags.splice(index, 1);
    onChange(newTags);
  };

  // Handle blur event
  const handleBlur = () => {
    setFocused(false);
    
    // Add the current input value as a tag if it's not empty
    if (inputValue.trim() && value.length < maxTags && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue('');
    }
  };

  // Calculate input width based on container width and tags
  useEffect(() => {
    if (containerRef.current && inputRef.current) {
      // Adjust for padding and other elements
      const containerWidth = containerRef.current.clientWidth;
      // Minimum width to maintain useability
      inputRef.current.style.width = '60px';
    }
  }, [value]);

  return (
    <div 
      ref={containerRef}
      className={`flex flex-wrap gap-2 p-3 min-h-14 w-full rounded-xl border ${
        focused ? 'border-primary' : 'border-border'
      } bg-background transition-all cursor-text items-center`}
      onClick={handleContainerClick}
    >
      {value.map((tag, index) => (
        <div 
          key={`${tag}-${index}`}
          className="flex items-center bg-border/30 text-text rounded-full px-3 py-1 text-sm"
        >
          <span className="mr-1">{tag}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(index);
            }}
            className="ml-1 text-text-muted hover:text-text focus:outline-none"
          >
            ×
          </button>
        </div>
      ))}
      
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setFocused(true);
          if (onFocus) onFocus();
        }}
        onBlur={() => {
          handleBlur();
          if (onBlur) onBlur();
        }}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[60px] bg-transparent border-0 focus:ring-0 focus:outline-none p-0 text-text placeholder:text-text-muted text-base"
      />
    </div>
  );
};

export default TagInput;
