/**
 * @module TestSetup
 * @description Global test setup for Vitest.
 * Configures testing-library matchers, mock providers, and Firebase mocks.
 * Note: tailwind-merge is aliased in vitest.config.ts to avoid JSDOM crashes.
 */
import "@testing-library/jest-dom";
import { expect, vi } from 'vitest';
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock matchMedia for JSDOM
if (typeof window !== "undefined") {
  window.matchMedia = window.matchMedia || vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// Mock Firebase - provides a stable mock for all tests that use @/lib/firebase.
vi.mock("@/lib/firebase", () => ({
  app: {},
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn((callback: (user: null) => void) => {
      callback(null);
      return vi.fn();
    }),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
  },
  db: {},
  storage: {},
  analytics: null,
  performance: null,
  remoteConfig: null,
  messaging: null,
  getFirebaseAnalytics: () => null,
  getFirebasePerformance: () => null,
  getFirebaseRemoteConfig: () => null,
  getFirebaseMessaging: () => null,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: vi.fn(() => "/"),
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

// Mock firebase/analytics globally
vi.mock("firebase/analytics", () => ({
  getAnalytics: vi.fn(() => ({})),
  logEvent: vi.fn(),
  setUserProperties: vi.fn(),
  isSupported: vi.fn(() => Promise.resolve(false)),
}));

// Mock firebase/storage globally  
vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(() => Promise.resolve('')),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => {
    const imgProps: Record<string, unknown> = { src, alt };
    if (props.width) imgProps.width = props.width;
    if (props.height) imgProps.height = props.height;
    if (props.className) imgProps.className = props.className;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt || ""} {...imgProps} />;
  },
}));

// Mock framer-motion with static mocks (no vi.importActual to avoid loading issues)
vi.mock("framer-motion", () => ({
  motion: {
    div: "div",
    span: "span",
    button: "button",
    circle: "circle",
    path: "path",
    p: "p",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    section: "section",
    article: "article",
    li: "li",
    ul: "ul",
    a: "a",
    nav: "nav",
    form: "form",
    input: "input",
    img: "img",
    svg: "svg",
    rect: "rect",
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useReducedMotion: () => false,
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
  useInView: () => true,
  useMotionValue: (initial: number) => ({ get: () => initial, set: vi.fn() }),
  useSpring: (value: number) => ({ get: () => value }),
  useTransform: (value: unknown) => value,
  useDragControls: () => ({ start: vi.fn() }),
  useScroll: () => ({ scrollY: { get: () => 0 }, scrollYProgress: { get: () => 0 } }),
  m: {
    div: "div",
    span: "span",
    button: "button",
  },
}));

// Suppress console.error for expected test failures
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const message = typeof args[0] === "string" ? args[0] : "";
    if (
      message.includes("Not implemented") ||
      message.includes("Warning: ReactDOM.render") ||
      message.includes("Warning: An update to") ||
      message.includes("act(")
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});
