import React from 'react';
import { useSavePrompt } from '@/hooks/useSavePrompt';

interface SaveButtonProps {
  promptId: string;
  initialSaved?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onSaveChange?: (isSaved: boolean) => void;
}

/**
 * Reusable Save Button component for prompts
 */
const SaveButton: React.FC<SaveButtonProps> = ({
  promptId,
  initialSaved = false,
  size = 'md',
  className = '',
  onSaveChange
}) => {
  const { isSaved, isLoading, toggleSave } = useSavePrompt(
    initialSaved, 
    promptId, 
    onSaveChange
  );

  // Size-based styling
  const getIconSize = () => {
    switch (size) {
      case 'sm': return '18px';
      case 'lg': return '24px';
      case 'md':
      default: return '20px';
    }
  };

  // Button size class
  const buttonSizeClass = size === 'sm' 
    ? 'p-1' 
    : size === 'lg' 
      ? 'p-2.5' 
      : 'p-2';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${isSaved ? 'text-[#bada55]' : 'text-text-muted hover:text-primary'} flex-shrink-0 ${buttonSizeClass} rounded-full hover:bg-border/30 transition-colors disabled:opacity-50 ${className}`}
      title={isSaved ? "Remove from saved" : "Save prompt"}
      aria-label={isSaved ? "Remove from saved" : "Save prompt"}
    >
      {isSaved ? (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width={getIconSize()} 
          height={getIconSize()} 
          fill="currentColor" 
          viewBox="0 0 256 256"
        >
          <path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Z"></path>
        </svg>
      ) : (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width={getIconSize()} 
          height={getIconSize()} 
          fill="currentColor" 
          viewBox="0 0 256 256"
        >
          <path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32ZM72,48H184V208.57l-51.77-32.35a8,8,0,0,0-8.47,0L72,208.57Z"></path>
        </svg>
      )}
    </button>
  );
};

export default SaveButton;
