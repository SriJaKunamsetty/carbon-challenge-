import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { vi } from 'vitest';

describe('useReducedMotion', () => {
  let matchMediaMock: any;

  beforeEach(() => {
    matchMediaMock = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.stubGlobal('matchMedia', matchMediaMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true if prefers-reduced-motion is true', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('should return false if prefers-reduced-motion is false', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('should update value on change event', () => {
    let changeHandler: EventListener | null = null;
    matchMediaMock.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn((event, handler) => {
        if (event === 'change') changeHandler = handler;
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      if (changeHandler) {
        changeHandler({ matches: true } as unknown as Event);
      }
    });

    expect(result.current).toBe(true);
  });
});
