'use client';

import { PostCard } from './post-card';
import { PostSkeleton } from './post-skeleton';
import { Inbox } from 'lucide-react';
import type { Post } from '@/lib/types';

interface PostGridProps {
  posts: Post[];
  isLoading?: boolean;
}

// Determine card variant based on index for visual variety
function getCardVariant(index: number): 'default' | 'featured' | 'wide' | 'tall' {
  // First item is always featured
  if (index === 0) return 'featured';
  
  // Create a repeating pattern for variety
  const patterns = [
    'default', 'default', 'tall', 'default', 'wide',
    'default', 'default', 'default', 'tall', 'default'
  ];
  
  return patterns[(index - 1) % patterns.length] as 'default' | 'featured' | 'wide' | 'tall';
}

export function PostGrid({ posts, isLoading }: PostGridProps) {
  if (isLoading) {
    return (
      <div className="bento-grid">
        {Array.from({ length: 10 }).map((_, i) => (
          <PostSkeleton key={i} variant={getCardVariant(i)} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 lg:py-32 px-4">
        <div className="w-20 h-20 lg:w-24 lg:h-24 mb-6 rounded-full bg-secondary flex items-center justify-center">
          <Inbox className="w-10 h-10 lg:w-12 lg:h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl lg:text-2xl font-semibold mb-2 text-center">No posts yet</h3>
        <p className="text-muted-foreground text-center max-w-md text-sm lg:text-base">
          We couldn&apos;t find any posts. Check back soon for curated health content!
        </p>
      </div>
    );
  }

  return (
    <div className="bento-grid">
      {posts.map((post, index) => (
        <PostCard 
          key={post.uuid} 
          post={post} 
          variant={getCardVariant(index)} 
        />
      ))}
    </div>
  );
}
