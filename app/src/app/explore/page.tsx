'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import PromptCard from '@/components/common/PromptCard';
import CategoryCards from '@/components/common/CategoryCards';

interface Prompt {
  id: string;
  title: string;
  description: string;
  image?: string;
  promptText: string;
  exampleOutputs?: string;
  suggestedModel: string;
  createdAt: string;
  // Old categories field kept for backward compatibility
  categories?: string[];
  // New category fields
  categoryId?: string;
  categoryName?: string;
  categoryImage?: string;
  // New tags field
  tags?: string[];
  userId: string;
  userName?: string;
  userImage?: string;
  averageRating: number;
  rating?: number;
  numRatings?: number;
  _count: {
    ratings: number;
  };
  isSaved: boolean;
  user?: {
    id: string;
    name: string;
    image?: string;
  };
}

type FilterMode = 'followed' | 'all' | 'trending';

export default function ExplorePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [filterMode, setFilterMode] = useState<FilterMode>('followed');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [followsUsers, setFollowsUsers] = useState(true);
  const categoryParam = searchParams.get('category');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(categoryParam);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Helper function to generate consistent background colors based on text
  const generateBackgroundColor = (text: string): string => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash).toString(16).substring(0, 6).padEnd(6, '0');
  };
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
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
        setCategoriesLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch prompts based on filter mode
  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      setError('');
      
      try {
        let url = '';
        let categoryParam = '';
        
        // Handle category filter safely - if we get an error with category filtering
        // we want to be able to retry without it
        if (categoryFilter) {
          try {
            categoryParam = filterMode === 'followed' 
              ? `&category=${categoryFilter}` 
              : `&categoryId=${categoryFilter}`;
          } catch (e) {
            console.error('Error constructing category parameter:', e);
            // Continue without category filter
          }
        }
        
        switch (filterMode) {
          case 'followed':
            url = `/api/prompts/feed?page=${page}${categoryParam}`;
            break;
          case 'trending':
            url = `/api/prompts?page=${page}&sort=trending${categoryParam}`;
            break;
          case 'all':
          default:
            url = `/api/prompts?page=${page}&sort=recent${categoryParam}`;
            break;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
          console.error('API error:', data.error || response.statusText);
          setError('Failed to load prompts. Please try again.');
          setPrompts([]);
          return;
        }
        
          // Validate that data.prompts is an array before setting state
        if (data && Array.isArray(data.prompts)) {
          // Debug the first prompt to check if rating data exists
          if (data.prompts.length > 0) {
            console.log('First prompt rating data:', {
              averageRating: data.prompts[0].averageRating,
              rating: data.prompts[0].rating,
              _count: data.prompts[0]._count
            });
          }
          
          // Ensure each prompt has a rating property (either from rating or averageRating)
          const processedPrompts = data.prompts.map((prompt: any) => {
            if (prompt.rating === undefined && prompt.averageRating !== undefined) {
              return { ...prompt, rating: prompt.averageRating };
            }
            return prompt;
          });
          
          setPrompts(processedPrompts);
        } else {
          console.error('Invalid prompts data structure:', data);
          setPrompts([]);
        }        // Safely access pagination data with fallbacks
        if (data.pagination && typeof data.pagination.totalPages === 'number') {
          setTotalPages(data.pagination.totalPages);
        } else {
          setTotalPages(1); // Default to 1 page if pagination data is missing
        }
        
        // If we're in followed mode, check if user follows anyone
        if (filterMode === 'followed') {
          setFollowsUsers(data.followsUsers !== undefined ? data.followsUsers : true);
          
          // If there's a message, show it as a notification
          if (data.message) {
            setError(data.message);
          }
        }
        
      } catch (error) {
        console.error('Error fetching prompts:', error);
        setError('Failed to load prompts. Please try again.');
        setPrompts([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (status !== 'loading') {
      fetchPrompts();
    }
  }, [filterMode, page, categoryFilter, status]);

  // Update search input and category when URL parameters change
  useEffect(() => {
    setSearchQuery(query);
    setCategoryFilter(categoryParam);
  }, [query, categoryParam]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update the URL with the new search query
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/explore');
    }
  };

  // Handle filter mode change
  const handleFilterChange = (mode: FilterMode) => {
    setFilterMode(mode);
    setPage(1);
  };

  // Handle category filter change
  const handleCategoryFilter = (categoryId: string | null) => {
    setCategoryFilter(categoryId);
    setPage(1);
    
    // Update the URL with the new category
    const currentUrl = new URL(window.location.href);
    if (categoryId) {
      currentUrl.searchParams.set('category', categoryId);
    } else {
      currentUrl.searchParams.delete('category');
    }
    
    // Use router.push to update the URL without full page reload
    router.push(currentUrl.pathname + currentUrl.search);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="px-4 py-3">
          <form onSubmit={handleSearch}>
            <div className="flex w-full flex-1 items-stretch rounded-xl h-12">
              <div className="text-text-muted flex border border-border bg-background items-center justify-center pl-4 rounded-l-xl border-r-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                </svg>
              </div>
              <input 
                placeholder="Search for prompts" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text focus:outline-0 focus:ring-0 border border-border bg-background focus:border-primary h-full placeholder:text-text-muted px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              />
              <div className="flex items-center justify-center rounded-r-xl border-l-0 border border-border bg-background pr-[7px]">
                <button
                  type="submit"
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-primary text-background text-sm font-bold leading-normal tracking-[0.015em]">
                  <span className="truncate">Search</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Category Filter */}
        <div className="px-4">
          <CategoryCards 
            categories={categories}
            title="Filter by Category"
            loading={categoriesLoading}
            selectedCategoryId={categoryFilter}
            onCategoryClick={handleCategoryFilter}
            showAllOption={true}
          />
        </div>
        
        {/* Sort options based on current filter mode */}
        {filterMode === 'all' && (
          <div className="px-4 mt-3">
            <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-background border border-border pl-4 pr-2">
              <p className="text-text text-sm font-medium leading-normal">Sort by: Recent</p>
              <div className="text-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                </svg>
              </div>
            </button>
          </div>
        )}
        
        {/* Filter tabs */}
        <div className="border-b border-border px-4 flex">
          <button 
            onClick={() => handleFilterChange('followed')} 
            className={`py-2 px-4 font-medium text-sm ${filterMode === 'followed' ? 'text-primary border-b-2 border-primary' : 'text-text-muted'}`}
          >
            Following
          </button>
          <button 
            onClick={() => handleFilterChange('all')} 
            className={`py-2 px-4 font-medium text-sm ${filterMode === 'all' ? 'text-primary border-b-2 border-primary' : 'text-text-muted'}`}
          >
            All
          </button>
          <button 
            onClick={() => handleFilterChange('trending')} 
            className={`py-2 px-4 font-medium text-sm ${filterMode === 'trending' ? 'text-primary border-b-2 border-primary' : 'text-text-muted'}`}
          >
            Trending
          </button>
        </div>
        
        <h2 className="text-text text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          {filterMode === 'followed' ? 'Followed Users' : filterMode === 'trending' ? 'Trending Prompts' : 'All Prompts'}
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            {error.includes("Showing recent prompts") ? (
              // This is an informational message, not an error
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-4 rounded-lg mb-4">
                <p className="text-lg">{error}</p>
              </div>
            ) : (
              // This is a real error
              <>
                <p className="text-red-500 text-lg">{error}</p>
                <button 
                  onClick={() => handleFilterChange(filterMode)} 
                  className="mt-4 px-4 py-2 bg-primary text-background rounded-md"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        ) : filterMode === 'followed' && !followsUsers ? (
          <div className="p-8 text-center bg-background rounded-lg border border-border m-4">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256" className="text-text-muted mx-auto">
                <path d="M256,136a8,8,0,0,1-8,8H232v16a40,40,0,0,1-40,40H168a8,8,0,0,1,0-16h24a24,24,0,0,0,24-24V144H200a8,8,0,0,1,0-16h48A8,8,0,0,1,256,136ZM56,72a32,32,0,1,0,32,32A32,32,0,0,0,56,72Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,56,120Zm72,48a32,32,0,1,0-32-32A32,32,0,0,0,128,168Zm0-48a16,16,0,1,1-16,16A16,16,0,0,1,128,120ZM168,88a32,32,0,1,0-32-32A32,32,0,0,0,168,88Zm0-48a16,16,0,1,1-16,16A16,16,0,0,1,168,40ZM24,152H56v-8a32,32,0,0,0-32-32,8,8,0,0,0,0,16,16,16,0,0,1,16,16v8H8a8,8,0,0,0,0,16H24v16a16,16,0,0,1-16,16,8,8,0,0,0,0,16,32,32,0,0,0,32-32V168H56a8,8,0,0,0,0-16Z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Your feed is empty!</h3>
            <p className="text-text-muted mb-6">Follow some promptsters to see their latest prompts here.</p>
            <Link 
              href="/users" 
              className="px-6 py-2.5 bg-primary text-background rounded-full font-medium"
            >
              Find People to Follow
            </Link>
          </div>
        ) : prompts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                id={prompt.id}
                title={prompt.title}
                description={prompt.description}
                image={prompt.image}
                tags={prompt.tags}
                categoryId={prompt.categoryId}
                categoryName={prompt.categoryName}
                categoryImage={prompt.categoryImage}
                userName={(prompt.userName || prompt.user?.name) || "Unknown"}
                userImage={prompt.userImage || prompt.user?.image}
                userId={prompt.userId || prompt.user?.id || ""}
                createdAt={prompt.createdAt}
                rating={prompt.rating !== undefined ? prompt.rating : (prompt.averageRating || 0)}
                numRatings={prompt._count?.ratings || prompt.numRatings || 0}
                suggestedModel={prompt.suggestedModel}
                isSaved={prompt.isSaved}
                onSaveToggle={(id, isSaved) => {
                  // Update the state to reflect the new saved status
                  setPrompts(
                    prompts.map(p => 
                      p.id === id ? { ...p, isSaved } : p
                    )
                  );
                }}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-text-muted text-lg">No prompts found.</p>
            {filterMode === 'followed' ? (
              <p className="text-text-muted text-sm mt-2">Try following more users or check the All section.</p>
            ) : categoryFilter ? (
              <p className="text-text-muted text-sm mt-2">Try another category or check All Prompts.</p>
            ) : (
              <p className="text-text-muted text-sm mt-2">Be the first to create a prompt!</p>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && prompts.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center p-4">
            <button 
              onClick={() => page > 1 && handlePageChange(page - 1)}
              disabled={page <= 1}
              className={`flex h-10 w-10 items-center justify-center ${page <= 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
                </svg>
              </div>
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // If totalPages <= 5, show all pages
              // If currentPage is at the beginning, show pages 1-5
              // If currentPage is at the end, show the last 5 pages
              // Otherwise, show 2 pages before and after the current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button 
                  key={pageNum} 
                  onClick={() => handlePageChange(pageNum)}
                  className={`text-sm ${page === pageNum ? 'font-bold bg-background border border-border' : 'font-normal'} leading-normal flex h-10 w-10 items-center justify-center text-text rounded-full`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              onClick={() => page < totalPages && handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className={`flex h-10 w-10 items-center justify-center ${page >= totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                </svg>
              </div>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
