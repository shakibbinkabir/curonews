import apiClient from './client';
import type { User, AuthResponse, LoginCredentials, RegisterData } from '@/lib/types';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data;
}

export async function register(userData: RegisterData): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/register', userData);
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get('/auth/user');
  return data.data;
}

export async function updateProfile(profileData: Partial<User>): Promise<User> {
  const { data } = await apiClient.put('/auth/profile', profileData);
  return data.data;
}

export async function changePassword(passwords: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  await apiClient.put('/auth/password', passwords);
}
