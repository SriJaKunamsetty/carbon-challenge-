# CarbonMind AI — Agent Quality Policy

This repository follows Google-style engineering practices for PromptWars evaluation.

## Architecture

- Next.js 16 App Router with Edge Middleware (`src/middleware.ts` → `src/proxy.ts`)
- Feature logic in hooks/services; pages stay under 250 lines where possible
- Shared domain logic in `src/lib/carbon` — no duplicated scoring formulas
- Firebase access through `src/services/firestore.service.ts` and hooks

## Code Quality

- TypeScript strict mode; no `any` in production code
- Structured logging via `src/lib/logger.ts` — avoid raw `console.*` in app code
- Max ~250 lines per page component; extract subcomponents and hooks when larger
- Zod validation at API and form boundaries — use `Schema.safeParse()`, never manual type-casting
- API security: CSRF origin check, rate-limit Retry-After headers, AiRequestSchema enforced on every AI call
- Consistent error shapes in API routes: `{ error: string }`

## Testing

- Run `npm test` before every submission (350+ Vitest tests, 85%+ line coverage)
- New hooks, services, and API routes require unit tests
- Page-level accessibility tests for interactive routes
- Playwright E2E for auth and critical user journeys

## Accessibility

- WCAG 2.2 AA on all interactive pages
- Semantic landmarks (`main`, `nav`, `header`), skip links, focus-visible styles
- Charts expose `role="img"` with screen-reader summaries
- Respect `prefers-reduced-motion`

## Problem Statement Alignment

Carbon Footprint Awareness Platform requirements:

1. **Understand** — dashboard analytics, category breakdown, carbon score
2. **Track** — natural-language daily log, activity tracker, streaks
3. **Reduce** — AI coach tips, carbon twin simulator, monthly goals, leaderboard

Every feature must map to at least one of these three pillars.

## Verification Commands

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```
