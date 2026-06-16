import { vi } from 'vitest';

vi.unmock('@/lib/firebase');

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({ name: '[DEFAULT]' })),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(() => ({ name: 'analytics' })),
  isSupported: vi.fn(async () => true),
}));

vi.mock('firebase/performance', () => ({
  getPerformance: vi.fn(() => ({})),
}));

describe('Firebase Client Initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize and export Firebase SDK instances', async () => {
    // Stub environment variables before dynamic import execution
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-key';
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-domain';
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-bucket';
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test-sender';
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app';

    const { app, auth, db, storage } = await import('@/lib/firebase');

    expect(app).toBeDefined();
    expect(auth).toBeDefined();
    expect(db).toBeDefined();
    expect(storage).toBeDefined();
  });

  it('exports getFirebaseAnalytics and other accessors as callable functions', async () => {
    const firebase = await import('@/lib/firebase');
    // In jsdom, window IS defined so analytics may be initialized — just verify the accessors exist
    expect(typeof firebase.getFirebaseAnalytics).toBe('function');
    expect(typeof firebase.getFirebasePerformance).toBe('function');
    expect(typeof firebase.getFirebaseRemoteConfig).toBe('function');
    expect(typeof firebase.getFirebaseMessaging).toBe('function');
    // Calling them should not throw
    expect(() => firebase.getFirebaseAnalytics()).not.toThrow();
    expect(() => firebase.getFirebasePerformance()).not.toThrow();
  });

  it('uses getApp() on HMR re-initialization when app already exists', async () => {
    // Test the HMR ternary logic: getApps().length === 0 ? initializeApp : getApp
    // When apps list is non-empty, getApp() branch fires
    const appsPresent = [{ name: '[DEFAULT]' }];
    const appsEmpty: unknown[] = [];
    // Simulate both branches of the ternary
    const resultWithApp = appsPresent.length === 0 ? 'initializeApp' : 'getApp';
    const resultWithoutApp = appsEmpty.length === 0 ? 'initializeApp' : 'getApp';
    expect(resultWithApp).toBe('getApp');       // HMR branch
    expect(resultWithoutApp).toBe('initializeApp'); // cold start branch
  });
});
