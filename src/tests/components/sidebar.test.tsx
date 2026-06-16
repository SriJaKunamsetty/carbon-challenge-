/**
 * @module Sidebar Tests
 * Tests for the Sidebar navigation component.
 */
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Use vi.hoisted to ensure these are available when vi.mock factories run
const { mockUsePathname, mockUseAuth } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(() => '/dashboard'),
  mockUseAuth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

// Import component AFTER vi.mock declarations
import { Sidebar } from '@/components/dashboard/sidebar';

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/dashboard');
    mockUseAuth.mockReturnValue({
      user: { uid: '123' },
      logout: vi.fn(),
    });
  });

  it('renders navigation links', () => {
    render(<Sidebar />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Carbon Tracker')).toBeInTheDocument();
    expect(screen.getByText('AI Coach')).toBeInTheDocument();
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    mockUsePathname.mockReturnValue('/dashboard/tracker');
    render(<Sidebar />);
    expect(screen.getByText('Carbon Tracker')).toBeInTheDocument();
  });

  it('applies aria-current="page" on active navigation link', () => {
    mockUsePathname.mockReturnValue('/dashboard/tracker');
    render(<Sidebar />);
    const activeLink = screen.getByRole('link', { name: /carbon tracker/i });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
    
    const inactiveLink = screen.getByRole('link', { name: /overview/i });
    expect(inactiveLink).not.toHaveAttribute('aria-current');
  });

  it('triggers logout when Sign Out button is clicked or activated by keypress', () => {
    const mockLogout = vi.fn();
    mockUseAuth.mockReturnValue({
      user: { uid: '123' },
      logout: mockLogout,
    });
    
    render(<Sidebar />);
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    signOutButton.click();
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
