# CarbonMind AI - Architecture

## Overview

CarbonMind AI is a Next.js 16 App Router application with Firebase for authentication and data storage. The platform helps users understand, track, and reduce their carbon footprint through five core product surfaces:

- Landing and login experience
- Onboarding baseline setup
- Dashboard analytics
- Activity logging and tracking
- AI coach and carbon twin reduction tools

## Runtime Architecture

| Layer | Current implementation |
|-------|------------------------|
| Web framework | Next.js 16 App Router |
| Rendering | Mostly client-rendered route pages with shared root and dashboard layouts |
| Auth | Firebase Auth on the client, plus `src/proxy.ts` cookie guard for `/dashboard/*` |
| Data | Firestore collections for users, activities, daily logs, goals, achievements, leaderboard |
| File storage | Firebase Storage with user-scoped paths |
| AI | `src/app/api/ai/route.ts` with Vertex AI fallback, Gemini API fallback, then local heuristics |
| Deployment | Standalone Next.js build, Dockerfile for Cloud Run style deployment |

## Repository Structure

| Path | Responsibility |
|------|----------------|
| `src/app` | Routes, layouts, and the AI API route |
| `src/components` | Reusable dashboard and UI components |
| `src/context` | Auth state and profile lifecycle |
| `src/hooks` | Firestore subscriptions and derived UI state |
| `src/lib` | Firebase init, validators, helper utilities, carbon math, mock AI |
| `src/services` | Query constraint builders and typed Firestore helpers |
| `src/types` | Shared domain types |
| `docs` | Architecture, testing, security, database, and challenge-alignment docs |

## Request and Data Flow

### Authentication

1. User signs in with Google or email/password from `src/app/login/page.tsx`.
2. `AuthContext` subscribes to Firebase auth state.
3. When a user is present, `AuthContext` loads the Firestore profile and sets the `__session` cookie.
4. `src/proxy.ts` uses that cookie to protect dashboard routes.
5. `src/app/dashboard/layout.tsx` performs client-side redirect cleanup for unauthenticated or not-yet-onboarded users.

### Activity Tracking

1. Users log activity through natural-language parsing in `src/app/dashboard/log/page.tsx` or manual tracker entry in `src/app/dashboard/tracker/page.tsx`.
2. The AI route parses or coaches using `src/app/api/ai/route.ts`.
3. Activities and daily logs are written to Firestore.
4. Hooks such as `useActivities`, `useCarbonScore`, and `useLeaderboard` subscribe to Firestore and derive dashboard state.

### Reduction Features

- `src/app/dashboard/coach/page.tsx` gives personalized reduction advice.
- `src/app/dashboard/twin/page.tsx` simulates transport, energy, and diet changes.
- Goals, streaks, achievements, and leaderboard views reinforce continued behavior change.

## Rendering Strategy

| Route area | Strategy |
|------------|----------|
| `/` | Client-rendered landing page |
| `/login` | Client-rendered auth page |
| `/onboarding` | Client-rendered multi-step flow |
| `/dashboard/*` | Client-rendered pages inside a shared authenticated layout |
| `/api/ai` | Server route handler |

The current app uses `"use client"` broadly. That keeps Firebase-driven state straightforward, but it also leaves a maintainability and bundle-size improvement opportunity for future score work.

## Current Strengths

- Clear domain separation in `src/lib/carbon`
- Strong typed hooks for activities, goals, and leaderboard
- Dedicated proxy guard for dashboard access
- Fallback-safe AI route design
- Good rule-based protection in `firestore.rules` and `storage.rules`

## Current Score Risks

- Several route pages are still large and would benefit from extraction into feature subcomponents.
- Some docs had drifted from the codebase and must stay synchronized going forward.
- Real-time dashboard chrome still mixes production behavior with mock notification data.
