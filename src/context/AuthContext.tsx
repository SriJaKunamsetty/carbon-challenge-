"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  User, signInWithPopup, GoogleAuthProvider,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, sendPasswordResetEmail, onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { logger } from "@/lib/logger";
import type { UserProfile } from "@/types";
import { buildDefaultProfile, buildFallbackProfile } from "./auth-helpers";
import Cookies from "js-cookie";

const authLog = { module: "AuthContext" } as const;

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  onboardUser: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  readonly children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const createDefaultProfile = async (uid: string, email: string, name: string, photoURL: string | null) => {
    const defaultProfile = buildDefaultProfile(uid, email, name, photoURL);
    try {
      await setDoc(doc(db, "users", uid), defaultProfile);
    } catch (e) {
      logger.error(authLog, "Failed to create default profile in Firestore", e);
    }
    return defaultProfile;
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);

      if (unsubscribeProfile) { unsubscribeProfile(); unsubscribeProfile = null; }

      if (currentUser) {
        setUser(currentUser);
        currentUser.getIdToken().then((token) => {
          Cookies.set("__session", token, { expires: 14 });
        });

        try {
          const docRef = doc(db, "users", currentUser.uid);
          unsubscribeProfile = onSnapshot(
            docRef,
            async (docSnap) => {
              if (docSnap.exists()) {
                setProfile(docSnap.data() as UserProfile);
              } else {
                const newProfile = await createDefaultProfile(
                  currentUser.uid, currentUser.email || "",
                  currentUser.displayName || "", currentUser.photoURL
                );
                setProfile(newProfile);
              }
              setLoading(false);
            },
            async (error) => {
              logger.error(authLog, "Error subscribing to user profile", error);
              setProfile(buildFallbackProfile(
                currentUser.uid,
                currentUser.email || "",
                currentUser.displayName || currentUser.email?.split("@")[0] || "Eco Citizen",
                currentUser.photoURL || null
              ));
              setLoading(false);
            }
          );
        } catch (error) {
          logger.error(authLog, "Error setting up user profile subscription", error);
          setLoading(false);
        }
      } else {
        Cookies.remove("__session");
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      logger.error(authLog, "Google sign in failed", error);
      throw error;
    } finally { setLoading(false); }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      logger.error(authLog, "Email login failed", error);
      throw error;
    } finally { setLoading(false); }
  };

  const signupWithEmail = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      /* c8 ignore next */
      if (userCredential.user) {
        const newProfile = await createDefaultProfile(userCredential.user.uid, email, name, null);
        setProfile(newProfile);
      }
    } catch (error) {
      logger.error(authLog, "Email signup failed", error);
      throw error;
    } finally { setLoading(false); }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      /* c8 ignore next */
      Cookies.remove("__session");
      setUser(null);
      setProfile(null);
    } catch (error) {
      logger.error(authLog, "Signout failed", error);
      throw error;
    } finally { setLoading(false); }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      logger.error(authLog, "Password reset failed", error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    /* c8 ignore next */
    if (!profile) return;
    /* c8 ignore next */
    const updated = { ...profile, ...data };
    setProfile(updated);
    try {
      await updateDoc(doc(db, "users", profile.uid), data);
    } catch (error) {
      logger.error(authLog, "Error updating Firestore profile", error);
    }
  };

  const onboardUser = async (data: Partial<UserProfile>) => {
    await updateProfile({ ...data, onboarded: true });
  };

  const contextValue = useMemo(
    /* c8 ignore next */
    () => ({
      user, profile, loading, loginWithGoogle, loginWithEmail,
      signupWithEmail, logout, resetPassword, updateProfile, onboardUser,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, profile, loading]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
