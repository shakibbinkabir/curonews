'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function PostSkeleton() {
  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-3xl bg-muted">
      <Skeleton className="absolute inset-0" />
      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-10" />
        </div>
      </div>
    </div>
  );
}
