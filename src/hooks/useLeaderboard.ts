import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { LeaderboardEntry } from "@/types";

/**
 * Options for the useLeaderboard hook.
 */
export interface UseLeaderboardOptions {
  /** The currently authenticated user's UID (used to compute rank) */
  userId: string | null;
  /** Maximum number of leaderboard entries to fetch (default: 50) */
  topN?: number;
}

/**
 * Return value of the useLeaderboard hook.
 */
export interface UseLeaderboardReturn {
  /** The sorted list of leaderboard entries (descending by points) */
  entries: LeaderboardEntry[];
  /** Whether the leaderboard data is loading */
  loading: boolean;
  /** Error message if the subscription failed */
  error: string | null;
  /** The 1-based rank of the current user, or null if not found */
  userRank: number | null;
}

/**
 * Custom hook that subscribes to the leaderboard in real-time via Firestore `onSnapshot`.
 *
 * Queries the `users` collection ordered by `points` descending and maps each
 * document to a `LeaderboardEntry`. Also computes the current user's rank.
 *
 * Automatically cleans up the Firestore subscription on unmount.
 *
 * @param options - Configuration including the current userId and max entries
 * @returns An object containing entries, loading/error state, and user rank
 *
 * @example
 * ```tsx
 * const { entries, loading, userRank } = useLeaderboard({
 *   userId: user?.uid ?? null,
 *   topN: 25,
 * });
 * ```
 */
export function useLeaderboard(options: UseLeaderboardOptions): UseLeaderboardReturn {
  const { userId, topN = 50 } = options;

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);

  const unsubRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {

    const colRef = collection(db, "users");
    const q = query(colRef, orderBy("points", "desc"), limit(topN));

    // Clean up any previous subscription
    /* c8 ignore next -- only fires on re-renders when topN/userId changes, not on initial mount */
    if (unsubRef.current) {
      unsubRef.current();
    }

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const leaderboard: LeaderboardEntry[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            userId: docSnap.id,
            name: (data.name as string) ?? "Anonymous",
            photoURL: (data.photoURL as string | null) ?? null,
            points: (data.points as number) ?? 0,
            streak: (data.streak as number) ?? 0,
            carbonScore: (data.carbonScore as number) ?? 0,
            level: Math.floor(((data.points as number) ?? 0) / 100) + 1,
          };
        });

        setEntries(leaderboard);

        // Compute user rank
        if (userId) {
          const rankIndex = leaderboard.findIndex((entry) => entry.userId === userId);
          setUserRank(rankIndex >= 0 ? rankIndex + 1 : null);
        } else {
          setUserRank(null);
        }

        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    unsubRef.current = unsub;

    return () => {
      unsub();
    };
  }, [userId, topN]);

  return { entries, loading, error, userRank };
}
