import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  promptCount: number;
  image?: string;
}

interface CategoryCardsProps {
  categories: Category[];
  title?: string;
  loading?: boolean;
  selectedCategoryId?: string | null;
  onCategoryClick?: (categoryId: string | null) => void;
  showAllOption?: boolean;
}

const CategoryCards: React.FC<CategoryCardsProps> = ({
  categories,
  title = "Browse by Category",
  loading = false,
  selectedCategoryId = null,
  onCategoryClick,
  showAllOption = false
}) => {
  // If loading, show skeletons
  if (loading) {
    return (
      <div className="my-6">
        <h2 className="text-text text-xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center animate-pulse">
              <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20 mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If no categories, don't render anything
  if (!categories || categories.length === 0) {
    return null;
  }

  const renderCategoryItem = (category: Category | null) => {
    const isSelected = category ? selectedCategoryId === category.id : selectedCategoryId === null;
    const categoryName = category ? category.name : 'All';
    const categoryImage = category ? category.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&background=random&color=fff&size=300&bold=true` : null;
    const promptCount = category ? category.promptCount : null;
    
    const handleClick = () => {
      if (onCategoryClick) {
        onCategoryClick(category ? category.id : null);
      }
    };
    
    const CategoryElement = () => (
      <div 
        className={`group flex flex-col items-center cursor-pointer ${isSelected ? 'scale-[0.98]' : ''}`}
        onClick={handleClick}
      >
        <div className={`relative w-full aspect-square rounded-xl overflow-hidden mb-2 transition-all border ${
          isSelected 
            ? 'ring-2 ring-[#bada55] border-[#bada55]' 
            : 'border-border hover:border-[#bada55]'
        }`}>
          {category ? (
            <Image
              src={categoryImage!}
              alt={categoryName}
              fill
              className="object-cover transition-transform"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-medium text-lg">All</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-sm font-medium">View prompts</p>
          </div>
        </div>
        <h3 className={`font-medium text-sm transition-colors ${
          isSelected ? 'text-[#bada55]' : 'text-text group-hover:text-[#bada55]'
        }`}>
          {categoryName}
        </h3>
        {promptCount !== null && (
          <p className="text-xs text-text-muted">{promptCount} prompts</p>
        )}
      </div>
    );
    
    // If we have onCategoryClick, use the interactive version
    // Otherwise, use the Link version for default behavior
    return onCategoryClick ? (
      <CategoryElement key={category ? category.id : 'all'} />
    ) : (
      <Link 
        key={category ? category.id : 'all'} 
        href={`/explore?category=${category ? category.id : ''}`}
        className="group flex flex-col items-center"
      >
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 transition-all border border-border hover:border-[#bada55]">
          {category ? (
            <Image
              src={categoryImage!}
              alt={categoryName}
              fill
              className="object-cover transition-transform"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-medium text-lg">All</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-sm font-medium">View prompts</p>
          </div>
        </div>
        <h3 className="font-medium text-sm text-text group-hover:text-[#bada55] transition-colors">{categoryName}</h3>
        {promptCount !== null && (
          <p className="text-xs text-text-muted">{promptCount} prompts</p>
        )}
      </Link>
    );
  };

  const [expanded, setExpanded] = useState(false);
  
  // Calculate the number of items per row based on grid columns
  const itemsPerRow = {
    'xs': 2, // grid-cols-2
    'sm': 3, // sm:grid-cols-3
    'md': 4, // md:grid-cols-4
    'lg': 6  // lg:grid-cols-6
  };
  
  // Get the appropriate number of items for the first row based on screen size
  // We'll use the lg size as default since we're using mobile-first approach
  // Default to 6 items (lg screens) for the first row
  const firstRowCount = itemsPerRow.lg;
  
  // If "All" option is shown, it takes one slot in the first row
  const offset = showAllOption ? 1 : 0;
  
  // Calculate how many categories would fit in the first row
  const firstRowItemCount = firstRowCount - offset;
  
  // Determine if we have more categories than fit in the first row
  const hasMoreCategories = categories.length > firstRowItemCount;
  
  // Get visible items based on expanded state
  const visibleCategories = expanded ? categories : categories.slice(0, firstRowItemCount);

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-text text-xl font-bold">{title}</h2>
        {hasMoreCategories && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center p-1 rounded-full hover:bg-secondary transition-colors"
          >
            <span className="sr-only">{expanded ? 'Show less' : 'Show more'}</span>
            {expanded ? (
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="text-[#bada55] text-lg font-bold leading-none mb-0.5">−</span>
              </div>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="text-[#bada55] text-lg font-bold leading-none">+</span>
              </div>
            )}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Show "All" option if requested */}
        {showAllOption && renderCategoryItem(null)}
        
        {/* Show visible category items */}
        {visibleCategories.map((category) => renderCategoryItem(category))}
      </div>
    </div>
  );
};

export default CategoryCards;
