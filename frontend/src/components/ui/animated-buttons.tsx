'use client';

import { useState } from 'react';
import { Heart, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedLikeButtonProps {
  isLiked: boolean;
  likesCount: number;
  onClick: (e?: React.MouseEvent) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  variant?: 'default' | 'minimal';
}

export function AnimatedLikeButton({
  isLiked,
  likesCount,
  onClick,
  disabled = false,
  size = 'sm',
  showCount = true,
  variant = 'default',
}: AnimatedLikeButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState<number[]>([]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    // Trigger animation only when liking
    if (!isLiked) {
      setIsAnimating(true);
      // Create burst particles
      setParticles(Array.from({ length: 6 }, (_, i) => i));
      setTimeout(() => {
        setIsAnimating(false);
        setParticles([]);
      }, 700);
    }

    onClick(e);
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizeClasses = {
    sm: 'gap-1.5 text-xs',
    md: 'gap-2 text-sm',
    lg: 'gap-2.5 text-base',
  };

  return (
    <button
      className={cn(
        'relative flex items-center text-muted-foreground',
        'hover:text-foreground transition-colors',
        isLiked && 'text-red-500 hover:text-red-600',
        buttonSizeClasses[size],
        disabled && 'pointer-events-none opacity-70'
      )}
      onClick={handleClick}
      disabled={disabled}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      {/* Particle burst effect */}
      <span className="relative inline-flex items-center justify-center">
        {particles.map((i) => (
          <span
            key={i}
            className="absolute animate-particle-burst"
            style={{
              '--particle-angle': `${i * 60}deg`,
              '--particle-distance': '20px',
            } as React.CSSProperties}
          >
            <Heart className="h-2 w-2 fill-red-500 text-red-500" />
          </span>
        ))}

        {/* Main heart icon */}
        <Heart
          className={cn(
            sizeClasses[size],
            'transition-all duration-200',
            isLiked && 'fill-current',
            isAnimating && 'animate-heart-pop'
          )}
        />

        {/* Ring effect on like */}
        {isAnimating && (
          <span className="absolute inset-0 animate-heart-ring rounded-full border-2 border-red-500" />
        )}
      </span>

      {/* Count */}
      {showCount && (
        <span className={cn('font-medium transition-all duration-200', isAnimating && 'animate-count-bump')}>
          {likesCount > 0 ? likesCount : 'Like'}
        </span>
      )}
    </button>
  );
}

interface AnimatedSaveButtonProps {
  isSaved: boolean;
  onClick: (e?: React.MouseEvent) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'float';
}

export function AnimatedSaveButton({
  isSaved,
  onClick,
  disabled = false,
  size = 'sm',
  variant = 'default',
}: AnimatedSaveButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    // Trigger animation only when saving
    if (!isSaved) {
      setIsAnimating(true);
      setShowCheckmark(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 400);
      setTimeout(() => {
        setShowCheckmark(false);
      }, 800);
    }

    onClick(e);
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  if (variant === 'float') {
    return (
      <button
        className={cn(
          'btn-float h-9 w-9 rounded-full flex items-center justify-center',
          'bg-white/90 dark:bg-black/70 backdrop-blur-sm',
          'hover:bg-white dark:hover:bg-black transition-all duration-200',
          'shadow-lg',
          isSaved && 'bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90',
          isAnimating && 'scale-110',
          disabled && 'pointer-events-none opacity-70'
        )}
        onClick={handleClick}
        disabled={disabled}
        aria-label={isSaved ? 'Unsave' : 'Save'}
      >
        <span className="relative inline-flex items-center justify-center">
          <Bookmark
            className={cn(
              sizeClasses[size],
              'transition-all duration-200',
              isSaved && 'fill-current',
              isAnimating && 'animate-bookmark-slide'
            )}
          />
          
          {/* Success checkmark overlay */}
          {showCheckmark && (
            <span className="absolute inset-0 flex items-center justify-center animate-check-pop">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      className={cn(
        'relative flex items-center justify-center text-muted-foreground',
        'hover:text-foreground transition-colors',
        isSaved && 'text-primary',
        disabled && 'pointer-events-none opacity-70'
      )}
      onClick={handleClick}
      disabled={disabled}
      aria-label={isSaved ? 'Unsave' : 'Save'}
    >
      <span className="relative inline-flex items-center justify-center">
        <Bookmark
          className={cn(
            sizeClasses[size],
            'transition-all duration-200',
            isSaved && 'fill-current',
            isAnimating && 'animate-bookmark-slide'
          )}
        />
      </span>
    </button>
  );
}
