import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';
import { vi } from 'vitest';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('should debounce the value update', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('updated');
  });

  it('should cancel the timeout if value changes before delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated1' });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    rerender({ value: 'updated2' });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    
    // updated1 should not be set
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('updated2');
  });
});
