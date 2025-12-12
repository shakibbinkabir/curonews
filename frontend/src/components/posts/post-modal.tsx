'use client';

import Image from 'next/image';
import { X, Heart, Bookmark, ExternalLink, Calendar, Eye, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/providers/auth-provider';
import { useInteractions } from '@/lib/hooks/use-interactions';
import { AnimatedLikeButton, AnimatedSaveButton } from '@/components/ui/animated-buttons';
import type { Post } from '@/lib/types';

interface PostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export function PostModal({ post, isOpen, onClose }: PostModalProps) {
  const { user, openLoginModal } = useAuth();
  const { toggleLike, toggleSave, isLiking, isSaving } = useInteractions(post.uuid);

  const handleLike = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    toggleLike();
  };

  const handleSave = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    toggleSave();
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
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] p-0 overflow-hidden rounded-2xl lg:rounded-3xl border-0 shadow-2xl">
        <DialogTitle className="sr-only">{post.title}</DialogTitle>
        
        <div className="grid lg:grid-cols-[1fr,400px] h-full max-h-[90vh]">
          {/* Image Section */}
          <div className="relative bg-black min-h-[300px] lg:min-h-full">
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-contain"
              priority
            />
            
            {/* Close Button - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 lg:hidden h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content Section */}
          <div className="flex flex-col h-full max-h-[90vh] lg:max-h-none bg-background">
            {/* Header */}
            <div className="flex items-center justify-between p-4 lg:p-6 border-b">
              <div className="flex items-center gap-3">
                {/* Action Buttons */}
                <div className="h-10 w-10 rounded-full bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors">
                  <AnimatedLikeButton
                    isLiked={post.user_liked}
                    likesCount={post.likes_count}
                    onClick={handleLike}
                    disabled={isLiking}
                    size="md"
                    showCount={false}
                  />
                </div>
                
                <div className="h-10 w-10 rounded-full bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors">
                  <AnimatedSaveButton
                    isSaved={post.user_saved}
                    onClick={handleSave}
                    disabled={isSaving}
                    size="md"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Save Button */}
              <Button
                className={cn(
                  'rounded-full px-6 transition-all duration-300',
                  post.user_saved && 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
                onClick={handleSave}
                disabled={isSaving}
              >
                {post.user_saved ? 'Saved' : 'Save'}
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
              {/* Category & Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                {post.category && (
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {post.category.name}
                  </span>
                )}
                {post.tags && post.tags.length > 0 && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    {post.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={tag.id} 
                        className="text-xs text-muted-foreground"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl lg:text-2xl font-semibold leading-tight text-balance">
                {post.title}
              </h2>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {publishedDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {publishedDate}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {post.view_count} views
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4" />
                  {post.likes_count} likes
                </span>
              </div>

              {/* Content */}
              {post.content && (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-pretty"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              )}

              {/* Excerpt if no content */}
              {!post.content && post.excerpt && (
                <p className="text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 lg:p-6 border-t space-y-4">
              {/* Source */}
              {post.source_url && (
                <a
                  href={post.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl',
                    'bg-secondary hover:bg-secondary/80',
                    'transition-colors'
                  )}
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate">
                    {post.source_name || 'View original source'}
                  </span>
                </a>
              )}

              {/* Author */}
              {post.sourcer && (
                <p className="text-xs text-muted-foreground">
                  Curated by <span className="font-medium text-foreground">{post.sourcer.name}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
