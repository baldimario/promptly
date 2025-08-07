import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  promptCount: number;
  image?: string;
}

interface CategoryFilterProps {
  onSelectCategory: (categoryId: string | null) => void;
  selectedCategoryId?: string | null;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  onSelectCategory, 
  selectedCategoryId = null 
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        if (data && data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          console.error('Invalid categories data structure:', data);
          setCategories([]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-4">Filter by Category</h3>
      
      {loading ? (
        <div className="flex overflow-x-auto py-2 space-x-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center animate-pulse">
              <div className="w-28 h-28 bg-gray-200 dark:bg-gray-800 rounded-xl shadow-md mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20 mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto py-2 space-x-3 scrollbar-hide">
          {/* All Categories option */}
          <div
            className="group flex flex-col items-center flex-shrink-0 cursor-pointer"
            onClick={() => onSelectCategory(null)}
          >
            <div className={`relative w-28 h-28 rounded-xl overflow-hidden transition-all duration-300 border border-border shadow-md ${
              selectedCategoryId === null
                ? 'ring-2 ring-[#bada55] scale-95'
                : 'group-hover:ring-2 group-hover:ring-[#bada55] group-hover:border-[#bada55]'
            }`}>
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">All</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="mt-1 text-center">
              <h3 className="font-medium text-sm text-text group-hover:text-[#bada55] transition-colors">All Categories</h3>
            </div>
          </div>

          {categories && categories.length > 0 ? categories.map((category) => (
            <div
              key={category.id}
              className="group flex flex-col items-center flex-shrink-0 cursor-pointer"
              onClick={() => onSelectCategory(category.id)}
            >
              <div className={`relative w-28 h-28 rounded-xl overflow-hidden transition-all duration-300 border border-border shadow-md ${
                selectedCategoryId === category.id
                  ? 'ring-2 ring-[#bada55] scale-95'
                  : 'group-hover:ring-2 group-hover:ring-[#bada55] group-hover:border-[#bada55]'
              }`}>
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                    unoptimized={category.image.includes('ui-avatars.com') || category.image.endsWith('.svg')}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">{category.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-sm font-medium">View prompts</p>
                </div>
              </div>
              <div className="mt-1 text-center">
                <h3 className="font-medium text-sm text-text group-hover:text-[#bada55] transition-colors">{category.name}</h3>
                <p className="text-xs text-text-muted">{category.promptCount || 0} prompts</p>
              </div>
            </div>
          )) : null}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
