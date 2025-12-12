'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useCategories } from '@/lib/hooks/use-categories';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-24 rounded-full bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-4">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
          onClick={() => onSelectCategory(null)}
        >
          All
        </Button>
        {categories?.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.slug ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => onSelectCategory(category.slug)}
          >
            {category.name}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
