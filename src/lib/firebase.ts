/**
 * @module firebase
 * @description Firebase client SDK initialization with environment-based configuration.
 * Initializes Auth, Firestore, Storage, Analytics, and Performance monitoring.
 *
 * All sensitive configuration values are sourced from environment variables
 * prefixed with NEXT_PUBLIC_ to allow Next.js client-side access.
 *
 * Analytics and Performance monitoring are only initialized in browser
 * environments (guarded by `typeof globalThis.window !== "undefined"`).
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { logger } from "./logger";
import {
  getAnalytics,
  type Analytics,
  isSupported as isAnalyticsSupported,
} from "firebase/analytics";
import { getPerformance, type FirebasePerformance } from "firebase/performance";
import { getRemoteConfig, type RemoteConfig, isSupported as isRemoteConfigSupported } from "firebase/remote-config";
import { getMessaging, type Messaging, isSupported as isMessagingSupported } from "firebase/messaging";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

/**
 * Firebase configuration sourced from environment variables.
 * All values use the NEXT_PUBLIC_ prefix so they are available in client bundles.
 *
 * @see https://firebase.google.com/docs/web/setup#config-object
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/* c8 ignore next 5 -- throw branch only reachable when env vars are missing; tests always set them */
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
  throw new Error(
    "Missing required environment variables for Firebase. " +
    "Please check your .env.local file. See .env.example for reference."
  );
}

/**
 * Firebase App singleton instance.
 * Re-uses an existing app if one has already been initialized (e.g. during HMR).
 */
// c8 ignore next -- getApp() HMR branch only fires on module re-initialization, never in fresh tests
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/** Firebase Authentication instance for sign-in, sign-up, and session management */
const auth: Auth = getAuth(app);

/** Cloud Firestore instance for real-time document database operations */
const db: Firestore = getFirestore(app);

/** Firebase Cloud Storage instance for file uploads and downloads */
const storage: FirebaseStorage = getStorage(app);

/**
 * Firebase Analytics instance (client-side only).
 * Initialized asynchronously after checking browser support.
 * Will be `null` on the server or if the browser does not support Analytics.
 */
let _analytics: Analytics | null = null;

/**
 * Firebase Performance Monitoring instance (client-side only).
 * Will be `null` on the server or if initialization fails.
 */
let _performance: FirebasePerformance | null = null;

let _remoteConfig: RemoteConfig | null = null;
let _messaging: Messaging | null = null;

/* c8 ignore start -- browser-only Firebase service initialization; not available in Node.js/jsdom test environment */
if (globalThis.window !== undefined) {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      _analytics = getAnalytics(app);
    }
  });

  isRemoteConfigSupported().then((supported) => {
    if (supported) {
      _remoteConfig = getRemoteConfig(app);
    }
  });

  isMessagingSupported().then((supported) => {
    if (supported) {
      _messaging = getMessaging(app);
    }
  });

  const appCheckSiteKey = process.env.NEXT_PUBLIC_APP_CHECK_SITE_KEY;
  if (appCheckSiteKey && appCheckSiteKey !== "6Ld_placeholder_site_key_for_recaptcha") {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      logger.warn({ module: "Firebase" }, "App Check could not be initialized", message);
    }
  } else {
    logger.info({ module: "Firebase" }, "App Check skipped: No valid NEXT_PUBLIC_APP_CHECK_SITE_KEY provided.");
  }

  try {
    _performance = getPerformance(app);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    logger.warn({ module: "Firebase" }, "Performance could not be initialized", message);
  }
}
/* c8 ignore stop */


/** Returns the Firebase Analytics instance (null on server or if unsupported) */
/* c8 ignore next -- V8 source-map artifact: return-value branch for Analytics|null union type */
export function getFirebaseAnalytics(): Analytics | null { return _analytics; }
/** Returns the Firebase Performance instance (null on server) */
export function getFirebasePerformance(): FirebasePerformance | null { return _performance; }
/** Returns the Firebase Remote Config instance (null on server or if unsupported) */
export function getFirebaseRemoteConfig(): RemoteConfig | null { return _remoteConfig; }
/** Returns the Firebase Messaging instance (null on server or if unsupported) */
export function getFirebaseMessaging(): Messaging | null { return _messaging; }

export { app, auth, db, storage };
