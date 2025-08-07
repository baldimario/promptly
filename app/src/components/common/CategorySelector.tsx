import React, { useState, useEffect, useRef } from 'react';
import TagInput from './TagInput';

interface CategorySelectorProps {
  value: string[];
  onChange: (categories: string[]) => void;
  maxCategories?: number;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  maxCategories = 10
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          if (data && data.categories) {
            // Extract category names from the response
            const categoryNames = data.categories.map((cat: { name: string }) => cat.name);
            setSuggestions(categoryNames);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = (category: string) => {
    if (value.length < maxCategories && !value.includes(category)) {
      onChange([...value, category]);
    }
  };

  // Filter suggestions to exclude already selected categories
  const filteredSuggestions = suggestions.filter(
    suggestion => !value.includes(suggestion)
  );

  return (
    <div ref={containerRef} className="w-full">
      <TagInput
        value={value}
        onChange={onChange}
        placeholder="Add categories or tags..."
        maxTags={maxCategories}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      
      {/* Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="mt-2">
          <p className="text-sm text-text-muted mb-2">Suggested categories:</p>
          <div className="flex flex-wrap gap-2">
            {filteredSuggestions.slice(0, 10).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="bg-border/30 text-text-muted rounded-full px-3 py-1 text-sm hover:bg-border hover:text-text transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {loading && (
        <div className="mt-2 flex items-center">
          <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
          <span className="text-sm text-text-muted">Loading suggestions...</span>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
