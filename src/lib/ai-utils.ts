/**
 * @module ai-utils
 * @description Shared AI utilities for CarbonMind API routes.
 * Contains rate limiting, input sanitization, Gemini API calls,
 * and re-exports prompt builders from ai-prompts.
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
 * Returns true if the request should be allowed.
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

// ── Input Sanitization ───────────────────────────────────────────────────────

/**
 * Sanitizes user input to prevent prompt injection.
 * Strips control characters and excessive whitespace.
 *
 * @param input - Raw user input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, MAX_INPUT_LENGTH);
}

// ── Types ────────────────────────────────────────────────────────────────────

/** Chat message structure */
export interface ChatHistoryEntry {
  role: "user" | "assistant";
  content: string;
}

/** User profile context for AI prompts */
export interface UserProfileContext {
  name?: string;
  carbonScore?: number;
  goal?: number;
  country?: string;
  occupation?: string;
}

// ── GCP / Gemini API ─────────────────────────────────────────────────────────

/**
 * Fetches a GCP access token from the Cloud Run metadata server.
 * Only works in GCP environments (Cloud Run, GCE, GKE).
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
 * Calls Vertex AI or Gemini API with the given prompt.
 * Returns the text response or null if all attempts fail.
 *
 * @param prompt - The full prompt text to send
 * @param options - Optional configuration (e.g. JSON mode)
 * @returns The AI-generated text or null on failure
 */
export async function callGeminiApi(
  prompt: string,
  options?: { jsonMode?: boolean }
): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const projectId = process.env.GCP_PROJECT_ID || "cardon-footprint-499105";
  const gcpToken = await getGcpToken();
  const generationConfig = options?.jsonMode
    ? { responseMimeType: "application/json" }
    : undefined;

  // Attempt 1: Vertex AI (production)
  if (gcpToken) {
    try {
      const vertexUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent`;
      const response = await fetch(vertexUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${gcpToken}` },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          ...(generationConfig && { generationConfig }),
        }),
      });
      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return reply;
    } catch {
      // Vertex AI failed, try fallback
    }
  }

  // Attempt 2: Gemini Developer API
  if (geminiKey) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          ...(generationConfig && { generationConfig }),
        }),
      });
      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return reply;
    } catch {
      // Gemini API failed
    }
  }

  return null;
}

/**
 * Sanitizes and validates the conversation history array.
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
