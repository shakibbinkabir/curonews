import apiClient from './client';
import type { Post, PaginatedResponse } from '@/lib/types';

export interface PostsQueryParams {
  page?: number;
  per_page?: number;
  category?: string;
  tag?: string;
  search?: string;
  sort_by?: 'published_at' | 'likes_count' | 'title';
  sort_order?: 'asc' | 'desc';
}

export async function getPosts(params: PostsQueryParams = {}): Promise<PaginatedResponse<Post>> {
  const { data } = await apiClient.get('/posts', { params });
  return data;
}

export async function getPost(uuid: string): Promise<Post> {
  const { data } = await apiClient.get(`/posts/${uuid}`);
  return data.data;
}

export async function toggleLike(uuid: string): Promise<{ liked: boolean; likes_count: number }> {
  const { data } = await apiClient.post(`/posts/${uuid}/like`);
  return data;
}

export async function toggleSave(uuid: string): Promise<{ saved: boolean; saves_count: number }> {
  const { data } = await apiClient.post(`/posts/${uuid}/save`);
  return data;
}

export async function getLikedPosts(page: number = 1): Promise<PaginatedResponse<Post>> {
  const { data } = await apiClient.get('/user/likes', { params: { page } });
  return data;
}

export async function getSavedPosts(page: number = 1): Promise<PaginatedResponse<Post>> {
  const { data } = await apiClient.get('/user/saves', { params: { page } });
  return data;
}
