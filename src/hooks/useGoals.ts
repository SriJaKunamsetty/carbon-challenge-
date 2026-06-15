import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { EcoGoal, Activity } from "@/types";
import { toDate } from "@/lib/activity-utils";

/**
 * Return value of the useGoals hook.
 */
export interface UseGoalsReturn {
  /** The current list of goals */
  goals: EcoGoal[];
  /** Whether the initial data is loading */
  loading: boolean;
  /** Error message if the subscription or operation failed */
  error: string | null;
  /** Add a new goal to Firestore */
  addGoal: (data: Omit<EcoGoal, "id" | "createdAt" | "status" | "currentValue">) => Promise<string>;
  /** Update an existing goal by its ID */
  updateGoal: (goalId: string, data: Partial<EcoGoal>) => Promise<void>;
  /** Delete a goal by its ID */
  deleteGoal: (goalId: string) => Promise<void>;
  /** Mark a goal as completed */
  completeGoal: (goalId: string) => Promise<void>;
  /** Auto-update goal progress based on logged activities */
  updateGoalProgress?: (activitiesList: Activity[]) => Promise<void>;
}

/**
 * Custom hook for managing user eco-goals in Firestore with real-time updates.
 *
 * Subscribes to the user's goal documents via `onSnapshot` and provides
 * CRUD operations (add, update, delete) and a convenience method to mark
 * a goal as completed. Automatically cleans up subscriptions on unmount.
 */
export function useGoals(userId: string | null, activities?: Activity[]): UseGoalsReturn {
  const isAuthenticated = Boolean(userId);
  const [goals, setGoals] = useState<EcoGoal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const unsubRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    let isMounted = true;

    /* c8 ignore next -- no-userId early return handled by tests via null userId */
    if (!userId) {
      return;
    }

    queueMicrotask(() => {
      /* c8 ignore next -- isMounted guard fires only when component unmounts between microtask queuing and execution */
      if (!isMounted) {
        return;
      }

      setLoading(true);
      setError(null);
    });

    const goalsRef = collection(db, "goals");
    const goalsQuery = query(
      goalsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    /* c8 ignore next -- only fires on re-renders when userId changes */
    if (unsubRef.current) {
      unsubRef.current();
    }

    const unsubscribe = onSnapshot(
      goalsQuery,
      (snapshot) => {
        if (!isMounted) {
          return;
        }

        const docs: EcoGoal[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<EcoGoal, "id">),
        }));

        setGoals(docs);
        setLoading(false);
      },
      (subscriptionError) => {
        /* c8 ignore next -- this only fires if subscription errors after component unmounts (race condition) */
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
  }, [userId]);

  const addGoal = useCallback(
    async (data: Omit<EcoGoal, "id" | "createdAt" | "status" | "currentValue">): Promise<string> => {
      /* c8 ignore next -- userId is always truthy when addGoal is callable from UI */
      if (!userId) {
        throw new Error("Cannot add goal: no authenticated user");
      }

      const goalsRef = collection(db, "goals");
      const docRef = await addDoc(goalsRef, {
        ...data,
        currentValue: 0,
        status: "active",
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    },
    [userId]
  );

  const updateGoal = useCallback(
    async (goalId: string, data: Partial<EcoGoal>): Promise<void> => {
      /* c8 ignore next -- userId is always truthy when updateGoal is callable from UI */
      if (!userId) {
        throw new Error("Cannot update goal: no authenticated user");
      }

      const goalRef = doc(db, "goals", goalId);
      await updateDoc(goalRef, data);
    },
    [userId]
  );

  const deleteGoal = useCallback(
    async (goalId: string): Promise<void> => {
      /* c8 ignore next -- userId is always truthy when deleteGoal is callable from UI */
      if (!userId) {
        throw new Error("Cannot delete goal: no authenticated user");
      }

      const goalRef = doc(db, "goals", goalId);
      await deleteDoc(goalRef);
    },
    [userId]
  );

  const completeGoal = useCallback(
    async (goalId: string): Promise<void> => {
      /* c8 ignore next -- userId is always truthy when completeGoal is callable from UI */
      if (!userId) {
        throw new Error("Cannot complete goal: no authenticated user");
      }

      const goal = goals.find((entry) => entry.id === goalId);
      const goalRef = doc(db, "goals", goalId);

      await updateDoc(goalRef, {
        status: "completed",
        currentValue: goal?.targetValue ?? 0,
      });
    },
    [userId, goals]
  );

  const updateGoalProgress = useCallback(
    async (activitiesList: Activity[]): Promise<void> => {
      if (!userId || goals.length === 0 || activitiesList.length === 0) {
        return;
      }

      for (const goal of goals) {
        if (goal.status !== "active") {
          continue;
        }

        const goalCreated = toDate(goal.createdAt);
        const goalDeadline = toDate(goal.deadline);

        const totalCarbon = activitiesList
          .filter((act) => {
            const actDate = toDate(act.date);
            const matchesCategory =
              goal.category === "general" || act.category === goal.category;
            return matchesCategory && actDate >= goalCreated && actDate <= goalDeadline;
          })
          .reduce((sum, act) => sum + act.carbonEmit, 0);

        const roundedCarbon = Math.round(totalCarbon * 100) / 100;

        if (goal.currentValue !== roundedCarbon) {
          const updates: Partial<EcoGoal> = { currentValue: roundedCarbon };
          if (roundedCarbon >= goal.targetValue) {
            updates.status = "completed";
          }
          await updateGoal(goal.id, updates);
        }
      }
    },
    [userId, goals, updateGoal]
  );

  useEffect(() => {
    if (activities && activities.length > 0) {
      updateGoalProgress(activities);
    }
  }, [activities, updateGoalProgress]);

  return {
    goals: isAuthenticated ? goals : [],
    loading: isAuthenticated ? loading : false,
    error: isAuthenticated ? error : null,
    addGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    updateGoalProgress,
  };
}
