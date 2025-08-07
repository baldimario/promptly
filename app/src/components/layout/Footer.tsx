'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
  promptCount?: number;
}

const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        if (data.categories && Array.isArray(data.categories)) {
          // Sort by prompt count if available, otherwise alphabetically
          const sortedCategories = data.categories.sort((a: Category, b: Category) => 
            (b.promptCount || 0) - (a.promptCount || 0)
          );
          
          // Take only the top 10 categories
          setCategories(sortedCategories.slice(0, 10));
        }
      } catch (error) {
        console.error('Failed to fetch categories for footer:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Format category name for URL (e.g., "creative writing" -> "creative-writing")
  const formatCategoryForUrl = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <footer className="border-t border-border border-[#bada55] py-8 px-10">
      <div className="max-w-[960px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-4 text-text mb-4">
              <Image src="/logo.png" alt="Promptly Logo" width={128} height={128} />
              {/* <h2 className="text-text text-lg font-bold leading-tight tracking-[-0.015em]">Promptly</h2> */}
            </div>
            <p className="text-text-muted text-sm">Share, discover, and rate AI prompts to enhance your creative workflow.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-text mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-text-muted text-sm hover:text-text">Home</Link></li>
              <li><Link href="/explore" className="text-text-muted text-sm hover:text-text">Explore</Link></li>
              <li><Link href="/create" className="text-text-muted text-sm hover:text-text">Create</Link></li>
              <li><Link href="/privacy" className="text-text-muted text-sm hover:text-text">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-text-muted text-sm hover:text-text">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-text mb-4">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {isLoading ? (
                <p className="text-text-muted text-xs">Loading categories...</p>
              ) : categories.length > 0 ? (
                categories.map(category => (
                  <Link 
                    key={category.id} 
                    href={`/explore?category=${category.id}`}
                    className="text-text-muted text-xs bg-secondary px-3 py-1 rounded-full hover:bg-secondary-alt"
                  >
                    {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                  </Link>
                ))
              ) : (
                <p className="text-text-muted text-xs">No categories found</p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border border-[#bada55] text-text-muted text-sm text-center">
          &copy; {new Date().getFullYear()} Promptly. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
