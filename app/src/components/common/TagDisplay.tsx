import React, { useState } from 'react';
import Link from 'next/link';

interface TagDisplayProps {
  tags: string[];
  clickable?: boolean;
  className?: string;
  maxDisplay?: number;
  showIcon?: boolean;
  insidePromptCard?: boolean;
}

const TagDisplay: React.FC<TagDisplayProps> = ({ 
  tags, 
  clickable = false,
  className = '',
  maxDisplay = 3,
  showIcon = true,
  insidePromptCard = false
}) => {
  const [showAll, setShowAll] = useState(false);
  
  if (!tags || tags.length === 0) {
    return null;
  }

  const displayTags = showAll ? tags : tags.slice(0, maxDisplay);
  const hasMore = tags.length > maxDisplay;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayTags.map((tag, index) => 
        clickable && !insidePromptCard ? (
          <Link
            key={`${tag}-${index}`}
            href={`/explore?tag=${encodeURIComponent(tag)}`}
            onClick={(e) => clickable && e.stopPropagation()} // Prevent triggering parent link
            className="bg-border/30 text-text-muted rounded-full px-3 py-1 text-xs flex items-center gap-1 hover:bg-border hover:text-text transition-colors"
          >
            {showIcon && (
              <svg xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" fill="currentColor" viewBox="0 0 256 256" className="opacity-70">
                <path d="M245.66,77.66l-67.32-67.32a8,8,0,0,0-11.31,0L97.7,79.67,82.75,65.66a8,8,0,0,0-11.07-.27L37.33,96.73a8,8,0,0,0,0,11.31l63.3,63.3a8,8,0,0,0,11.31,0L143.6,139.7l68,68a8,8,0,0,0,11.31,0l22.75-22.75a8,8,0,0,0,0-11.31ZM96.29,154.3,48,106l23.49-21.31,15,14a8,8,0,0,0,11.31,0L167,29.37,212.63,75Z"></path>
              </svg>
            )}
            {tag}
          </Link>
        ) : clickable && insidePromptCard ? (
          <div
            key={`${tag}-${index}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/explore?tag=${encodeURIComponent(tag)}`;
            }}
            className="bg-border/30 text-text-muted rounded-full px-3 py-1 text-xs flex items-center gap-1 hover:bg-border hover:text-text transition-colors cursor-pointer"
          >
            {showIcon && (
              <svg xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" fill="currentColor" viewBox="0 0 256 256" className="opacity-70">
                <path d="M245.66,77.66l-67.32-67.32a8,8,0,0,0-11.31,0L97.7,79.67,82.75,65.66a8,8,0,0,0-11.07-.27L37.33,96.73a8,8,0,0,0,0,11.31l63.3,63.3a8,8,0,0,0,11.31,0L143.6,139.7l68,68a8,8,0,0,0,11.31,0l22.75-22.75a8,8,0,0,0,0-11.31ZM96.29,154.3,48,106l23.49-21.31,15,14a8,8,0,0,0,11.31,0L167,29.37,212.63,75Z"></path>
              </svg>
            )}
            {tag}
          </div>
        ) : (
          <div
            key={`${tag}-${index}`}
            className="bg-border/30 text-text-muted rounded-full px-3 py-1 text-xs flex items-center gap-1"
          >
            {showIcon && (
              <svg xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" fill="currentColor" viewBox="0 0 256 256" className="opacity-70">
                <path d="M245.66,77.66l-67.32-67.32a8,8,0,0,0-11.31,0L97.7,79.67,82.75,65.66a8,8,0,0,0-11.07-.27L37.33,96.73a8,8,0,0,0,0,11.31l63.3,63.3a8,8,0,0,0,11.31,0L143.6,139.7l68,68a8,8,0,0,0,11.31,0l22.75-22.75a8,8,0,0,0,0-11.31ZM96.29,154.3,48,106l23.49-21.31,15,14a8,8,0,0,0,11.31,0L167,29.37,212.63,75Z"></path>
              </svg>
            )}
            {tag}
          </div>
        )
      )}
      
      {hasMore && !showAll && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowAll(true);
          }}
          className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs hover:bg-primary/20 transition-colors"
        >
          +{tags.length - maxDisplay} more
        </button>
      )}
      
      {showAll && hasMore && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowAll(false);
          }}
          className="text-text-muted text-xs underline hover:text-text transition-colors"
        >
          Show less
        </button>
      )}
    </div>
  );
};

export default TagDisplay;
