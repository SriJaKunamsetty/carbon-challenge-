# CarbonMind AI - Security

## Overview

CarbonMind AI uses a layered security model built around Firebase authentication, Firestore rules, Storage rules, API input validation, and browser security headers.

## Authentication and Route Protection

- Firebase Auth supports Google OAuth and email/password login.
- `AuthContext` manages client auth state and profile loading.
- `src/proxy.ts` protects `/dashboard/*` by checking the `__session` cookie.
- `src/app/dashboard/layout.tsx` adds client-side redirect protection for unauthenticated and not-onboarded users.

## Firestore Protection

The authoritative access model is defined in `firestore.rules`. In practice:

- Users can read and update only their own `users/{userId}` profile.
- Users can create and manage only their own `activities`, `daily_logs`, `goals`, and `achievements`.
- Leaderboard reads are allowed for authenticated users.
- Writes to sensitive computed fields such as `carbonScore`, `monthlyCarbon`, `points`, and `streak` are restricted in profile updates.
- Client writes of `carbonEmit` are blocked in `activities` creation and update rules.

Top-level collections currently in use:

- `users`
- `activities`
- `daily_logs`
- `goals`
- `achievements`
- `leaderboard`

## Storage Protection

`storage.rules` restricts access to `users/{userId}/...` paths only for the authenticated owner and enforces:

- max upload size of 5 MB
- only images and PDFs

## API Route Security

`src/app/api/ai/route.ts` implements a layered security model:

- **CSRF / Origin validation** (`isOriginAllowed`): Rejects browser-initiated cross-origin requests by comparing the `Origin` header against the server `Host` (and optional `NEXT_PUBLIC_APP_URL`). Non-browser server-to-server calls without an `Origin` header are allowed through.
- **Session authentication**: Validates the `__session` cookie before processing any request; returns 401 if absent.
- **Per-IP rate limiting** (`checkRateLimit`): 30 requests per 60-second window. Exceeded requests receive a 429 response with `Retry-After`, `X-RateLimit-Limit`, and `X-RateLimit-Remaining` headers so clients can implement proper back-off.
- **Rate limit map cleanup** (`cleanupRateLimitMap`): Runs every 5 minutes to remove expired IP entries and prevent unbounded memory growth on long-running server instances.
- **Zod schema validation** (`AiRequestSchema.safeParse`): All request bodies are validated against the canonical schema before any field is accessed, replacing error-prone manual type-casting.
- **Input sanitization**: Control-character stripping and length capping on text and conversation history.
- **Safe JSON parsing fallback**: AI response parsing is wrapped in try/catch; invalid AI JSON falls through to the local heuristic engine.
- **AI tier fallback**: Three-tier strategy (Vertex AI → Gemini Developer API → local heuristic) ensures the route never returns a 5xx from an AI failure alone.

## Browser Security Headers

`next.config.ts` sets:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

These are applied to all routes.

## Secrets and Environment Variables

- Firebase public config is exposed intentionally through `NEXT_PUBLIC_*` variables.
- Server-side AI credentials stay in environment variables and are not committed.
- Local secrets live in `.env.local`, which is gitignored.

## Current Security Strengths

- Strong defensive headers
- Input validation and rate limiting on the AI route
- Firestore restrictions on user ownership and sensitive computed fields
- Storage path ownership checks
- App Check support in Firebase initialization

## Current Security Risks to Watch

- Some app flows still rely on client code for write orchestration, so rules must remain the real source of trust.
- The in-memory rate limiter in the AI route is process-local and not shared across instances.
- Logging is improving, but all security-relevant errors should migrate to the structured logger consistently.
- **Session cookie cryptographic verification (recommended before production):** `src/app/api/ai/route.ts` currently checks that the `__session` cookie *exists* but does not cryptographically verify it using Firebase Admin SDK (`admin.auth().verifySessionCookie()`). This is acceptable for hackathon scope because Firestore rules enforce server-side ownership, but a production deployment should add `admin.auth().verifySessionCookie(session.value, true)` in the API route to fully validate the token server-side and prevent spoofed cookie values from bypassing the 401 gate.

## Known Dependency Advisory

`npm audit` reports a moderate severity advisory for `postcss < 8.5.10` (GHSA-qx2v-qp2m-jg93).

**Root cause:** This postcss instance is a transitive dependency bundled *inside* `node_modules/next/node_modules/postcss` — it belongs to Next.js 16.2.9's internal CSS build toolchain, not to application code.

**Impact:** Build-time only. This postcss is used during `npm run build` to process CSS; it is never included in the browser bundle and poses no runtime XSS risk to application users.

**Resolution:** The `npm audit fix --force` suggestion would downgrade Next.js to v9.3.3, which is not viable. This will be resolved when the Next.js team ships a patch release updating their internal postcss dependency. No application-level action is required.
