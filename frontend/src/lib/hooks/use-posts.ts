import { useInfiniteQuery } from '@tanstack/react-query';
import { getPosts, type PostsQueryParams } from '@/lib/api/posts';

export function usePosts(params: Omit<PostsQueryParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: ['posts', params],
    queryFn: ({ pageParam = 1 }) => getPosts({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}
