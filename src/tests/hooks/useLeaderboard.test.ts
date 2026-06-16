/**
 * @module useLeaderboard Tests
 * Tests for the useLeaderboard hook that fetches global leaderboard data.
 */
import { vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLeaderboard } from '@/hooks/useLeaderboard';

// ─── Hoisted Mock Functions ───────────────────────────────────────────────────

const fsMocks = vi.hoisted(() => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: fsMocks.collection,
  query: fsMocks.query,
  orderBy: fsMocks.orderBy,
  limit: fsMocks.limit,
  onSnapshot: fsMocks.onSnapshot,
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useLeaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fsMocks.collection.mockReturnValue('collectionRef');
    fsMocks.query.mockReturnValue('queryRef');
    fsMocks.orderBy.mockReturnValue('orderByRef');
    fsMocks.limit.mockReturnValue('limitRef');
  });

  it('should fetch leaderboard data', async () => {
    fsMocks.onSnapshot.mockImplementation((_ref: unknown, callback: (snap: unknown) => void) => {
      callback({
        docs: [
          { id: '1', data: () => ({ name: 'Test User', carbonScore: 90 }) }
        ],
      });
      return vi.fn(); // unsubscribe
    });

    const { result } = renderHook(() => useLeaderboard({ userId: null }));

    expect(result.current.entries.length).toBe(1);
    expect(result.current.entries[0].name).toBe('Test User');
    expect(result.current.loading).toBe(false);
  });

  it('should handle Firestore error in onSnapshot', () => {
    fsMocks.onSnapshot.mockImplementation(
      (_ref: unknown, _cb: unknown, errCb: (err: Error) => void) => {
        errCb(new Error('Firestore permission denied'));
        return vi.fn();
      }
    );

    const { result } = renderHook(() => useLeaderboard({ userId: null }));

    expect(result.current.error).toBe('Firestore permission denied');
    expect(result.current.loading).toBe(false);
  });

  it('should calculate user rank when userId matches an entry', () => {
    fsMocks.onSnapshot.mockImplementation((_ref: unknown, callback: (snap: unknown) => void) => {
      callback({
        docs: [
          { id: 'user-1', data: () => ({ name: 'Alice', carbonScore: 95 }) },
          { id: 'user-2', data: () => ({ name: 'Bob', carbonScore: 85 }) },
        ],
      });
      return vi.fn();
    });

    const { result } = renderHook(() => useLeaderboard({ userId: 'user-2' }));

    expect(result.current.entries.length).toBe(2);
    expect(result.current.userRank).toBe(2);
    expect(result.current.loading).toBe(false);
  });

  it('should set userRank to null when userId not in leaderboard', () => {
    fsMocks.onSnapshot.mockImplementation((_ref: unknown, callback: (snap: unknown) => void) => {
      callback({
        docs: [
          { id: 'user-1', data: () => ({ name: 'Alice', carbonScore: 95 }) },
        ],
      });
      return vi.fn();
    });

    const { result } = renderHook(() => useLeaderboard({ userId: 'unknown-user' }));

    expect(result.current.userRank).toBeNull();
  });

  it('should clean up subscription on unmount', () => {
    const mockUnsub = vi.fn();
    fsMocks.onSnapshot.mockImplementation((_ref: unknown, callback: (snap: unknown) => void) => {
      callback({ docs: [] });
      return mockUnsub;
    });

    const { unmount } = renderHook(() => useLeaderboard({ userId: null }));
    unmount();

    expect(mockUnsub).toHaveBeenCalled();
  });

  it('should start in loading state', () => {
    fsMocks.onSnapshot.mockImplementation(() => vi.fn()); // never calls callback

    const { result } = renderHook(() => useLeaderboard({ userId: null }));

    expect(result.current.loading).toBe(true);
    expect(result.current.entries).toEqual([]);
  });

  it('should handle empty leaderboard with userId provided', () => {
    fsMocks.onSnapshot.mockImplementation((_ref: unknown, callback: (snap: unknown) => void) => {
      callback({ docs: [] });
      return vi.fn();
    });

    const { result } = renderHook(() => useLeaderboard({ userId: 'user-1', topN: 5 }));

    expect(result.current.entries).toEqual([]);
    expect(result.current.userRank).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
