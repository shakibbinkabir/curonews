import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleLike, toggleSave } from '@/lib/api/posts';

export function useInteractions(postUuid: string) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(postUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => toggleSave(postUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return {
    toggleLike: likeMutation.mutate,
    toggleSave: saveMutation.mutate,
    isLiking: likeMutation.isPending,
    isSaving: saveMutation.isPending,
  };
}
