'use client';

import Link from 'next/link';
import { Search, User, Menu, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchValueFromUrl = useMemo(() => searchParams.get('search') || '', [searchParams]);
  const [searchQuery, setSearchQuery] = useState(searchValueFromUrl);

  // Keep input in sync with URL changes (e.g., back/forward navigation)
  useEffect(() => {
    setSearchQuery(searchValueFromUrl);
  }, [searchValueFromUrl]);

  // Debounced URL updates for instant search without reloads
  useEffect(() => {
    const timeout = setTimeout(() => {
      const trimmed = searchQuery.trim();
      const current = searchParams.get('search') || '';
      if (current === trimmed) return;

      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (trimmed.length > 0) {
        params.set('search', trimmed);
      } else {
        params.delete('search');
      }
      const nextUrl = params.size > 0 ? `/?${params.toString()}` : '/';
      router.replace(nextUrl, { scroll: true });
    }, 150);

    return () => clearTimeout(timeout);
  }, [searchQuery, router, searchParams]);

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/40">
      <div className="container-padding">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 shrink-0"
          >
            <span className="text-xl font-semibold tracking-tight lg:text-2xl">
              Curo<span className="text-muted-foreground font-light">News</span>
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search health topics..."
                className={cn(
                  "w-full h-11 pl-11 pr-4 rounded-full",
                  "bg-secondary/80 border-0",
                  "text-sm placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background",
                  "transition-all duration-200"
                )}
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full h-10 w-10"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <ThemeToggle />

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-10 w-10 rounded-full p-0 hover:bg-secondary"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/profile/likes">Liked Posts</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/profile/saved">Saved Posts</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/profile/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => logout()} 
                    className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={openLoginModal} 
                className="rounded-full px-5 h-10 font-medium"
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full h-10 w-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search health topics..."
                className={cn(
                  "w-full h-11 pl-11 pr-4 rounded-full",
                  "bg-secondary/80 border-0",
                  "text-sm placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background",
                  "transition-all duration-200"
                )}
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/40 animate-fade-in">
          <nav className="container-padding py-4 space-y-1">
            <Link
              href="/"
              className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/category/research"
              className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Research
            </Link>
            <Link
              href="/category/wellness"
              className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Wellness
            </Link>
            <Link
              href="/category/nutrition"
              className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Nutrition
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
