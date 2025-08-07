import React, { useState } from 'react';
import Link from 'next/link';

interface CategoryTagsProps {
  categories: string[];
  clickable?: boolean;
  className?: string;
  maxDisplay?: number;
  showIcon?: boolean;
}

const CategoryTags: React.FC<CategoryTagsProps> = ({ 
  categories, 
  clickable = false,
  className = '',
  maxDisplay = 3,
  showIcon = true
}) => {
  const [showAll, setShowAll] = useState(false);
  
  if (!categories || categories.length === 0) {
    return null;
  }

  const displayCategories = showAll ? categories : categories.slice(0, maxDisplay);
  const hasMore = categories.length > maxDisplay;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayCategories.map((category, index) => 
        clickable ? (
          <Link
            key={`${category}-${index}`}
            href={`/explore?category=${encodeURIComponent(category)}`}
            onClick={(e) => clickable && e.stopPropagation()} // Prevent triggering parent link
            className="bg-border/30 text-text-muted rounded-full px-3 py-1 text-xs flex items-center gap-1 hover:bg-border hover:text-text transition-colors"
          >
            {showIcon && (
              <svg xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" fill="currentColor" viewBox="0 0 256 256" className="opacity-70">
                <path d="M243.31,136,144,36.69A15.86,15.86,0,0,0,132.69,32H40A8,8,0,0,0,32,40v92.69A15.86,15.86,0,0,0,36.69,144L136,243.31a16,16,0,0,0,22.63,0l84.68-84.68a16,16,0,0,0,0-22.63Zm-96,96L48,132.69V48h84.69L232,147.31ZM96,84A12,12,0,1,1,84,72,12,12,0,0,1,96,84Z"></path>
              </svg>
            )}
            {category}
          </Link>
        ) : (
          <div
            key={`${category}-${index}`}
            className="bg-border/30 text-text-muted rounded-full px-3 py-1 text-xs flex items-center gap-1"
          >
            {showIcon && (
              <svg xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" fill="currentColor" viewBox="0 0 256 256" className="opacity-70">
                <path d="M243.31,136,144,36.69A15.86,15.86,0,0,0,132.69,32H40A8,8,0,0,0,32,40v92.69A15.86,15.86,0,0,0,36.69,144L136,243.31a16,16,0,0,0,22.63,0l84.68-84.68a16,16,0,0,0,0-22.63Zm-96,96L48,132.69V48h84.69L232,147.31ZM96,84A12,12,0,1,1,84,72,12,12,0,0,1,96,84Z"></path>
              </svg>
            )}
            {category}
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
          +{categories.length - maxDisplay} more
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

export default CategoryTags;
