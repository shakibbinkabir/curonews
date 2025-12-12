'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/providers/auth-provider';
import { useInteractions } from '@/lib/hooks/use-interactions';
import { PostModal } from './post-modal';
import type { Post } from '@/lib/types';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, openLoginModal } = useAuth();
  const { toggleLike, toggleSave, isLiking, isSaving } = useInteractions(post.uuid);

  const handleInteraction = (action: 'like' | 'save', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openLoginModal();
      return;
    }
    if (action === 'like') {
      toggleLike();
    } else {
      toggleSave();
    }
  };

  const imageUrl = post.image_processed_url || post.image_original_url || '/placeholder.jpg';

  return (
    <>
      <article
        className={cn(
          'group relative aspect-[9/16] overflow-hidden rounded-3xl',
          'bg-neutral-100 dark:bg-neutral-900',
          'cursor-pointer transition-all duration-300',
          'hover:scale-[1.02] hover:shadow-xl'
        )}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Image */}
        <Image
          src={imageUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Gradient Overlay */}
        <div
          className={cn(
            'absolute inset-0',
            'bg-gradient-to-t from-black/80 via-black/20 to-transparent'
          )}
        />

        {/* Category Badge */}
        <Badge
          className="absolute top-4 left-4 bg-primary text-primary-foreground"
        >
          {post.category.name}
        </Badge>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-white font-semibold text-lg leading-tight mb-4 line-clamp-3">
            {post.title}
          </h3>

          {/* Interaction Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'text-white hover:bg-white/20 hover:text-white',
                post.user_liked && 'text-red-500 hover:text-red-500'
              )}
              onClick={(e) => handleInteraction('like', e)}
              disabled={isLiking}
            >
              <Heart
                className={cn('w-5 h-5 mr-1', post.user_liked && 'fill-current')}
              />
              {post.likes_count}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'text-white hover:bg-white/20 hover:text-white',
                post.user_saved && 'text-yellow-500 hover:text-yellow-500'
              )}
              onClick={(e) => handleInteraction('save', e)}
              disabled={isSaving}
            >
              <Bookmark
                className={cn('w-5 h-5', post.user_saved && 'fill-current')}
              />
            </Button>
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
