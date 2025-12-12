'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useInteractions } from '@/lib/hooks/use-interactions';
import { PostModal } from './post-modal';
import { AnimatedLikeButton, AnimatedSaveButton } from '@/components/ui/animated-buttons';
import type { Post } from '@/lib/types';

interface PostCardProps {
  post: Post;
  variant?: 'default' | 'featured' | 'wide' | 'tall';
}

export function PostCard({ post, variant = 'default' }: PostCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { user, openLoginModal } = useAuth();
  const { toggleLike, toggleSave, isLiking, isSaving } = useInteractions(post.uuid);

  const handleLike = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user) {
      openLoginModal();
      return;
    }
    toggleLike();
  };

  const handleSave = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user) {
      openLoginModal();
      return;
    }
    toggleSave();
  };

  const imageUrl = post.image_processed || post.image_original || '/placeholder.jpg';

  // Aspect ratios based on variant
  const aspectClasses = {
    default: 'aspect-[4/5]',
    featured: 'aspect-square sm:aspect-[4/3]',
    wide: 'aspect-[16/9]',
    tall: 'aspect-[3/5]',
  };

  // Grid span classes
  const gridClasses = {
    default: '',
    featured: 'bento-item-featured',
    wide: 'bento-item-wide',
    tall: 'bento-item-tall',
  };

  return (
    <>
      <article
        className={cn(
          'group relative overflow-hidden rounded-2xl lg:rounded-3xl cursor-pointer',
          'card-premium bg-card',
          gridClasses[variant]
        )}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Image Container */}
        <div className={cn('relative w-full overflow-hidden', aspectClasses[variant])}>
          {/* Placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 img-placeholder animate-pulse" />
          )}
          
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            className={cn(
              'object-cover transition-all duration-500',
              'group-hover:scale-105',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            onLoad={() => setImageLoaded(true)}
          />

          {/* Gradient Overlay */}
          <div className="overlay-gradient absolute inset-0" />

          {/* Hover Overlay */}
          <div className="overlay-hover" />

          {/* Floating Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <AnimatedSaveButton
              isSaved={post.user_saved}
              onClick={handleSave}
              disabled={isSaving}
              variant="float"
            />
          </div>

          {/* Source Link */}
          {post.source_url && (
            <a
              href={post.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'btn-float absolute bottom-3 right-3',
                'h-9 w-9 rounded-full flex items-center justify-center',
                'bg-white/90 dark:bg-black/70 backdrop-blur-sm',
                'hover:bg-white dark:hover:bg-black transition-colors',
                'shadow-lg'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Content */}
        <div className="p-4 lg:p-5 space-y-3">
          {/* Category */}
          {post.category && (
            <span className="inline-block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {post.category.name}
            </span>
          )}

          {/* Title */}
          <h3 className={cn(
            'font-semibold leading-snug text-balance',
            variant === 'featured' ? 'text-lg lg:text-xl' : 'text-sm lg:text-base',
            'line-clamp-2'
          )}>
            {post.title}
          </h3>

          {/* Meta Row */}
          <div className="flex items-center justify-between pt-1">
            {/* Like Button */}
            <AnimatedLikeButton
              isLiked={post.user_liked}
              likesCount={post.likes_count}
              onClick={handleLike}
              disabled={isLiking}
            />

            {/* Read indicator */}
            <span className="text-xs text-muted-foreground">
              {post.view_count > 0 && `${post.view_count} views`}
            </span>
          </div>
        </div>
      </article>

      <PostModal
        post={post}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
