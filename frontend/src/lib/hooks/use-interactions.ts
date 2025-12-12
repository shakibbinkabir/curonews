import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleLike, toggleSave } from '@/lib/api/posts';
import type { Post, PaginatedResponse } from '@/lib/types';

interface InteractionOptions {
  onLikeSuccess?: (liked: boolean) => void;
  onSaveSuccess?: (saved: boolean) => void;
}

export function useInteractions(postUuid: string, options?: InteractionOptions) {
  const queryClient = useQueryClient();

  // Helper to update a post in any query cache
  const updatePostInCache = (
    updater: (post: Post) => Post
  ) => {
    // Update all posts queries (feed, search, etc.)
    queryClient.setQueriesData<PaginatedResponse<Post>>(
      { queryKey: ['posts'] },
      (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((post) =>
            post.uuid === postUuid ? updater(post) : post
          ),
        };
      }
    );

    // Update saved-posts query
    queryClient.setQueriesData<PaginatedResponse<Post>>(
      { queryKey: ['saved-posts'] },
      (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((post) =>
            post.uuid === postUuid ? updater(post) : post
          ),
        };
      }
    );

    // Update liked-posts query
    queryClient.setQueriesData<PaginatedResponse<Post>>(
      { queryKey: ['liked-posts'] },
      (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((post) =>
            post.uuid === postUuid ? updater(post) : post
          ),
        };
      }
    );

    // Update single post query if it exists
    queryClient.setQueryData<Post>(['post', postUuid], (old) => {
      if (!old) return old;
      return updater(old);
    });
  };

  // Helper to remove a post from a specific query
  const removePostFromCache = (queryKey: string[]) => {
    queryClient.setQueriesData<PaginatedResponse<Post>>(
      { queryKey },
      (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((post) => post.uuid !== postUuid),
        };
      }
    );
  };

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(postUuid),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: ['liked-posts'] });

      // Snapshot the previous value for rollback
      const previousPosts = queryClient.getQueriesData<PaginatedResponse<Post>>({ queryKey: ['posts'] });
      const previousLikedPosts = queryClient.getQueriesData<PaginatedResponse<Post>>({ queryKey: ['liked-posts'] });

      // Get current state to determine if we're liking or unliking
      let wasLiked = false;
      queryClient.getQueriesData<PaginatedResponse<Post>>({ queryKey: ['posts'] }).forEach(([, data]) => {
        const post = data?.data?.find((p) => p.uuid === postUuid);
        if (post) wasLiked = post.user_liked;
      });

      // Optimistically update
      updatePostInCache((post) => ({
        ...post,
        user_liked: !post.user_liked,
        likes_count: post.user_liked 
          ? Math.max(0, post.likes_count - 1) 
          : post.likes_count + 1,
      }));

      // If unliking, remove from liked-posts page immediately
      if (wasLiked) {
        removePostFromCache(['liked-posts']);
      }

      return { previousPosts, previousLikedPosts, wasLiked };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        context.previousPosts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousLikedPosts) {
        context.previousLikedPosts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data) => {
      // Update with server response to ensure consistency
      updatePostInCache((post) => ({
        ...post,
        user_liked: data.liked,
        likes_count: data.likes_count,
      }));
      
      options?.onLikeSuccess?.(data.liked);
      
      // Refetch liked-posts in background to sync
      queryClient.invalidateQueries({ queryKey: ['liked-posts'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => toggleSave(postUuid),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: ['saved-posts'] });

      // Snapshot the previous value for rollback
      const previousPosts = queryClient.getQueriesData<PaginatedResponse<Post>>({ queryKey: ['posts'] });
      const previousSavedPosts = queryClient.getQueriesData<PaginatedResponse<Post>>({ queryKey: ['saved-posts'] });

      // Get current state to determine if we're saving or unsaving
      let wasSaved = false;
      queryClient.getQueriesData<PaginatedResponse<Post>>({ queryKey: ['posts'] }).forEach(([, data]) => {
        const post = data?.data?.find((p) => p.uuid === postUuid);
        if (post) wasSaved = post.user_saved;
      });

      // Optimistically update
      updatePostInCache((post) => ({
        ...post,
        user_saved: !post.user_saved,
        saves_count: post.user_saved 
          ? Math.max(0, post.saves_count - 1) 
          : post.saves_count + 1,
      }));

      // If unsaving, remove from saved-posts page immediately
      if (wasSaved) {
        removePostFromCache(['saved-posts']);
      }

      return { previousPosts, previousSavedPosts, wasSaved };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        context.previousPosts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousSavedPosts) {
        context.previousSavedPosts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data) => {
      // Update with server response to ensure consistency
      updatePostInCache((post) => ({
        ...post,
        user_saved: data.saved,
        saves_count: data.saves_count,
      }));
      
      options?.onSaveSuccess?.(data.saved);
      
      // Refetch saved-posts in background to sync
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] });
    },
  });

  return {
    toggleLike: likeMutation.mutate,
    toggleSave: saveMutation.mutate,
    isLiking: likeMutation.isPending,
    isSaving: saveMutation.isPending,
  };
}
