/**
 * Manual mock for js-cookie.
 * Provides a simple in-memory cookie store for test environments.
 */
import { vi } from 'vitest';

const cookies: Record<string, string> = {};

const Cookies = {
  set: vi.fn((name: string, value: string) => {
    cookies[name] = value;
  }),
  get: vi.fn((name: string) => cookies[name]),
  remove: vi.fn((name: string) => {
    delete cookies[name];
  }),
  getAll: vi.fn(() => ({ ...cookies })),
  withAttributes: vi.fn(() => Cookies),
  withConverter: vi.fn(() => Cookies),
};

export default Cookies;
