'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { usePosts } from '@/lib/hooks/use-posts';
import { PostGrid } from '@/components/posts/post-grid';
import { CategoryFilter } from './category-filter';

interface FeedContainerProps {
  initialCategory?: string;
  initialSearch?: string;
}

export function FeedContainer({ initialCategory, initialSearch }: FeedContainerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(initialSearch || '');
  }, [initialSearch]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = usePosts({
    category: selectedCategory || undefined,
    per_page: 12,
    search: searchTerm.trim() || undefined,
  });

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <section className="container-padding py-8 lg:py-12">
      {/* Page Header */}
      <div className="mb-8 lg:mb-12">
        <h1 className="text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight mb-3">
          Discover
        </h1>
        <p className="text-muted-foreground text-base lg:text-lg max-w-2xl">
          Curated health insights, research, and wellness tips from trusted sources.
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8 lg:mb-10">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Posts Grid */}
      <PostGrid posts={posts} isLoading={isLoading} />

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="h-24 flex items-center justify-center mt-8">
        {isFetchingNextPage && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Loading more...</span>
          </div>
        )}
        {!hasNextPage && posts.length > 0 && (
          <p className="text-sm text-muted-foreground">You&apos;ve reached the end</p>
        )}
      </div>
    </section>
  );
}
