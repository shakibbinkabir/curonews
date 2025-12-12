'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/providers/auth-provider';
import type { LoginCredentials, RegisterData } from '@/lib/types';

export function AuthModal() {
  const { showLoginModal, closeLoginModal, login, register: registerUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginCredentials & RegisterData>();

  const onSubmit = async (data: LoginCredentials & RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await login({ email: data.email, password: data.password });
      } else {
        await registerUser(data);
      }
      reset();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
    reset();
  };

  return (
    <Dialog open={showLoginModal} onOpenChange={closeLoginModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                {...register('name', { required: mode === 'register' })}
                placeholder="Your name"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              {...register('email', { required: true })}
              type="email"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              {...register('password', { required: true, minLength: 8 })}
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <Input
                {...register('password_confirmation', { required: mode === 'register' })}
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-primary hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
