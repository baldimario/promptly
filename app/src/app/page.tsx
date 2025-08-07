'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPromptImageUrl } from '@/utils/placeholderImage';
import CategoryCards from '@/components/common/CategoryCards';
import PromptCard from '@/components/common/PromptCard';
import FixedImagePlaceholder from '@/components/common/FixedImagePlaceholder';

interface TrendingPrompt {
  id: string;
  title: string;
  description: string;
  image?: string;
  userName: string;
  userImage?: string;
  userId?: string;
  categories: string[];
  categoryId?: string;
  categoryName?: string;
  categoryImage?: string;
  createdAt: string;
  rating: number;
  numRatings: number;
  suggestedModel: string;
  tags?: string[];
  isSaved?: boolean;
}

interface CategoryItem {
  id: string;
  name: string;
  promptCount: number;
  image?: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingPrompts, setTrendingPrompts] = useState<TrendingPrompt[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState({
    trending: true,
    categories: true
  });
  const router = useRouter();
  
  // Helper function to generate consistent background colors based on text
  const generateBackgroundColor = (text: string): string => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash).toString(16).substring(0, 6).padEnd(6, '0');
  };

  // Fetch trending prompts
  useEffect(() => {
    const fetchTrendingPrompts = async () => {
      try {
        const response = await fetch('/api/prompts?sort=trending&page=1&pageSize=4');
        if (response.ok) {
          const data = await response.json();
          if (data && data.prompts && Array.isArray(data.prompts)) {
            setTrendingPrompts(data.prompts.map((prompt: any) => {
              // Process image URL - ensure imageUrls takes precedence if available
              let imageUrl = null;
              if (prompt.imageUrls && Array.isArray(prompt.imageUrls) && prompt.imageUrls.length > 0) {
                imageUrl = prompt.imageUrls[0];
              } else if (prompt.image) {
                imageUrl = prompt.image;
              }
              
              return {
                id: prompt.id,
                title: prompt.title,
                description: prompt.description || '',
                image: imageUrl,
                userName: prompt.userName || 'Unknown',
                userImage: prompt.userImage,
                userId: prompt.userId,
                categories: prompt.tags || [],
                categoryId: prompt.categoryId,
                categoryName: prompt.categoryName,
                categoryImage: prompt.categoryImage,
                createdAt: prompt.createdAt || new Date().toISOString(),
                rating: prompt.rating || prompt.averageRating || 0,
                numRatings: prompt._count?.ratings || prompt.numRatings || 0,
                suggestedModel: prompt.suggestedModel || 'gpt-4',
                isSaved: prompt.isSaved || false
              };
            }));
          } else {
            // Handle empty or invalid response
            console.error('Invalid prompts data structure:', data);
            setTrendingPrompts([]);
          }
        } else {
          console.error('Error fetching trending prompts, status:', response.status);
          setTrendingPrompts([]);
        }
      } catch (error) {
        console.error('Error fetching trending prompts:', error);
        setTrendingPrompts([]);
      } finally {
        setLoading(prev => ({ ...prev, trending: false }));
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          
          // Create category items with images
          const categoryItems = data.categories.map((category: any) => {
            // For each category, generate a color based on the name
            const generateColor = () => {
              let hash = 0;
              for (let i = 0; i < category.name.length; i++) {
                hash = category.name.charCodeAt(i) + ((hash << 5) - hash);
              }
              const color = Math.abs(hash).toString(16).substring(0, 6).padEnd(6, '0');
              return color;
            };
            
            // Generate a placeholder image for categories without one
            const imageUrl = category.image || 
              `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&background=${generateColor()}&color=fff&size=300&bold=true`;
            
            return {
              id: category.id,
              name: category.name,
              promptCount: category.promptCount,
              image: imageUrl
            };
          });
          
          setCategories(categoryItems);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    };

    fetchTrendingPrompts();
    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="@container">
        <div className="@[480px]:p-4">
          <div
            className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4"
            style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBnjcIMlFEfPwnKM3HikE-0FdgEZh_KxKuwWrNLzERPijEfeHhJhgrMKc1inE6zzQiHjr-33oMw_nrATpbIv4yPOsRVaQfC2BhOJfv6RHZ3Tmbzq2Of9iW-uqvAWFDYRwEEIOqTngZNq8DCbLjCakBbjESAUPBkc51SCdydQDhKWIcNR39CDOIyvx7htlf8PNwDLts-QLLh0LpiexSk_daHfZ3M9NvgVJcylZW0AWmWGMah0BznW0NL1jPbjuOSWouT7A5dSM0xE74')" }}>
            <div className="flex flex-col gap-2 text-center">
              <h1
                className="text-text text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                Unlock the Power of AI with the Perfect Prompt
              </h1>
              <h2
                className="text-text text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                Explore a vast library of AI prompts to enhance your creativity and productivity. Find the perfect
                prompt for any task, from writing to art generation.
              </h2>
            </div>
            <form onSubmit={handleSearch} className="flex flex-col min-w-40 h-14 w-full max-w-[480px] @[480px]:h-16">
              <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                <div
                  className="text-text-muted flex border border-border bg-background items-center justify-center pl-[15px] rounded-l-xl border-r-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor"
                    viewBox="0 0 256 256">
                    <path
                      d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z">
                    </path>
                  </svg>
                </div>
                <input 
                  placeholder="Search for prompts"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text focus:outline-0 focus:ring-0 border border-border bg-background focus:border-border h-full placeholder:text-text-muted px-[15px] rounded-r-none border-r-0 pr-2 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal"
                />
                <div
                  className="flex items-center justify-center rounded-r-xl border-l-0 border border-border bg-background pr-[7px]">
                  <button
                    type="submit"
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-primary text-background text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]">
                    <span className="truncate">Search</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Trending Prompts Section */}
      <div className="px-4 py-5">
        <h2 className="text-text text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">
          Trending Prompts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading.trending ? (
            // Loading skeleton for trending prompts
            Array(4).fill(0).map((_, index) => (
              <div key={`skeleton-${index}`} className="border border-border rounded-lg animate-pulse">
                <div className="aspect-[2/1] bg-border/30"></div>
                <div className="p-4">
                  <div className="h-6 bg-border/30 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-border/30 rounded w-full mb-3"></div>
                  <div className="h-4 bg-border/30 rounded w-2/3 mb-3"></div>
                  <div className="h-8 bg-border/30 rounded w-full mt-6"></div>
                </div>
              </div>
            ))
          ) : trendingPrompts.length > 0 ? (
            trendingPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                id={prompt.id}
                title={prompt.title}
                description={prompt.description}
                image={prompt.image}
                tags={prompt.categories || prompt.tags}
                categoryId={prompt.categoryId}
                categoryName={prompt.categoryName}
                categoryImage={prompt.categoryImage}
                userName={prompt.userName || 'Unknown'}
                userImage={prompt.userImage}
                userId={prompt.userId}
                createdAt={prompt.createdAt}
                rating={prompt.rating}
                numRatings={prompt.numRatings}
                suggestedModel={prompt.suggestedModel}
                isSaved={prompt.isSaved}
                onSaveToggle={(id, isSaved) => {
                  // Update the state to reflect the new saved status
                  const updatedPrompts = trendingPrompts.map(p => 
                    p.id === id ? { ...p, isSaved } : p
                  );
                  setTrendingPrompts(updatedPrompts);
                }}
              />
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center p-8 border border-border rounded-lg bg-background">
              <p className="text-text-muted">No trending prompts available</p>
            </div>
          )}
        </div>
        {trendingPrompts.length > 0 && (
          <div className="mt-4 text-center">
            <Link href="/explore?sort=trending" className="inline-flex items-center px-6 py-2.5 bg-primary text-background rounded-full font-medium">
              View More
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="ml-1" viewBox="0 0 256 256">
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="px-4">
        <CategoryCards 
          categories={categories}
          title="Explore by Category"
          loading={loading.categories}
        />
      </div>
    </>
  );
}
