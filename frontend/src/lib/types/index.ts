// User types
export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  role: 'admin' | 'sourcer' | 'user';
  avatar_url: string | null;
  created_at: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  posts_count?: number;
}

// Tag types
export interface Tag {
  id: number;
  name: string;
  slug: string;
  posts_count?: number;
}

// Post types
export interface Post {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_original_url: string | null;
  image_processed_url: string | null;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  source_name: string | null;
  source_url: string | null;
  view_count: number;
  likes_count: number;
  saves_count: number;
  user_liked: boolean;
  user_saved: boolean;
  published_at: string | null;
  created_at: string;
  category: Category;
  tags: Tag[];
  sourcer: User;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
    path: string;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
