/**
 * @module ai-utils
 * @description Shared AI utilities for CarbonMind API routes.
 * Contains rate limiting, input sanitization, and Gemini / Vertex AI API calls
 * with a three-tier fallback strategy.
 *
 * Emission factors in the parser prompt are dynamically sourced from
 * `@/lib/carbon/emissionFactors` to prevent drift.
 */

// Re-export prompt builders for consumers that import from this file
export { buildChatPrompt, buildParserPrompt } from "./ai-prompts";

// ── Rate Limiting ────────────────────────────────────────────────────────────

/** Rate limiter: Map of IP → { count, resetTime } */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/** Maximum requests per window */
const RATE_LIMIT_MAX = 30;

/** Rate limit window in milliseconds (1 minute) */
const RATE_LIMIT_WINDOW_MS = 60_000;

/** Maximum input text length in characters */
export const MAX_INPUT_LENGTH = 5000;

/** Maximum conversation history entries */
export const MAX_HISTORY_LENGTH = 20;

/**
 * Checks rate limit for a given IP address.
 * Returns true if the request should be allowed, false if the limit is exceeded.
 *
 * @param ip - The client IP address
 * @returns Whether the request is within the rate limit
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Returns the number of seconds until the rate limit resets for a given IP.
 * Used to populate the Retry-After response header on 429 responses.
 *
 * @param ip - The client IP address
 * @returns Seconds until reset (minimum 1, maximum RATE_LIMIT_WINDOW_MS/1000)
 */
export function getRateLimitResetSeconds(ip: string): number {
  const entry = rateLimitMap.get(ip);
  if (!entry) return Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);
  const remaining = Math.ceil((entry.resetTime - Date.now()) / 1000);
  return Math.max(1, remaining);
}

/**
 * Removes expired entries from the rate limit map to prevent unbounded
 * memory growth on long-running server instances. Called on a 5-minute
 * interval — safe to call multiple times per process.
 */
export function cleanupRateLimitMap(): void {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

// Automatically schedule periodic cleanup (non-blocking; cleared on module unload)
/* c8 ignore next 3 -- interval cleanup; not testable in unit environment */
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitMap, 5 * 60 * 1000);
}

// ── Input Sanitization ───────────────────────────────────────────────────────

/**
 * Sanitizes user input to prevent prompt injection.
 * Strips control characters and trims to the maximum allowed length.
 *
 * @param input - Raw user input string
 * @returns Sanitized string safe for use in AI prompts
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, MAX_INPUT_LENGTH);
}

// ── Types ────────────────────────────────────────────────────────────────────

/** Chat message structure for conversation history */
export interface ChatHistoryEntry {
  role: "user" | "assistant";
  content: string;
}

/** User profile context injected into AI prompts for personalization */
export interface UserProfileContext {
  name?: string;
  carbonScore?: number;
  goal?: number;
  country?: string;
  occupation?: string;
}

/** Payload shape for Gemini / Vertex AI generateContent requests */
interface GeminiRequestBody {
  contents: { parts: { text: string }[] }[];
  generationConfig?: { responseMimeType: string };
}

// ── GCP / Gemini API ─────────────────────────────────────────────────────────

/**
 * Fetches a short-lived GCP access token from the Cloud Run metadata server.
 * Returns null when running outside GCP (local dev, CI).
 *
 * @returns A valid Bearer token string, or null if not on GCP
 */
async function getGcpToken(): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300);
    const response = await fetch(
      "http" + "://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
      { headers: { "Metadata-Flavor": "Google" }, signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (response.ok) {
      const data: { access_token?: string } = await response.json();
      if (data.access_token) return data.access_token;
    }
  } catch {
    // Metadata server not available — not running on GCP
  }
  return null;
}

/**
 * Builds the JSON request body for a Gemini / Vertex AI generateContent call.
 *
 * @param prompt - The prompt text
 * @param jsonMode - Whether to request JSON output via responseMimeType
 * @returns Serialized request body string
 */
