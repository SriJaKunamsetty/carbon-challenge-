/**
 * Manual mock for firebase/auth.
 * Prevents Firebase auth from initializing in Node.js/JSDOM test environments
 * which would fail with auth/operation-not-supported-in-this-environment.
 */
import { vi } from 'vitest';

export const getAuth = vi.fn(() => ({}));
export const onAuthStateChanged = vi.fn((_auth: unknown, callback: (user: null) => void) => {
  callback(null);
  return vi.fn();
});
export const signInWithPopup = vi.fn();
export const signInWithEmailAndPassword = vi.fn();
export const createUserWithEmailAndPassword = vi.fn();
export const signOut = vi.fn();
export const sendPasswordResetEmail = vi.fn();
export const GoogleAuthProvider = vi.fn().mockImplementation(() => ({}));
export const EmailAuthProvider = { credential: vi.fn() };
export const updateProfile = vi.fn();
export const browserLocalPersistence = {};
export const setPersistence = vi.fn();
export const connectAuthEmulator = vi.fn();
export const signInWithCredential = vi.fn();
export const linkWithCredential = vi.fn();
export const reauthenticateWithCredential = vi.fn();
export const deleteUser = vi.fn();
export const sendEmailVerification = vi.fn();
export const applyActionCode = vi.fn();
export const verifyPasswordResetCode = vi.fn();
export const confirmPasswordReset = vi.fn();
export const fetchSignInMethodsForEmail = vi.fn();
export const isSignInWithEmailLink = vi.fn(() => false);
export const signInWithEmailLink = vi.fn();

const firebaseAuth = { getAuth, onAuthStateChanged, signInWithPopup };
export default firebaseAuth;
