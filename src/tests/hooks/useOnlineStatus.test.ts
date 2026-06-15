import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { vi } from 'vitest';

describe('useOnlineStatus', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'addEventListener');
    vi.spyOn(globalThis, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true by default if navigator.onLine is true', () => {
    vi.stubGlobal('navigator', { onLine: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.isOnline).toBe(true);
  });

  it('should return false by default if navigator.onLine is false', () => {
    vi.stubGlobal('navigator', { onLine: false });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.isOnline).toBe(false);
  });

  it('should update status on offline and online events', () => {
    vi.stubGlobal('navigator', { onLine: true });
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(true);

    act(() => {
      globalThis.dispatchEvent(new Event('offline'));
    });
    expect(result.current.isOnline).toBe(false);

    act(() => {
      globalThis.dispatchEvent(new Event('online'));
    });
    expect(result.current.isOnline).toBe(true);
  });
});