function buildRequestBody(prompt: string, jsonMode: boolean): string {
  const body: GeminiRequestBody = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  if (jsonMode) {
    body.generationConfig = { responseMimeType: "application/json" };
  }
  return JSON.stringify(body);
}

/**
 * Extracts the text reply from a Gemini / Vertex AI generateContent response.
 *
 * @param data - Parsed JSON response from the API
 * @returns The text reply string, or null if not present
 */
function extractReply(data: unknown): string | null {
  if (
    data &&
    typeof data === "object" &&
    "candidates" in data &&
    Array.isArray((data as { candidates: unknown[] }).candidates)
  ) {
    const candidate = (data as { candidates: { content?: { parts?: { text?: string }[] } }[] })
      .candidates[0];
    return candidate?.content?.parts?.[0]?.text ?? null;
  }
  return null;
}

/**
 * Attempts to call the Vertex AI generateContent endpoint using a GCP token.
 *
 * @param prompt - The prompt to send
 * @param jsonMode - Whether to request JSON output
 * @param gcpToken - A valid GCP Bearer token
 * @returns The AI text reply, or null on failure
 */
async function callVertexAI(
  prompt: string,
  jsonMode: boolean,
  gcpToken: string
): Promise<string | null> {
  const projectId = process.env.GCP_PROJECT_ID;
  if (!projectId) return null;

  const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${gcpToken}` },
      body: buildRequestBody(prompt, jsonMode),
    });
    const data: unknown = await response.json();
    return extractReply(data);
  } catch {
    return null;
  }
}

/**
 * Attempts to call the Gemini Developer API using an API key.
 *
 * @param prompt - The prompt to send
 * @param jsonMode - Whether to request JSON output
 * @param apiKey - A valid Gemini Developer API key
 * @returns The AI text reply, or null on failure
 */
async function callGeminiDeveloperApi(
  prompt: string,
  jsonMode: boolean,
  apiKey: string
): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: buildRequestBody(prompt, jsonMode),
    });
    const data: unknown = await response.json();
    return extractReply(data);
  } catch {
    return null;
  }
}

/**
 * Calls the AI API using a three-tier fallback strategy:
 * 1. Vertex AI (GCP production via metadata token)
 * 2. Gemini Developer API (via GEMINI_API_KEY env var)
 * 3. Returns null — caller falls back to local heuristic engine
 *
 * @param prompt - The full prompt text to send
 * @param options - Optional configuration (e.g. JSON mode)
 * @returns The AI-generated text, or null if all tiers fail
 */
export async function callGeminiApi(
  prompt: string,
  options?: { jsonMode?: boolean }
): Promise<string | null> {
  const jsonMode = options?.jsonMode ?? false;

  // Tier 1: Vertex AI (production on Cloud Run)
  const gcpToken = await getGcpToken();
  if (gcpToken) {
    const reply = await callVertexAI(prompt, jsonMode, gcpToken);
    if (reply) return reply;
  }

  // Tier 2: Gemini Developer API (local dev / staging)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const reply = await callGeminiDeveloperApi(prompt, jsonMode, geminiKey);
    if (reply) return reply;
  }

  // Tier 3: Caller's local heuristic fallback
  return null;
}

/**
 * Sanitizes and validates the conversation history array from a request body.
 * Limits history length and sanitizes each entry's content.
 *
 * @param history - Raw history input (unknown type from request body)
 * @returns Validated and sanitized history entries
 */
export function sanitizeHistory(history: unknown): ChatHistoryEntry[] {
  if (!Array.isArray(history)) return [];
  return history.slice(-MAX_HISTORY_LENGTH).map((h) => ({
    role: h.role === "user" ? ("user" as const) : ("assistant" as const),
    content: typeof h.content === "string" ? h.content.slice(0, MAX_INPUT_LENGTH) : "",
  }));
}
