'use client';

import Image from 'next/image';
import { X, Heart, Bookmark, ExternalLink, Calendar, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/providers/auth-provider';
import { useInteractions } from '@/lib/hooks/use-interactions';
import type { Post } from '@/lib/types';

interface PostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export function PostModal({ post, isOpen, onClose }: PostModalProps) {
  const { user, openLoginModal } = useAuth();
  const { toggleLike, toggleSave, isLiking, isSaving } = useInteractions(post.uuid);

  const handleInteraction = (action: 'like' | 'save') => {
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

  const imageUrl = post.image_processed || post.image_original || '/placeholder.jpg';
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">{post.title}</DialogTitle>
        <div className="grid md:grid-cols-2 h-full">
          {/* Image Section */}
          <div className="relative aspect-[9/16] md:aspect-auto bg-black">
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-contain"
              priority
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 md:hidden"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content Section */}
          <ScrollArea className="max-h-[90vh] md:max-h-none">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {post.category && <Badge>{post.category.name}</Badge>}
                  {post.tags?.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
                <h2 className="text-2xl font-bold leading-tight">{post.title}</h2>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {publishedDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {publishedDate}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.view_count} views
                </span>
              </div>

              {/* Interactions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(post.user_liked && 'text-red-500 border-red-500')}
                  onClick={() => handleInteraction('like')}
                  disabled={isLiking}
                >
                  <Heart
                    className={cn('w-4 h-4 mr-2', post.user_liked && 'fill-current')}
                  />
                  {post.likes_count} Likes
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className={cn(post.user_saved && 'text-yellow-500 border-yellow-500')}
                  onClick={() => handleInteraction('save')}
                  disabled={isSaving}
                >
                  <Bookmark
                    className={cn('w-4 h-4 mr-2', post.user_saved && 'fill-current')}
                  />
                  Save
                </Button>
              </div>

              {/* Content */}
              {post.content && (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              )}

              {/* Source */}
              {post.source_url && (
                <div className="pt-4 border-t">
                  <a
                    href={post.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {post.source_name || 'View Source'}
                  </a>
                </div>
              )}

              {/* Author */}
              {post.sourcer && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Curated by <span className="font-medium text-foreground">{post.sourcer.name}</span>
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
