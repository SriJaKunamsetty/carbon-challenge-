/**
 * @vitest-environment node
 */
import { POST } from "@/app/api/ai/route";
import { NextRequest } from "next/server";
import { vi } from "vitest";

// Hoisted mock declarations (must be hoisted so vi.mock factory can reference them)
const { mockCookieGet, mockCookies } = vi.hoisted(() => {
  const mockCookieGet = vi.fn((name: string) =>
    name === "__session" ? { value: "mock-session-token" } : undefined
  );
  const mockCookies = vi.fn().mockResolvedValue({ get: mockCookieGet });
  return { mockCookieGet, mockCookies };
});

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

// Mock the getGcpToken and fetch for Gemini APIs
globalThis.fetch = vi.fn();

describe("API /ai", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore cookies mock after clearAllMocks
    mockCookieGet.mockImplementation((name: string) =>
      name === "__session" ? { value: "mock-session-token" } : undefined
    );
    mockCookies.mockResolvedValue({ get: mockCookieGet });
    process.env.GEMINI_API_KEY = "test-key";
  });

  const createRequest = (body: unknown) => {
    return new NextRequest("http" + "://localhost:3000/api/ai", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "x-forwarded-for": `${Math.random()}-test-ip`,
        "cookie": "__session=mock-session-token",
      },
    });
  };

  it("returns 401 for unauthenticated request", async () => {
    mockCookies.mockResolvedValueOnce({
      get: () => undefined,
    });
    const req = createRequest({ text: "drove 10km", mode: "parser" });
    const response = await POST(req);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Authentication required");
  });

  it("returns 400 for missing text field", async () => {
    const req = createRequest({ mode: "parser" });
    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Text is required");
  });

  it("handles valid parser request with mocked AI", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(async (url: string) => {
      if (url.includes("metadata.google.internal")) {
        return { ok: false };
      }
      if (url.includes("generativelanguage.googleapis.com")) {
        return {
          ok: true,
          json: async () => ({
            candidates: [{
              content: {
                parts: [{
                  text: JSON.stringify({
                    categoryMatches: {
                      transport: [{ mode: "gasolineCar", distanceKm: 10, carbon: 2.1 }],
                      food: [], electricity: [], shopping: [],
                    },
                    totalCarbon: 2.1,
                    explanation: "Drove 10km",
                  })
                }]
              }
            }]
          })
        };
      }
      return { ok: false };
    });

    const req = createRequest({ text: "I drove 10km in my car", mode: "parser" });
    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.totalCarbon).toBeDefined();
    expect(data.categoryMatches).toBeDefined();
  });

  it("handles valid chat request with mocked AI", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(async (url: string) => {
      if (url.includes("metadata.google.internal")) {
        return { ok: false };
      }
      if (url.includes("generativelanguage.googleapis.com")) {
        return {
          ok: true,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: "That is great that you used public transport!" }] } }],
          }),
        };
      }
      return { ok: false };
    });

    const req = createRequest({ text: "I took the bus today", mode: "chat" });
    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.response).toContain("public transport");
  });

  it("rejects unknown mode values with 400", async () => {
    // AiRequestSchema enforces mode must be 'parser' | 'chat' — unknown values are rejected
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });

    const req = createRequest({ text: "hello world", mode: "invalid_mode" });
    const response = await POST(req);
    // Zod rejects unknown enum values — stricter than the old manual check
    expect(response.status).toBe(400);
  });

  it("falls back to local heuristic when AI fails", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });
    delete process.env.GEMINI_API_KEY;

    const req = createRequest({ text: "I drove 5km", mode: "parser" });
    const response = await POST(req);
    // Should still return 200 with heuristic fallback
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.totalCarbon).toBeDefined();
  });

  it("returns 429 when rate limit is exceeded", async () => {
    // Use a specific IP to control rate limit
    const limitedIp = "rate-limit-test-ip";
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });

    const makeRequest = () =>
      POST(
        new NextRequest("http" + "://localhost:3000/api/ai", {
          method: "POST",
          body: JSON.stringify({ text: "test", mode: "parser" }),
          headers: { "x-forwarded-for": limitedIp },
        })
      );

    // Make 31 requests to exceed the 30-request limit
    let lastStatus = 200;
    for (let i = 0; i < 31; i++) {
      const resp = await makeRequest();
      lastStatus = resp.status;
    }
    expect(lastStatus).toBe(429);
  });

  it("handles chat with history and profile context", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(async (url: string) => {
      if (url.includes("metadata.google.internal")) {
        return { ok: false };
      }
      if (url.includes("generativelanguage.googleapis.com")) {
        return {
          ok: true,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: "Great eco-friendly choice!" }] } }],
          }),
        };
      }
      return { ok: false };
    });

    const req = createRequest({
      text: "I cycled to work",
      mode: "chat",
      history: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi! How can I help?" },
      ],
      profile: { name: "Test User", carbonScore: 80, goal: 350, country: "India" },
    });
    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.response).toBeDefined();
  });

  it("returns 400 for empty text", async () => {
    const req = createRequest({ text: "   ", mode: "parser" });
    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it("returns 400 when text exceeds max length", async () => {
    const longText = "a".repeat(5001);
    const req = createRequest({ text: longText, mode: "parser" });
    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("exceeds maximum length");
  });

  it("returns 400 for invalid request body (non-object)", async () => {
    const req = new NextRequest("http" + "://localhost:3000/api/ai", {
      method: "POST",
      body: "not-json-object",
      headers: { "x-forwarded-for": `${Math.random()}-bad-body-ip`, "Content-Type": "text/plain" },
    });
    const response = await POST(req);
    // Will either be 400 (parse error) or 500 (internal error)
    expect([400, 500]).toContain(response.status);
  });

  it("falls back to local parser when AI returns invalid JSON", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(async (url: string) => {
      if (url.includes("metadata.google.internal")) {
        return { ok: false };
      }
      if (url.includes("generativelanguage.googleapis.com")) {
        return {
          ok: true,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: "THIS IS NOT JSON {{{{" }] } }],
          }),
        };
      }
      return { ok: false };
    });

    const req = createRequest({ text: "I drove 10km", mode: "parser" });
    const response = await POST(req);
    // Falls back to heuristic parser
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.totalCarbon).toBeDefined();
  });

  it("handles Vertex AI success path", async () => {
    process.env.GCP_PROJECT_ID = "test-gcp-project";

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(async (url: string) => {
      if (url.includes("metadata.google.internal")) {
        return {
          ok: true,
          json: async () => ({ access_token: "fake-gcp-token" }),
        };
      }
      if (url.includes("aiplatform.googleapis.com")) {
        return {
          ok: true,
          json: async () => ({
            candidates: [{
              content: {
                parts: [{
                  text: JSON.stringify({
                    categoryMatches: { transport: [], food: [], electricity: [], shopping: [] },
                    totalCarbon: 0,
                    explanation: "No activities detected",
                  })
                }]
              }
            }]
          }),
        };
      }
      return { ok: false };
    });

    const req = createRequest({ text: "I walked to work", mode: "parser" });
    const response = await POST(req);
    expect(response.status).toBe(200);

    delete process.env.GCP_PROJECT_ID;
  });

  it("handles chat mode AI failure falling back to heuristic", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });
    delete process.env.GEMINI_API_KEY;

    const req = createRequest({ text: "How can I reduce my carbon footprint?", mode: "chat" });
    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.response).toBeDefined();
  });

  it("returns 403 for cross-origin requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai", {
      method: "POST",
      body: JSON.stringify({ text: "drove 10km", mode: "parser" }),
      headers: {
        "Content-Type": "application/json",
        // Simulate a request from a different origin
        "origin": "https://evil-site.example.com",
        "host": "localhost:3000",
      },
    });
    const response = await POST(req);
    expect(response.status).toBe(403);
  });

  it("returns Retry-After header when rate limit exceeded", async () => {
    const limitedIp = `rate-header-test-${Math.random()}`;
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });

    const makeRequest = () =>
      POST(
        new NextRequest("http://localhost:3000/api/ai", {
          method: "POST",
          body: JSON.stringify({ text: "test", mode: "parser" }),
          headers: { "x-forwarded-for": limitedIp },
        })
      );

    // Exhaust rate limit
    for (let i = 0; i < 31; i++) {
      await makeRequest();
    }
    const resp = await makeRequest();
    expect(resp.status).toBe(429);
    const retryAfter = resp.headers.get("Retry-After");
    expect(retryAfter).toBeTruthy();
    expect(Number(retryAfter)).toBeGreaterThan(0);
    expect(resp.headers.get("X-RateLimit-Limit")).toBe("30");
    expect(resp.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  it("returns 400 with Zod error message for invalid mode type", async () => {
    // AiRequestSchema.mode is z.enum(["parser","chat"]) — a number should fail
    const req = new NextRequest("http://localhost:3000/api/ai", {
      method: "POST",
      body: JSON.stringify({ text: "drove 10km", mode: 999 }),
      headers: { "x-forwarded-for": `zod-test-${Math.random()}` },
    });
    const response = await POST(req);
    // Zod rejects mode:999 — should return 400
    expect(response.status).toBe(400);
  });

  it("cleanupRateLimitMap removes expired entries", async () => {
    const { cleanupRateLimitMap, checkRateLimit } = await import("@/lib/ai-utils");
    const testIp = `cleanup-test-${Math.random()}`;

    vi.useFakeTimers();
    checkRateLimit(testIp); // Create entry

    // Advance time past the window so entry is expired
    vi.advanceTimersByTime(65_000);
    cleanupRateLimitMap(); // Should remove the expired entry

    // After cleanup, the first request in a new window should be allowed (count resets)
    const allowed = checkRateLimit(testIp);
    expect(allowed).toBe(true);

    vi.useRealTimers();
  });
});
