'use client';

import { cn } from '@/lib/utils';
import { useCategories } from '@/lib/hooks/use-categories';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-24 rounded-full skeleton shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
      <button
        onClick={() => onSelectCategory(null)}
        className={cn(
          'shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
          selectedCategory === null
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        )}
      >
        All
      </button>
      {categories?.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.slug)}
          className={cn(
            'shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
            selectedCategory === category.slug
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
