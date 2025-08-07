import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface CategoryBadgeProps {
  categoryId?: string | null;
  categoryName?: string;
  categoryImage?: string;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  // Add a special flag to prevent using links in PromptCard context
  insidePromptCard?: boolean;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  categoryId,
  categoryName,
  categoryImage,
  size = 'md',
  clickable = true,
  insidePromptCard = false
}) => {
  // If no category, return nothing
  if (!categoryId && !categoryName) {
    return null;
  }
  
  // Generate sizes based on the size prop
  const sizeClasses = {
    sm: {
      container: 'h-6 text-xs',
      image: 'w-4 h-4'
    },
    md: {
      container: 'h-8 text-sm',
      image: 'w-5 h-5'
    },
    lg: {
      container: 'h-10 text-base',
      image: 'w-6 h-6'
    }
  };
  
  const badge = (
    <div className={`inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 ${sizeClasses[size].container}`}>
      {categoryImage && (
        <div className={`relative rounded-full overflow-hidden ${sizeClasses[size].image}`}>
          <Image
            src={categoryImage}
            alt={categoryName || 'Category'}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <span className="text-primary font-medium">{categoryName}</span>
    </div>
  );
  
  // If inside a PromptCard, always return the badge without a link
  if (insidePromptCard) {
    return (
      <div 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (clickable && categoryId) {
            window.location.href = `/explore?category=${categoryId}`;
          }
        }}
        className={clickable && categoryId ? "cursor-pointer" : ""}
      >
        {badge}
      </div>
    );
  }
  
  // If clickable and we have a categoryId, wrap in a Link
  if (clickable && categoryId) {
    return (
      <Link 
        href={`/explore?category=${categoryId}`}
        onClick={(e) => e.stopPropagation()} // Prevent triggering parent link
      >
        {badge}
      </Link>
    );
  }
  
  return badge;
};

export default CategoryBadge;
