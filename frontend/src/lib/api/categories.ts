import apiClient from './client';
import type { Category } from '@/lib/types';

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get('/categories');
  return data.data;
}

export async function getCategory(slug: string): Promise<Category> {
  const { data } = await apiClient.get(`/categories/${slug}`);
  return data.data;
}
