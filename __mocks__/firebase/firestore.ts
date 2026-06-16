/**
 * Manual mock for firebase/firestore.
 * Prevents Firebase Firestore from initializing in Node.js/JSDOM test environments.
 */
import { vi } from 'vitest';

export const getFirestore = vi.fn(() => ({}));
export const doc = vi.fn(() => ({}));
export const getDoc = vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) }));
export const getDocs = vi.fn(() => Promise.resolve({ docs: [], empty: true, size: 0 }));
export const setDoc = vi.fn(() => Promise.resolve());
export const addDoc = vi.fn(() => Promise.resolve({ id: 'mock-doc-id' }));
export const updateDoc = vi.fn(() => Promise.resolve());
export const deleteDoc = vi.fn(() => Promise.resolve());
export const onSnapshot = vi.fn((_ref: unknown, cb: (snap: unknown) => void) => {
  cb({ exists: () => false, docs: [], data: () => ({}) });
  return vi.fn();
});
export const collection = vi.fn(() => ({}));
export const query = vi.fn(() => ({}));
export const where = vi.fn();
export const orderBy = vi.fn();
export const limit = vi.fn();
export const startAfter = vi.fn();
export const serverTimestamp = vi.fn(() => new Date());
export class Timestamp {
  constructor(public seconds: number, public nanoseconds: number) {}
  toDate() {
    return new Date(this.seconds * 1000);
  }
  static fromDate(d: Date) {
    return new Timestamp(Math.floor(d.getTime() / 1000), 0);
  }
  static now() {
    return new Timestamp(Math.floor(Date.now() / 1000), 0);
  }
}
export const enableIndexedDbPersistence = vi.fn(() => Promise.resolve());
export const connectFirestoreEmulator = vi.fn();
export const writeBatch = vi.fn(() => ({
  set: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  commit: vi.fn(() => Promise.resolve()),
}));
export const runTransaction = vi.fn();
export const GeoPoint = vi.fn().mockImplementation((lat: number, lng: number) => ({ latitude: lat, longitude: lng }));
export const FieldValue = {
  serverTimestamp: vi.fn(() => new Date()),
  delete: vi.fn(() => 'DELETE'),
  increment: vi.fn((n: number) => ({ n })),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn(),
};
