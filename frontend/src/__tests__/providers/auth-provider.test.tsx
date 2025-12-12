import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/providers/auth-provider'
import * as authApi from '@/lib/api/auth'

// Mock the auth API
vi.mock('@/lib/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const TestComponent = () => {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'guest'}</div>
      <div data-testid="user-name">{user?.name || 'no-user'}</div>
      <button onClick={() => login({ email: 'test@test.com', password: 'password' })}>
        Login
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('shows guest state initially when no token', async () => {
    vi.mocked(authApi.getCurrentUser).mockRejectedValue(new Error('Not authenticated'))

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('guest')
    })
  })

  it('fetches user when token exists', async () => {
    // Set the correct token key used by auth-provider
    localStorage.setItem('auth_token', 'test-token')
    
    const mockUser = {
      id: 1,
      uuid: 'user-uuid',
      name: 'Test User',
      email: 'test@test.com',
      role: 'user' as const,
      avatar_url: null,
      created_at: '2024-01-01T00:00:00Z',
    }
    
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser)

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User')
    })
  })

  it('handles login successfully', async () => {
    const mockUser = {
      id: 1,
      uuid: 'user-uuid',
      name: 'Test User',
      email: 'test@test.com',
      role: 'user' as const,
      avatar_url: null,
      created_at: '2024-01-01T00:00:00Z',
    }
    
    vi.mocked(authApi.login).mockResolvedValue({
      user: mockUser,
      token: 'new-token',
    })

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    )

    const loginButton = screen.getByText('Login')
    fireEvent.click(loginButton)

    await waitFor(() => {
      // Check that login was called (TanStack Query adds extra args, so just check first arg)
      expect(authApi.login).toHaveBeenCalled()
      const callArgs = vi.mocked(authApi.login).mock.calls[0][0]
      expect(callArgs).toEqual({
        email: 'test@test.com',
        password: 'password',
      })
    })
  })

  it('handles logout', async () => {
    localStorage.setItem('auth_token', 'test-token')
    
    const mockUser = {
      id: 1,
      uuid: 'user-uuid',
      name: 'Test User',
      email: 'test@test.com',
      role: 'user' as const,
      avatar_url: null,
      created_at: '2024-01-01T00:00:00Z',
    }
    
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authApi.logout).mockResolvedValue()

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    })

    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(authApi.logout).toHaveBeenCalled()
    })
  })
})
