/**
 * @module AI API Route
 * @description Server-side API route for CarbonMind AI features.
 * Handles two modes:
 * - "parser": Natural language → structured carbon activity JSON
 * - "chat": AI sustainability coach with personalized context
 *
 * Uses a 3-tier fallback strategy:
 * 1. Vertex AI (GCP) — production on Cloud Run
 * 2. Gemini Developer API — development fallback
 * 3. Local heuristic engine — offline/free fallback
 *
 * Security: Session auth, Zod schema validation, CSRF origin check,
 * per-IP rate limiting with Retry-After header, input sanitization.
 */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseCarbonLog, getCoachResponse } from "@/lib/mock-ai";
import { logger } from "@/lib/logger";
import { AiRequestSchema } from "@/lib/validators";
import {
  checkRateLimit,
  getRateLimitResetSeconds,
  sanitizeInput,
  sanitizeHistory,
  callGeminiApi,
  buildChatPrompt,
  buildParserPrompt,
  type ChatHistoryEntry,
  type UserProfileContext,
} from "@/lib/ai-utils";

const routeLog = { module: "API/ai" } as const;

/** Valid API modes */
type ApiMode = "parser" | "chat";

/**
 * Validates that the request Origin header matches the expected application
 * host, protecting against cross-site request forgery on the AI route.
 *
 * Returns true (allow) when:
 * - No Origin header is present (server-to-server or curl)
 * - Origin matches the configured NEXT_PUBLIC_APP_URL or the request host
 */
function isOriginAllowed(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser request — allow

  try {
    const originHost = new URL(origin).host;
    const requestHost = req.headers.get("host") ?? "";
    // Also allow explicitly configured app URL (e.g. production domain)
    const configuredHost = process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL).host
      : null;
    return originHost === requestHost || (configuredHost !== null && originHost === configuredHost);
  } catch {
    return false;
  }
}

/**
 * Handles the "chat" API mode: sends user message to AI coach with context,
 * falling back to local heuristic coach if AI is unavailable.
 */
async function handleChatMode(
  sanitizedText: string,
  safeHistory: ChatHistoryEntry[],
  profile: UserProfileContext
): Promise<NextResponse> {
  const prompt = buildChatPrompt(sanitizedText, safeHistory, profile);
  const aiResponse = await callGeminiApi(prompt);

  if (aiResponse) {
    return NextResponse.json({ response: aiResponse });
  }

  const fallbackResponse = getCoachResponse(
    sanitizedText,
    profile as unknown as import("@/types").UserProfile
  );
  return NextResponse.json({ response: fallbackResponse });
}

/**
 * Handles the "parser" API mode: converts natural language to structured carbon data,
 * falling back to local heuristic parser if AI is unavailable.
 */
async function handleParserMode(sanitizedText: string): Promise<NextResponse> {
  const prompt = buildParserPrompt(sanitizedText);
  const aiResponse = await callGeminiApi(prompt, { jsonMode: true });

  if (aiResponse) {
    try {
      const parsed: unknown = JSON.parse(aiResponse);
      return NextResponse.json(parsed);
    } catch {
      // AI returned invalid JSON, fall through to local parser
    }
  }

  const parsedResult = parseCarbonLog(sanitizedText);
  return NextResponse.json(parsedResult);
}

/**
 * POST /api/ai
 * Main API handler for AI-powered carbon analysis and coaching.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // CSRF: Reject cross-origin requests from browser contexts.
    if (!isOriginAllowed(req)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Authentication: verify session cookie exists.
    // The __session cookie is set by AuthContext after a successful Firebase Auth sign-in.
    // For this hackathon submission, we validate cookie presence and rely on Firestore
    // server-side security rules as the authoritative ownership enforcement layer —
    // meaning even a spoofed cookie cannot read or write another user's data.
    // For a production deployment, add full cryptographic verification via Firebase Admin SDK:
    //   await admin.auth().verifySessionCookie(session.value, true)
    // See docs/SECURITY.md — "Session cookie cryptographic verification" for full details.
    const cookieStore = await cookies();
    const session = cookieStore.get("__session");
    if (!session?.value) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Rate limiting — include Retry-After so clients can back off correctly.
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      const retryAfter = getRateLimitResetSeconds(ip);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": "30",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // Parse and validate request body using the canonical Zod schema.
    // This replaces manual type-casting and ensures consistent validation.
    const rawBody: unknown = await req.json().catch(() => null);
    const parseResult = AiRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0];
      const message = firstError?.message ?? "Invalid request body";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { text, mode, history, profile } = parseResult.data;

    const sanitizedText = sanitizeInput(text);
    const safeHistory = sanitizeHistory(history);
    const apiMode: ApiMode = mode === "chat" ? "chat" : "parser";
    const safeProfile: UserProfileContext = (profile as UserProfileContext) ?? {};

    if (apiMode === "chat") {
      return handleChatMode(sanitizedText, safeHistory, safeProfile);
    }
    return handleParserMode(sanitizedText);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    logger.error(routeLog, "Request failed", message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
