'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { usePosts } from '@/lib/hooks/use-posts';
import { PostGrid } from '@/components/posts/post-grid';
import { CategoryFilter } from './category-filter';

interface FeedContainerProps {
  initialCategory?: string;
}

export function FeedContainer({ initialCategory }: FeedContainerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = usePosts({
    category: selectedCategory || undefined,
    per_page: 12,
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
    <div className="space-y-6">
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <PostGrid posts={posts} isLoading={isLoading} />

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
        {isFetchingNextPage && (
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        )}
        {!hasNextPage && posts.length > 0 && (
          <p className="text-sm text-muted-foreground">No more posts</p>
        )}
      </div>
    </div>
  );
}
