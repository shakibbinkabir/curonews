import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { getPosts, type PostsQueryParams } from '@/lib/api/posts';

const DEBOUNCE_MS = 50; // Fast 50ms debounce for instant feel

export function useSearch(initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Fast debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const searchParams: PostsQueryParams = {
    search: debouncedQuery,
    per_page: 8, // Limit results for speed
  };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => getPosts(searchParams),
    enabled: debouncedQuery.length >= 2, // Only search with 2+ chars
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    query,
    setQuery,
    debouncedQuery,
    results: data?.data ?? [],
    totalResults: data?.meta?.total ?? 0,
    isLoading: isLoading && debouncedQuery.length >= 2,
    isFetching,
    error,
    clearSearch,
    hasQuery: query.length > 0,
    hasResults: (data?.data?.length ?? 0) > 0,
  };
}
