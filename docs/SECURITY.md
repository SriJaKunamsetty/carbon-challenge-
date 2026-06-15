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

`src/app/api/ai/route.ts` implements:

- bounded request size
- per-IP in-memory rate limiting
- sanitized conversation history and text input
- safe JSON parsing fallback
- multi-step AI fallback to avoid hard failure when external AI is unavailable

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
