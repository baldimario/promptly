import React, { useState, useEffect } from 'react';
import Select, { SelectOption } from './Select';

interface Category {
  id: string;
  name: string;
  image?: string;
}

interface CategorySelectProps {
  value: string | null;
  onChange: (categoryId: string | null) => void;
  className?: string;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          if (data && data.categories) {
            setCategories(data.categories);
            
            // Convert categories to select options format
            const selectOptions = data.categories.map((cat: Category) => ({
              value: cat.id,
              label: cat.name,
              image: cat.image
            }));
            
            setOptions(selectOptions);
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

  if (loading) {
    return (
      <div className={`flex w-full items-center p-3 border border-border rounded-xl bg-background/80 backdrop-blur-md text-text ${className}`}>
        <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent mr-2"></div>
        <span>Loading categories...</span>
      </div>
    );
  }

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select a category"
      className={className}
      clearText="No category"
    />
  );
};

export default CategorySelect;
