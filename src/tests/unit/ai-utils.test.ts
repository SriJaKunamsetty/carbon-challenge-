/**
 * @fileoverview Unit tests for ai-utils.ts.
 * Covers rate limiting, input sanitisation, history sanitisation,
 * callGeminiApi (all three tiers), and the private helpers via
 * integration through callGeminiApi.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  checkRateLimit,
  getRateLimitResetSeconds,
  cleanupRateLimitMap,
  sanitizeInput,
  sanitizeHistory,
  callGeminiApi,
  MAX_INPUT_LENGTH,
  MAX_HISTORY_LENGTH,
} from "@/lib/ai-utils";

// ── checkRateLimit ────────────────────────────────────────────────────────────

describe("checkRateLimit", () => {
  it("allows the first request from a new IP", () => {
    expect(checkRateLimit("192.168.0.1-test-new")).toBe(true);
  });

  it("allows up to 30 requests from the same IP within a window", () => {
    const ip = "10.0.0.1-rate-test";
    for (let i = 0; i < 30; i++) {
      expect(checkRateLimit(ip)).toBe(true);
    }
    // 31st request should be denied
    expect(checkRateLimit(ip)).toBe(false);
  });

  it("resets the window after the time has elapsed", () => {
    vi.useFakeTimers();
    const ip = "10.0.0.2-reset-test";

    // Exhaust the limit
    for (let i = 0; i < 31; i++) checkRateLimit(ip);
    expect(checkRateLimit(ip)).toBe(false);

    // Advance 61 seconds to reset
    vi.advanceTimersByTime(61_000);
    expect(checkRateLimit(ip)).toBe(true);

    vi.useRealTimers();
  });

  it("allows different IPs independently", () => {
    const ip1 = "unique-ip-a-" + Math.random();
    const ip2 = "unique-ip-b-" + Math.random();
    expect(checkRateLimit(ip1)).toBe(true);
    expect(checkRateLimit(ip2)).toBe(true);
  });
});

// ── sanitizeInput ─────────────────────────────────────────────────────────────

describe("sanitizeInput", () => {
  it("returns clean text unchanged", () => {
    expect(sanitizeInput("I drove 20km")).toBe("I drove 20km");
  });

  it("strips control characters", () => {
    const dirty = "hello\x00world\x1Ftest\x07";
    expect(sanitizeInput(dirty)).toBe("helloworldtest");
  });

  it("trims leading and trailing whitespace", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello");
  });

  it("truncates input exceeding MAX_INPUT_LENGTH", () => {
    const long = "a".repeat(MAX_INPUT_LENGTH + 100);
    const result = sanitizeInput(long);
    expect(result.length).toBe(MAX_INPUT_LENGTH);
  });

  it("preserves newlines (\\n and \\r\\n are not control chars in this set)", () => {
    const withNewline = "line one\nline two";
    expect(sanitizeInput(withNewline)).toContain("\n");
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeInput("")).toBe("");
  });
});

// ── sanitizeHistory ───────────────────────────────────────────────────────────

describe("sanitizeHistory", () => {
  it("returns empty array for non-array input", () => {
    expect(sanitizeHistory(null)).toEqual([]);
    expect(sanitizeHistory(undefined)).toEqual([]);
    expect(sanitizeHistory("string")).toEqual([]);
    expect(sanitizeHistory(42)).toEqual([]);
    expect(sanitizeHistory({})).toEqual([]);
  });

  it("maps user and assistant roles correctly", () => {
    const history = [
      { role: "user", content: "hello" },
      { role: "assistant", content: "hi there" },
      { role: "unknown", content: "?" },
    ];
    const result = sanitizeHistory(history);
    expect(result[0].role).toBe("user");
    expect(result[1].role).toBe("assistant");
    expect(result[2].role).toBe("assistant"); // unknown → assistant
  });

  it("sanitizes content to MAX_INPUT_LENGTH", () => {
    const long = "x".repeat(MAX_INPUT_LENGTH + 500);
    const result = sanitizeHistory([{ role: "user", content: long }]);
    expect(result[0].content.length).toBe(MAX_INPUT_LENGTH);
  });

  it("trims history to MAX_HISTORY_LENGTH entries (keeps most recent)", () => {
    const history = Array.from({ length: MAX_HISTORY_LENGTH + 10 }, (_, i) => ({
      role: "user",
      content: `message ${i}`,
    }));
    const result = sanitizeHistory(history);
    expect(result.length).toBe(MAX_HISTORY_LENGTH);
    // Should keep the last MAX_HISTORY_LENGTH entries
    expect(result[0].content).toBe(`message ${10}`);
  });

  it("returns empty string for non-string content", () => {
    const result = sanitizeHistory([{ role: "user", content: 12345 }]);
    expect(result[0].content).toBe("");
  });

  it("handles empty array", () => {
    expect(sanitizeHistory([])).toEqual([]);
  });
});

// ── callGeminiApi ─────────────────────────────────────────────────────────────

describe("callGeminiApi", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GCP_PROJECT_ID;
  });

  const geminiSuccessResponse = (text: string) => ({
    ok: true,
    json: async () => ({
      candidates: [{ content: { parts: [{ text }] } }],
    }),
  });

  const metadataFailResponse = { ok: false };
  const geminiFailResponse = {
    ok: true,
    json: async () => ({ candidates: [] }),
  };

  it("returns null when all tiers fail (no credentials)", async () => {
    delete process.env.GEMINI_API_KEY;
    mockFetch.mockResolvedValue(metadataFailResponse);

    const result = await callGeminiApi("test prompt");
    expect(result).toBeNull();
  });

  it("returns reply from Gemini Developer API (Tier 2)", async () => {
    process.env.GEMINI_API_KEY = "test-api-key";
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("metadata.google.internal")) return metadataFailResponse;
      if (url.includes("generativelanguage.googleapis.com")) {
        return geminiSuccessResponse("Hello from Gemini");
      }
      return metadataFailResponse;
    });

    const result = await callGeminiApi("test prompt");
    expect(result).toBe("Hello from Gemini");
  });

  it("returns reply from Vertex AI (Tier 1) when GCP token and projectId available", async () => {
    process.env.GCP_PROJECT_ID = "test-project";
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("metadata.google.internal")) {
        return { ok: true, json: async () => ({ access_token: "gcp-token" }) };
      }
      if (url.includes("aiplatform.googleapis.com")) {
        return geminiSuccessResponse("Hello from Vertex");
      }
      return metadataFailResponse;
    });

    const result = await callGeminiApi("test prompt");
    expect(result).toBe("Hello from Vertex");
  });

  it("falls back to Gemini Developer API when Vertex AI fails", async () => {
    process.env.GCP_PROJECT_ID = "test-project";
    process.env.GEMINI_API_KEY = "test-api-key";
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("metadata.google.internal")) {
        return { ok: true, json: async () => ({ access_token: "gcp-token" }) };
      }
      if (url.includes("aiplatform.googleapis.com")) {
        return geminiFailResponse; // Vertex returns no candidates
      }
      if (url.includes("generativelanguage.googleapis.com")) {
        return geminiSuccessResponse("Gemini fallback response");
      }
      return metadataFailResponse;
    });

    const result = await callGeminiApi("test prompt");
    expect(result).toBe("Gemini fallback response");
  });

  it("skips Vertex AI when GCP_PROJECT_ID is not set", async () => {
    delete process.env.GCP_PROJECT_ID;
    process.env.GEMINI_API_KEY = "test-api-key";
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("metadata.google.internal")) {
        // Even if token is available, projectId check should prevent Vertex call
        return { ok: true, json: async () => ({ access_token: "gcp-token" }) };
      }
      if (url.includes("generativelanguage.googleapis.com")) {
        return geminiSuccessResponse("Direct Gemini");
      }
      return metadataFailResponse;
    });

    const result = await callGeminiApi("test prompt");
    expect(result).toBe("Direct Gemini");
  });

  it("sends JSON mode header when jsonMode=true", async () => {
    process.env.GEMINI_API_KEY = "test-api-key";
    let capturedBody = "";
    mockFetch.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.includes("metadata.google.internal")) return metadataFailResponse;
      if (url.includes("generativelanguage.googleapis.com")) {
        capturedBody = init?.body as string;
        return geminiSuccessResponse("{}");
      }
      return metadataFailResponse;
    });

    await callGeminiApi("test", { jsonMode: true });
    const body = JSON.parse(capturedBody);
    expect(body.generationConfig?.responseMimeType).toBe("application/json");
  });

  it("does not include generationConfig when jsonMode=false", async () => {
    process.env.GEMINI_API_KEY = "test-api-key";
    let capturedBody = "";
    mockFetch.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.includes("metadata.google.internal")) return metadataFailResponse;
      if (url.includes("generativelanguage.googleapis.com")) {
        capturedBody = init?.body as string;
        return geminiSuccessResponse("ok");
      }
      return metadataFailResponse;
    });

    await callGeminiApi("test", { jsonMode: false });
    const body = JSON.parse(capturedBody);
    expect(body.generationConfig).toBeUndefined();
  });

  it("returns null when Gemini API throws a network error", async () => {
    process.env.GEMINI_API_KEY = "test-api-key";
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("metadata.google.internal")) return metadataFailResponse;
      throw new Error("Network error");
    });

    const result = await callGeminiApi("test prompt");
    expect(result).toBeNull();
  });

  it("returns null when response has no candidates", async () => {
    process.env.GEMINI_API_KEY = "test-api-key";
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("metadata.google.internal")) return metadataFailResponse;
      return { ok: true, json: async () => ({ candidates: [] }) };
    });

    const result = await callGeminiApi("test");
    expect(result).toBeNull();
  });
});

// ── getRateLimitResetSeconds ──────────────────────────────────────────────────

describe("getRateLimitResetSeconds", () => {
  it("returns a positive number for an IP that has a rate limit entry", () => {
    vi.useFakeTimers();
    const ip = `reset-secs-${Math.random()}`;
    checkRateLimit(ip); // create entry
    const secs = getRateLimitResetSeconds(ip);
    expect(secs).toBeGreaterThan(0);
    expect(secs).toBeLessThanOrEqual(60);
    vi.useRealTimers();
  });

  it("returns the full window duration for an unknown IP", () => {
    const ip = `unknown-ip-${Math.random()}`;
    const secs = getRateLimitResetSeconds(ip);
    expect(secs).toBe(60); // RATE_LIMIT_WINDOW_MS / 1000
  });

  it("decreases as time passes", () => {
    vi.useFakeTimers();
    const ip = `decreasing-${Math.random()}`;
    checkRateLimit(ip);
    const before = getRateLimitResetSeconds(ip);
    vi.advanceTimersByTime(10_000); // advance 10 seconds
    const after = getRateLimitResetSeconds(ip);
    expect(after).toBeLessThan(before);
    vi.useRealTimers();
  });
});

// ── cleanupRateLimitMap ───────────────────────────────────────────────────────

describe("cleanupRateLimitMap", () => {
  it("removes expired entries without affecting active ones", () => {
    vi.useFakeTimers();
    const expiredIp = `expired-${Math.random()}`;
    const activeIp = `active-${Math.random()}`;

    // Create both entries
    checkRateLimit(expiredIp);
    checkRateLimit(activeIp);

    // Advance past the window so expiredIp entry expires
    vi.advanceTimersByTime(65_000);

    // Renew the active IP entry by creating a new one
    checkRateLimit(activeIp); // This creates a new window entry

    cleanupRateLimitMap();

    // expiredIp was cleaned; new checkRateLimit for it should count from 1
    const firstAfterCleanup = checkRateLimit(expiredIp);
    expect(firstAfterCleanup).toBe(true); // count reset → allowed

    vi.useRealTimers();
  });

  it("handles an empty map without errors", () => {
    expect(() => cleanupRateLimitMap()).not.toThrow();
  });
});
