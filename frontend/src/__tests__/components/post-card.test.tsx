import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PostCard } from '@/components/posts/post-card'
import { AuthProvider } from '@/providers/auth-provider'
import type { Post } from '@/lib/types'

// Mock the auth API
vi.mock('@/lib/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn().mockRejectedValue(new Error('Not authenticated')),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

const mockPost: Post = {
  id: 1,
  uuid: 'test-uuid-123',
  title: 'Test Post Title',
  slug: 'test-post-title',
  excerpt: 'This is a test excerpt for the post.',
  content: 'Full content here...',
  status: 'published',
  image_original: null,
  image_processed: '/test-image.jpg',
  category: {
    id: 1,
    name: 'Health',
    slug: 'health',
    description: null,
  },
  tags: [
    { id: 1, name: 'Wellness', slug: 'wellness' },
    { id: 2, name: 'Tips', slug: 'tips' },
  ],
  sourcer: {
    id: 1,
    uuid: 'user-uuid',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'sourcer',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
  },
  source_name: 'Health Today',
  source_url: 'https://healthtoday.com',
  view_count: 100,
  likes_count: 50,
  saves_count: 25,
  user_liked: false,
  user_saved: false,
  published_at: '2024-01-15T10:00:00Z',
  created_at: '2024-01-14T10:00:00Z',
}

describe('PostCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders post title correctly', () => {
    render(<PostCard post={mockPost} />, { wrapper: createWrapper() })
    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<PostCard post={mockPost} />, { wrapper: createWrapper() })
    expect(screen.getByText('Health')).toBeInTheDocument()
  })

  it('renders post image with alt text', () => {
    render(<PostCard post={mockPost} />, { wrapper: createWrapper() })
    const image = screen.getByAltText('Test Post Title')
    expect(image).toBeInTheDocument()
  })

  it('shows like count', () => {
    render(<PostCard post={mockPost} />, { wrapper: createWrapper() })
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('renders without image gracefully', () => {
    const postWithoutImage = { ...mockPost, image_processed: null }
    render(<PostCard post={postWithoutImage} />, { wrapper: createWrapper() })
    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
  })

  it('applies featured variant styling', () => {
    const { container } = render(
      <PostCard post={mockPost} variant="featured" />,
      { wrapper: createWrapper() }
    )
    // Uses bento-item-featured class
    expect(container.firstChild).toHaveClass('bento-item-featured')
  })

  it('applies wide variant styling', () => {
    const { container } = render(
      <PostCard post={mockPost} variant="wide" />,
      { wrapper: createWrapper() }
    )
    expect(container.firstChild).toHaveClass('bento-item-wide')
  })

  it('applies tall variant styling', () => {
    const { container } = render(
      <PostCard post={mockPost} variant="tall" />,
      { wrapper: createWrapper() }
    )
    expect(container.firstChild).toHaveClass('bento-item-tall')
  })

  it('shows liked state when user_liked is true', () => {
    const likedPost = { ...mockPost, user_liked: true }
    render(<PostCard post={likedPost} />, { wrapper: createWrapper() })
    // The like button should have red text when liked
    const likeButton = screen.getByRole('button', { name: /50/i })
    expect(likeButton).toHaveClass('text-red-500')
  })

  it('shows saved state when user_saved is true', () => {
    const savedPost = { ...mockPost, user_saved: true }
    render(<PostCard post={savedPost} />, { wrapper: createWrapper() })
    // The save button should have primary styling when saved
    const buttons = screen.getAllByRole('button')
    const saveButton = buttons.find(btn => btn.querySelector('svg.fill-current'))
    expect(saveButton).toHaveClass('bg-primary')
  })

  it('displays card without crashing', () => {
    const { container } = render(<PostCard post={mockPost} />, { wrapper: createWrapper() })
    expect(container.firstChild).toBeInTheDocument()
  })
})
