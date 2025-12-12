'use client';

import { cn } from '@/lib/utils';
import { PostCard } from './post-card';
import { PostSkeleton } from './post-skeleton';
import type { Post } from '@/lib/types';

interface PostGridProps {
  posts: Post[];
  isLoading?: boolean;
}

export function PostGrid({ posts, isLoading }: PostGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'grid gap-6',
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        )}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No posts found</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid gap-6',
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        'auto-rows-auto'
      )}
    >
      {posts.map((post) => (
        <PostCard key={post.uuid} post={post} />
      ))}
    </div>
  );
}
