'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';
import type { LoginCredentials, RegisterData } from '@/lib/types';

export function AuthModal() {
  const { showLoginModal, closeLoginModal, login, register: registerUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="p-8 lg:p-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl lg:text-3xl font-semibold text-center">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </DialogTitle>
            <p className="text-muted-foreground text-center text-sm mt-2">
              {mode === 'login' 
                ? 'Sign in to save and like your favorite posts' 
                : 'Join CuroNews to curate your health journey'}
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-xl">
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
                  className={cn(
                    'h-12 rounded-xl bg-secondary border-0',
                    'focus:ring-2 focus:ring-primary/20'
                  )}
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
                className={cn(
                  'h-12 rounded-xl bg-secondary border-0',
                  'focus:ring-2 focus:ring-primary/20'
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  {...register('password', { required: true, minLength: 8 })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={cn(
                    'h-12 rounded-xl bg-secondary border-0 pr-12',
                    'focus:ring-2 focus:ring-primary/20'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  {...register('password_confirmation', { required: mode === 'register' })}
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={cn(
                    'h-12 rounded-xl bg-secondary border-0',
                    'focus:ring-2 focus:ring-primary/20'
                  )}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-medium text-base" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-foreground hover:underline"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
