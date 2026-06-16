import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  collection,
  query,
  limit,
  startAfter,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  type DocumentData,
  type DocumentSnapshot,
  type QuerySnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { buildActivityConstraints, type ActivityFilter } from "@/services";
import type { Activity } from "@/types";
import { calculateStreak } from "@/lib/activity-utils";

export { calculateStreak };

/**
 * Options for the useActivities hook.
 */
export interface UseActivitiesOptions {
  /** The authenticated user's UID */
  userId: string | null;
  /** Optional filters to apply to the activity query */
  filter?: ActivityFilter;
  /** Number of activities to fetch per page (default: 20) */
  pageSize?: number;
}

/**
 * Return value of the useActivities hook.
 */
export interface UseActivitiesReturn {
  /** The current list of activities */
  activities: Activity[];
  /** Whether the initial data is loading */
  loading: boolean;
  /** Error message if the subscription or operation failed */
  error: string | null;
  /** Add a new activity to Firestore */
  addActivity: (data: Omit<Activity, "id">) => Promise<string>;
  /** Delete an activity by its ID */
  deleteActivity: (activityId: string) => Promise<void>;
  /** Manually refresh the subscription */
  refresh: () => void;
  /** Whether more activities are available beyond the current page */
  hasMore: boolean;
  /** Load the next page of activities */
  loadMore: () => Promise<void>;
  /** The calculated daily logging streak */
  streak: number;
}

function mapActivitySnapshot(snapshot: QuerySnapshot<DocumentData>): Activity[] {
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Activity, "id">),
  }));
}

/**
 * Custom hook that subscribes to a user's activities from Firestore in real-time.
 *
 * Provides filtering by date range and category, cursor-based pagination,
 * and CRUD operations. Automatically cleans up Firestore subscriptions on
 * unmount or when dependencies change.
 */
export function useActivities(options: UseActivitiesOptions): UseActivitiesReturn {
  const { userId, filter, pageSize = 20 } = options;
  const isAuthenticated = Boolean(userId);
  const filterCategory = filter?.category ?? null;
  const filterStartTime = filter?.startDate?.getTime() ?? null;
  const filterEndTime = filter?.endDate?.getTime() ?? null;
  const stableFilter = useMemo<ActivityFilter | undefined>(() => {
    if (!filterCategory && filterStartTime === null && filterEndTime === null) {
      return undefined;
    }

    return {
      ...(filterCategory ? { category: filterCategory } : {}),
      ...(filterStartTime !== null ? { startDate: new Date(filterStartTime) } : {}),
      ...(filterEndTime !== null ? { endDate: new Date(filterEndTime) } : {}),
    };
  }, [filterCategory, filterStartTime, filterEndTime]);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const unsubRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!userId) {
      return;
    }

    queueMicrotask(() => {
      if (!isMounted) {
        return;
      }

      setLoading(true);
      setError(null);
    });

    const activitiesRef = collection(db, "activities");
    const constraints = [...buildActivityConstraints(userId, stableFilter), limit(pageSize + 1)];
    const activitiesQuery = query(activitiesRef, ...constraints);

    if (unsubRef.current) {
      unsubRef.current();
    }

    const unsubscribe = onSnapshot(
      activitiesQuery,
      (snapshot) => {
        if (!isMounted) {
          return;
        }

        const docs = mapActivitySnapshot(snapshot);
        if (docs.length > pageSize) {
          setHasMore(true);
          setLastDoc(snapshot.docs[pageSize - 1] ?? null);
          setActivities(docs.slice(0, pageSize));
        } else {
          setHasMore(false);
          setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null);
          setActivities(docs);
        }

        setLoading(false);
      },
      (subscriptionError) => {
        if (!isMounted) {
          return;
        }

        setError(subscriptionError.message);
        setLoading(false);
      }
    );

    unsubRef.current = unsubscribe;

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [userId, stableFilter, pageSize, refreshKey]);

  const loadMore = useCallback(async () => {
    if (!userId || !lastDoc || !hasMore) {
      return;
    }

    const activitiesRef = collection(db, "activities");
    const constraints = [
      ...buildActivityConstraints(userId, stableFilter),
      startAfter(lastDoc),
      limit(pageSize + 1),
    ];

    const activitiesQuery = query(activitiesRef, ...constraints);
    const snapshot = await getDocs(activitiesQuery);
    const newDocs = mapActivitySnapshot(snapshot);

    if (newDocs.length > pageSize) {
      setHasMore(true);
      setLastDoc(snapshot.docs[pageSize - 1] ?? null);
      setActivities((prev) => [...prev, ...newDocs.slice(0, pageSize)]);
      return;
    }

    setHasMore(false);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null);
    setActivities((prev) => [...prev, ...newDocs]);
  }, [userId, lastDoc, hasMore, stableFilter, pageSize]);

  const addActivity = useCallback(
    async (data: Omit<Activity, "id">): Promise<string> => {
      if (!userId) {
        throw new Error("Cannot add activity: no authenticated user");
      }

      const activitiesRef = collection(db, "activities");
      const docRef = await addDoc(activitiesRef, {
        ...data,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    },
    [userId]
  );

  const deleteActivity = useCallback(
    async (activityId: string): Promise<void> => {
      if (!userId) {
        throw new Error("Cannot delete activity: no authenticated user");
      }

      const activityRef = doc(db, "activities", activityId);
      await deleteDoc(activityRef);
    },
    [userId]
  );

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  const streak = useMemo(() => calculateStreak(activities), [activities]);

  return {
    activities: isAuthenticated ? activities : [],
    loading: isAuthenticated ? loading : false,
    error: isAuthenticated ? error : null,
    addActivity,
    deleteActivity,
    refresh,
    hasMore: isAuthenticated ? hasMore : false,
    loadMore,
    streak,
  };
}
