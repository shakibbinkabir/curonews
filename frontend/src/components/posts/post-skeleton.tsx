'use client';

import { cn } from '@/lib/utils';

interface PostSkeletonProps {
  variant?: 'default' | 'featured' | 'wide' | 'tall';
}

export function PostSkeleton({ variant = 'default' }: PostSkeletonProps) {
  const aspectClasses = {
    default: 'aspect-[4/5]',
    featured: 'aspect-square sm:aspect-[4/3]',
    wide: 'aspect-[16/9]',
    tall: 'aspect-[3/5]',
  };

  const gridClasses = {
    default: '',
    featured: 'bento-item-featured',
    wide: 'bento-item-wide',
    tall: 'bento-item-tall',
  };

  return (
    <div className={cn('rounded-2xl lg:rounded-3xl overflow-hidden bg-card', gridClasses[variant])}>
      {/* Image skeleton */}
      <div className={cn('relative overflow-hidden', aspectClasses[variant])}>
        <div className="absolute inset-0 skeleton" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-4 lg:p-5 space-y-3">
        <div className="h-3 w-16 rounded-full skeleton" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded-lg skeleton" />
          <div className="h-4 w-3/4 rounded-lg skeleton" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 w-12 rounded-full skeleton" />
          <div className="h-3 w-16 rounded-full skeleton" />
        </div>
      </div>
    </div>
  );
}
