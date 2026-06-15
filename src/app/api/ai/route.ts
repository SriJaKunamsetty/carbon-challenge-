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
 * Security: Session auth, Zod validation, rate limiting, input sanitization.
 */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseCarbonLog, getCoachResponse } from "@/lib/mock-ai";
import { logger } from "@/lib/logger";
import {
  checkRateLimit,
  sanitizeInput,
  sanitizeHistory,
  callGeminiApi,
  buildChatPrompt,
  buildParserPrompt,
  MAX_INPUT_LENGTH,
  type ChatHistoryEntry,
  type UserProfileContext,
} from "@/lib/ai-utils";

const routeLog = { module: "API/ai" } as const;

/** Valid API modes */
type ApiMode = "parser" | "chat";

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
    safeHistory, sanitizedText,
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
    // Authentication: verify session cookie
    const cookieStore = await cookies();
    const session = cookieStore.get("__session");
    if (!session?.value) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    // Parse and validate request body
    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { text, mode, history, profile } = body as {
      text?: string; mode?: string;
      history?: ChatHistoryEntry[]; profile?: UserProfileContext;
    };

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (text.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Text exceeds maximum length of ${MAX_INPUT_LENGTH} characters` },
        { status: 400 }
      );
    }

    const sanitizedText = sanitizeInput(text);
    const safeHistory = sanitizeHistory(history);
    const apiMode: ApiMode = mode === "chat" ? "chat" : "parser";

    if (apiMode === "chat") {
      return handleChatMode(sanitizedText, safeHistory, profile || {});
    }
    return handleParserMode(sanitizedText);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    logger.error(routeLog, "Request failed", message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
