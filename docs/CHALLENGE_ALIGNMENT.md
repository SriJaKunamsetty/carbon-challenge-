# Challenge Alignment — Carbon Footprint Awareness Platform

## Problem Statement

> Design a solution that helps individuals **understand**, **track**, and **reduce** their carbon footprint through **simple actions** and **personalized insights**.

---

## Core Requirements → Feature Mapping

### 1. Understand

| Sub-requirement | CarbonMind AI Feature | Implementation |
|---|---|---|
| Know their total footprint | Carbon score (0–100), monthly kg CO2, yearly projection | `src/hooks/useCarbonScore.ts` |
| Understand breakdown by category | Donut chart: transport, food, utilities, shopping | `src/app/dashboard/page.tsx` |
| See trends over time | 30-day area chart of daily emissions | `src/hooks/useCarbonScore.ts` → `trend[]` |
| Compare impact of choices | Carbon Twin simulator: swap transport/diet/energy | `src/app/dashboard/twin/page.tsx`, `src/hooks/useTwinSimulation.ts` |
| Get context for their score | Score rating labels (Eco-Guardian / Active Saver / Typical / High Impact) | `src/lib/carbon/score.ts` → `getScoreRating()` |

### 2. Track

| Sub-requirement | CarbonMind AI Feature | Implementation |
|---|---|---|
| Log daily activities easily | Natural-language log: type "drove 20km and had a steak" | `src/app/dashboard/log/page.tsx` |
| AI parses plain English | Gemini / Vertex AI → structured carbon data (3-tier fallback) | `src/app/api/ai/route.ts`, `src/lib/mock-ai-parsers.ts` |
| Review past activities | Paginated history with category filter and search | `src/app/dashboard/tracker/page.tsx`, `src/hooks/useActivities.ts` |
| Edit or delete entries | Full CRUD on activity records | `src/services/activityService.ts`, `src/services/firestore.service.ts` |
| Stay motivated | Streaks (consecutive logging days), points, achievement badges | `src/constants/achievements.ts`, `src/hooks/useActivities.ts` |
| See community standing | Leaderboard with top users | `src/app/dashboard/leaderboard/page.tsx`, `src/hooks/useLeaderboard.ts` |

### 3. Reduce

| Sub-requirement | CarbonMind AI Feature | Implementation |
|---|---|---|
| Get personalized AI advice | AI coach chat: context-aware, persona-driven | `src/app/dashboard/coach/page.tsx`, `src/app/api/ai/route.ts` |
| Get actionable tips | Coach responses and parsed-log tips target the user's highest emission category | `src/lib/mock-ai.ts` → `getCoachResponse()` |
| Set a goal | Monthly carbon target set during onboarding | `src/components/onboarding/step-goals.tsx`, `src/hooks/useGoals.ts` |
| Track goal progress | Dashboard progress ring: monthly carbon vs goal | `src/app/dashboard/page.tsx` |
| Model behaviour changes | Carbon Twin: "What if I took the bus every day?" | `src/app/dashboard/twin/page.tsx` |
| Export data | JSON export from Settings for portability | `src/app/dashboard/settings/page.tsx`, `src/lib/export-utils.ts` |

---

## Simple Actions (Explicit Mapping)

The challenge requires "simple actions". Each core workflow is designed to be a single interaction:

| Action | Steps Required | Feature |
|---|---|---|
| Log a day's activities | 1 — type a sentence, tap Submit | Natural-language daily log |
| Set a monthly goal | 1 — one slider during onboarding | Step 5 of onboarding wizard |
| Get a reduction tip | 1 — open Coach, ask a question | AI Sustainability Coach |
| See impact of a change | 1 — adjust a Twin slider | Carbon Twin simulator |
| Check standing | 1 — open Leaderboard | Community Leaderboard |

---

## Personalized Insights (Explicit Mapping)

| Insight Type | How It's Personalized | Source |
|---|---|---|
| Carbon score | Normalized against user's own goal and global baseline | `useCarbonScore`, `CARBON_SCORE_BASELINE` |
| Category breakdown | Computed from the user's actual logged activities | `useCarbonScore` → `categoryBreakdown` |
| AI coach response | Includes user's name, monthly carbon, and highest emission category | `src/lib/ai-utils.ts` → `buildChatPrompt()` |
| Smart tip on dashboard | Targets the user's highest emission category in real time | `src/app/dashboard/page.tsx` → `aiRecommendation` |
| Carbon Twin baseline | Pre-seeded from user's onboarding answers | `src/hooks/useTwinSimulation.ts` |
| Achievement badges | Unlocked from the user's real activity patterns | `src/constants/achievements.ts` |
| Monthly report | Based on the user's own 30-day activity history | `src/hooks/useMonthlyReport.ts` |

---

## Evaluation Criteria → Project Strengths

### Code Quality
- All carbon calculation functions are pure, single-responsibility, fully documented with JSDoc
- Consistent code structure: `src/lib/carbon/` mirrors a domain model with one file per category
- TypeScript strict mode; Zod 4 for runtime validation of all external inputs
- ESLint 9 with Next.js ruleset; 0 errors and 0 warnings
- `cn()` utility from `clsx` + `tailwind-merge` for consistent className composition

### Security
- Server-side route guard (`src/proxy.ts`) using JWT expiry check before client bundle loads
- Per-IP rate limiting (30 req/min) and input sanitisation on AI API route
- Firestore rules block writes to sensitive computed fields (`carbonScore`, `points`, `streak`)
- Storage rules enforce max 5 MB uploads, images and PDFs only
- Full CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy headers

### Efficiency
- `useMemo` on all derived data (category breakdown, chart data, recommendations)
- Dynamic import (`next/dynamic`) for heavy chart components; only loaded when needed
- Firestore `onSnapshot` for real-time updates without polling
- Heuristic AI fallback eliminates cold-start failures and reduces API costs

### Testing
- 350+ tests across unit, hook, service, integration, accessibility, and E2E layers
- 100% branch coverage on all 6 carbon calculation modules
- Integration test covers all 3 AI fallback tiers (Vertex → Gemini → heuristic)
- `jest-axe` WCAG 2.2 AA checks on all components and pages
- Playwright E2E tests for auth flow and dashboard journey

### Accessibility
- Skip-to-content link, ARIA labels, focus-visible rings on all interactive elements
- `prefers-reduced-motion` respected in all animations
- Semantic progressbar, status, alert, and region roles
- Keyboard-navigable modals and forms

### Problem Statement Alignment
- Every one of the three core verbs (understand / track / reduce) has multiple features
- "Simple actions" designed to be 1-step interactions throughout
- Personalization is woven into score, coach, tips, Twin, and achievements
