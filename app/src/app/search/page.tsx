'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import PromptCard from '@/components/common/PromptCard';

// Types for the prompt data
interface Prompt {
  id: string;
  title: string;
  description: string;
  promptText: string;
  exampleOutputs?: string;
  suggestedModel: string;
  image?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  // Old categories field kept for backward compatibility
  categories?: string[];
  // New category fields
  categoryId?: string;
  categoryName?: string;
  categoryImage?: string;
  // New tags field
  tags?: string[];
  _count: {
    ratings: number;
  };
  averageRating: number;
  isSaved?: boolean;
}

// Sort options
type SortOption = 'newest' | 'rating' | 'popular';

// Force dynamic rendering due to useSearchParams to avoid static prerender errors
export const dynamic = 'force-dynamic';

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const query = searchParams.get('q') || '';
  const sortParam = searchParams.get('sort') as SortOption || 'newest';
  const minRatingParam = searchParams.get('minRating') || '';
  
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>(sortParam);
  const [minRating, setMinRating] = useState(minRatingParam ? parseInt(minRatingParam) : 0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [popularCategories, setPopularCategories] = useState<{id: string, name: string, promptCount: number}[]>([]);
  const [savingPrompt, setSavingPrompt] = useState<string | null>(null);
  const [ratingPrompt, setRatingPrompt] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });

  // Fetch popular categories
  useEffect(() => {
    const fetchPopularCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setPopularCategories(data.categories);
      } catch (error) {
        console.error('Error fetching popular categories:', error);
      }
    };
    
    fetchPopularCategories();
  }, []);

  // Fetch search results
  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        // Build query URL with all parameters
        const params = new URLSearchParams();
        params.set('q', query);
        params.set('page', pagination.page.toString());
        params.set('pageSize', pagination.pageSize.toString());
        params.set('sortBy', sort === 'newest' ? 'newest' : sort === 'rating' ? 'rating' : 'popular');
        
        if (minRating > 0) {
          params.set('minRating', minRating.toString());
        }
        
        if (selectedCategories.length === 1) {
          params.set('category', selectedCategories[0]);
        }
        
        const response = await fetch(`/api/prompts/search?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch search results');
        const data = await response.json();
        
        setPrompts(data.prompts);
        setPagination(data.pagination);
        
        // Extract unique category names from prompts using both new and legacy fields
        const allCategories: string[] = data.prompts.flatMap((prompt: Prompt) => {
          const names: string[] = [];
          if (prompt.categoryName) names.push(prompt.categoryName);
          if (Array.isArray(prompt.categories)) names.push(...prompt.categories.filter(Boolean));
          return names;
        });
        const uniqueCategories = Array.from(new Set(
          allCategories
            .map((c) => (typeof c === 'string' ? c.trim() : ''))
            .filter((c) => c.length > 0)
        ))
          .sort((a, b) => a.localeCompare(b));
        setAvailableCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setPrompts([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    } else {
      setPrompts([]);
      setLoading(false);
    }
  }, [query, pagination.page, sort, minRating, selectedCategories]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...prompts];
    
    // Filter by minimum rating
    if (minRating > 0) {
      result = result.filter(prompt => prompt.averageRating >= minRating);
    }
    
      // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter(prompt => {
        // Check if the prompt matches any of the selected categories
        // First check if the old categories array contains the category
        if (prompt.categories && prompt.categories.some(category => selectedCategories.includes(category))) {
          return true;
        }
        
        // Then check if the categoryName matches any selected category
        if (prompt.categoryName && selectedCategories.includes(prompt.categoryName)) {
          return true;
        }
        
        // Finally check if the prompt has tags that match any selected category
        return prompt.tags && prompt.tags.some(tag => selectedCategories.includes(tag));
      });
    }    // Apply sorting
    switch (sort) {
      case 'rating':
        result.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'popular':
        result.sort((a, b) => b._count.ratings - a._count.ratings);
        break;
      case 'newest':
      default:
        // Prompts are already sorted by date from the API
        break;
    }
    
    setFilteredPrompts(result);
  }, [prompts, sort, minRating, selectedCategories]);

  // Update URL with filters
  const updateFilters = (newSort?: SortOption, newMinRating?: number) => {
    const currentSort = newSort || sort;
    const currentMinRating = newMinRating !== undefined ? newMinRating : minRating;
    
    // Update states
    if (newSort) setSort(newSort);
    if (newMinRating !== undefined) setMinRating(newMinRating);
    
    // Build new URL
    const params = new URLSearchParams();
    params.set('q', query);
    if (currentSort !== 'newest') params.set('sort', currentSort);
    if (currentMinRating > 0) params.set('minRating', currentMinRating.toString());
    
    // Update URL without refreshing the page
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Save/unsave prompt function
  const savePrompt = async (promptId: string) => {
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      setSavingPrompt(promptId);
      
      // Find the prompt
      const promptToUpdate = prompts.find(p => p.id === promptId);
      if (!promptToUpdate) return;
      
      // Determine action based on current saved status
      const action = promptToUpdate.isSaved ? 'unsave' : 'save';
      
      // Optimistically update UI
      setPrompts(currentPrompts => 
        currentPrompts.map(p => 
          p.id === promptId ? {...p, isSaved: !p.isSaved} : p
        )
      );
      
      // Call API
      const response = await fetch('/api/prompts/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId,
          action
        }),
      });

      if (!response.ok) {
        // Revert changes if request failed
        setPrompts(currentPrompts => 
          currentPrompts.map(p => 
            p.id === promptId ? {...p, isSaved: promptToUpdate.isSaved} : p
          )
        );
        throw new Error('Failed to save prompt');
      }
      
      // No need to update anything else since we already updated optimistically
    } catch (error) {
      console.error('Error saving prompt:', error);
    } finally {
      setSavingPrompt(null);
    }
  };
  
  // Rate prompt function
  const ratePrompt = async (promptId: string, rating: number) => {
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      setRatingPrompt(promptId);
      
      // Call API
      const response = await fetch('/api/prompts/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId,
          rating
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to rate prompt');
      }
      
      const data = await response.json();
      
      // Update the prompt with new rating data
      setPrompts(currentPrompts => 
        currentPrompts.map(p => 
          p.id === promptId ? {
            ...p, 
            averageRating: data.averageRating,
            _count: {...p._count, ratings: data.totalRatings}
          } : p
        )
      );
    } catch (error) {
      console.error('Error rating prompt:', error);
    } finally {
      setRatingPrompt(null);
    }
  };

  // Helper function to render star ratings
  const renderStars = (prompt: Prompt) => {
    const rating = prompt.averageRating;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <button 
            key={i} 
            onClick={(e) => {
              e.preventDefault();
              ratePrompt(prompt.id, i + 1);
            }}
            disabled={ratingPrompt === prompt.id}
            className="w-5 h-5 cursor-pointer"
          >
            <svg className="w-5 h-5 fill-yellow-400" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <button 
            key={i} 
            onClick={(e) => {
              e.preventDefault();
              ratePrompt(prompt.id, i + 1);
            }}
            disabled={ratingPrompt === prompt.id}
            className="w-5 h-5 cursor-pointer"
          >
            <svg className="w-5 h-5 fill-yellow-400" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fillOpacity="0.5" />
            </svg>
          </button>
        );
      } else {
        stars.push(
          <button 
            key={i} 
            onClick={(e) => {
              e.preventDefault();
              ratePrompt(prompt.id, i + 1);
            }}
            disabled={ratingPrompt === prompt.id}
            className="w-5 h-5 cursor-pointer"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>
        );
      }
    }
    
    return stars;
  };

  // Rating filter buttons
  const renderRatingFilters = () => {
    return [0, 1, 2, 3, 4].map((rating) => (
      <button
        key={rating}
        className={`px-3 py-1 rounded-full text-sm ${minRating === rating ? 'bg-primary text-white' : 'bg-secondary'}`}
        onClick={() => updateFilters(undefined, rating)}
      >
        {rating > 0 ? `${rating}+ ★` : 'All Ratings'}
      </button>
    ));
  };

  return (
      <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Search Results for: &quot;{query}&quot;</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : prompts.length === 0 ? (
        <div className="bg-secondary rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">No results found</h2>
          <p className="mb-4">
            We couldn&apos;t find any prompts matching your search. Try using different keywords or browse our categories.
          </p>
          <Link 
            href="/explore" 
            className="inline-block px-6 py-3 bg-primary text-white rounded-full font-medium"
          >
            Browse Categories
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-secondary rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Filters</h2>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Sort By</h3>
                <div className="flex flex-col space-y-2">
                  <button 
                    className={`text-left px-3 py-2 rounded ${sort === 'newest' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                    onClick={() => updateFilters('newest')}
                  >
                    Newest First
                  </button>
                  <button 
                    className={`text-left px-3 py-2 rounded ${sort === 'rating' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                    onClick={() => updateFilters('rating')}
                  >
                    Highest Rated
                  </button>
                  <button 
                    className={`text-left px-3 py-2 rounded ${sort === 'popular' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                    onClick={() => updateFilters('popular')}
                  >
                    Most Popular
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Minimum Rating</h3>
                <div className="flex flex-wrap gap-2">
                  {renderRatingFilters()}
                </div>
              </div>
              
              <div>
                <div className="mb-2">
                  <h3 className="font-semibold">Categories</h3>
                </div>

                {/* Build a unified category name list from search results or fallback to popular categories */}
                {(() => {
                  const namesFromResults = availableCategories;
                  const namesFromPopular = popularCategories.map((c) => c.name);
                  const unified = (namesFromResults.length > 0 ? namesFromResults : namesFromPopular)
                    .map((c) => (typeof c === 'string' ? c.trim() : ''))
                    .filter((c) => c.length > 0);
                  if (unified.length === 0) return null;

                  return (
                    <div className="flex flex-col space-y-1 max-h-60 overflow-y-auto">
                      {unified.map((category) => (
                        <label key={`cat-${category}`} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-primary mr-2"
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                          />
                          <span className="text-primary">{category}</span>
                        </label>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
          
          {/* Search results */}
          <div className="lg:w-3/4">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-text-muted">
                {filteredPrompts.length} result{filteredPrompts.length !== 1 ? 's' : ''} found
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm">Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => updateFilters(e.target.value as SortOption)}
                  className="px-2 py-1 border rounded"
                >
                  <option value="newest">Newest</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPrompts.map((prompt) => (
                <div key={prompt.id} className="relative">
                  <PromptCard
                    id={prompt.id}
                    title={prompt.title}
                    description={prompt.description}
                    image={prompt.image}
                    tags={prompt.tags}
                    categoryId={prompt.categoryId}
                    categoryName={prompt.categoryName}
                    categoryImage={prompt.categoryImage}
                    userName={prompt.user.name}
                    userImage={prompt.user.image}
                    userId={prompt.user.id}
                    createdAt={prompt.createdAt}
                    rating={prompt.averageRating}
                    numRatings={prompt._count.ratings}
                    suggestedModel={prompt.suggestedModel}
                  />
                  {/* Save button overlay */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      savePrompt(prompt.id);
                    }}
                    aria-label="Save prompt"
                    className={`absolute top-2 right-2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm
                      ${prompt.isSaved ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill={prompt.isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            {filteredPrompts.length === 0 && prompts.length > 0 && (
              <div className="bg-secondary rounded-lg p-8 text-center my-8">
                <h2 className="text-xl font-semibold mb-2">No matching results</h2>
                <p className="mb-4">
                  No prompts match your current filters. Try adjusting your filter criteria.
                </p>
                <button 
                  onClick={() => {
                    setMinRating(0);
                    setSelectedCategories([]);
                    updateFilters('newest', 0);
                  }}
                  className="px-6 py-2 bg-primary text-white rounded-full"
                >
                  Clear All Filters
                </button>
              </div>
            )}
            
            {/* Pagination controls */}
            {filteredPrompts.length > 0 && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                    disabled={pagination.page <= 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.page <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    // For pagination with many pages, show a window around the current page
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        aria-current={pagination.page === pageNum ? "page" : undefined}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.page === pageNum
                            ? 'z-10 bg-primary border-primary text-white'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPagination(prev => ({ 
                      ...prev, 
                      page: Math.min(prev.page + 1, pagination.totalPages) 
                    }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.page >= pagination.totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8 px-4">Loading search…</div>}>
      <SearchPageInner />
    </Suspense>
  );
}
