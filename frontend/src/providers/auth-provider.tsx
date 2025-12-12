'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { login as loginApi, register as registerApi, logout as logoutApi, getCurrentUser } from '@/lib/api/auth';
import type { User, LoginCredentials, RegisterData } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  showLoginModal: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    retry: false,
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('auth_token'),
  });

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      queryClient.setQueryData(['user'], data.user);
      setShowLoginModal(false);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      queryClient.setQueryData(['user'], data.user);
      setShowLoginModal(false);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      localStorage.removeItem('auth_token');
      queryClient.setQueryData(['user'], null);
      queryClient.invalidateQueries();
    },
  });

  const openLoginModal = useCallback(() => setShowLoginModal(true), []);
  const closeLoginModal = useCallback(() => setShowLoginModal(false), []);

  const value: AuthContextType = {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    login: async (credentials) => {
      await loginMutation.mutateAsync(credentials);
    },
    register: async (data) => {
      await registerMutation.mutateAsync(data);
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    showLoginModal,
    openLoginModal,
    closeLoginModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
