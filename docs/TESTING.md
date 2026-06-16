# CarbonMind AI — Testing Strategy

## Test Stack

| Layer | Tooling | Coverage |
|---|---|---|
| Unit — Carbon domain | Vitest | 100% branch coverage on all 6 emission calculators |
| Unit — Utilities | Vitest | `ai-utils`, `activity-utils`, `export-utils`, `logger`, `cn`, `proxy`, validators, mock-AI parser |
| Hooks | Vitest + Testing Library `renderHook` | `useActivities`, `useGoals`, `useCarbonScore`, `useMonthlyReport`, `useLeaderboard`, `useReducedMotion` |
| Services | Vitest + Firebase mock | Firestore service, Analytics service |
| Integration — API | Vitest (Node env) | All three AI tiers (Vertex → Gemini → heuristic); auth guard; rate limit; Zod validation |
| Components | Vitest + Testing Library | Dashboard page, coach page, SkipLink |
| Accessibility | jest-axe (axe-core) | All UI components + landing page — zero violations |
| E2E | Playwright | Auth flow, dashboard navigation |

---

## Commands

```bash
npm run lint          # ESLint — must be 0 errors, 0 warnings
npm run type-check    # TypeScript strict mode
npm test              # All Vitest tests with V8 coverage
npm run test:e2e      # Playwright E2E (requires built app)
npm run build         # Production build verification
```

Coverage is reported to `coverage/` including `lcov.info` for SonarCloud.

---

## Test File Map

| File | What It Tests |
|---|---|
| `src/tests/unit/carbon/food.test.ts` | `calculateFoodEmissions` — all food types, local/organic flag, edge cases |
| `src/tests/unit/carbon/electricity.test.ts` | `calculateElectricityEmissions` — appliances, negative hours, unknown type, renewable ratio |
| `src/tests/unit/carbon/shopping.test.ts` | `calculateShoppingEmissions` — categories, unknown category fallback |
| `src/tests/unit/carbon/water.test.ts` | `calculateWaterEmissions` — tap, bottled, edge cases |
| `src/tests/unit/carbon/waste.test.ts` | `calculateWasteEmissions` — landfill, recycled, compost |
| `src/tests/unit/carbon/emissionFactors.test.ts` | Emission factor constants — structure and value ranges |
| `src/tests/carbon.test.ts` | `aggregateMonthlyCarbon` + score calculation + all category functions |
| `src/tests/unit/ai-utils.test.ts` | Rate limit, sanitizeInput, sanitizeHistory, callGeminiApi (all 3 tiers + edge cases) |
| `src/tests/unit/activity-utils.test.ts` | `toDate` (all input types), `calculateStreak` |
| `src/tests/unit/mock-ai.test.ts` | `parseCarbonLog` (all transport/food/electricity/shopping patterns), `getCoachResponse` |
| `src/tests/unit/proxy.test.ts` | Route guard — public routes, expired JWT, malformed token, valid token |
| `src/tests/unit/utils.test.ts` | `cn()` — merging, conditionals, Tailwind conflict resolution |
| `src/tests/unit/validators.test.ts` | All Zod schemas (Login, Signup, Chat, Activity, Onboarding, ProfileUpdate) |
| `src/tests/lib/export-utils.test.ts` | CSV export — happy path, server-side guard, special characters |
| `src/tests/lib/logger.test.ts` | Debug (dev-only), info, warn, error format |
| `src/tests/hooks/useActivities.test.ts` | Firestore subscription, addActivity, deleteActivity, pagination, streak |
| `src/tests/hooks/useGoals.test.ts` | Goal CRUD, loading, error states |
| `src/tests/hooks/useCarbonScore.test.ts` | Score, trend, category breakdown computation |
| `src/tests/hooks/useMonthlyReport.test.ts` | Monthly report aggregation |
| `src/tests/hooks/useLeaderboard.test.ts` | Leaderboard subscription |
| `src/tests/hooks/useReducedMotion.test.ts` | `prefers-reduced-motion` media query |
| `src/tests/services/firestore.test.ts` | Firestore CRUD wrappers |
| `src/tests/services/analytics.test.ts` | Analytics event wrappers |
| `src/tests/integration/api-ai.test.ts` | POST /api/ai — auth, rate limit, Vertex, Gemini, heuristic fallback, invalid JSON |
| `src/tests/a11y/components.a11y.test.tsx` | Button, GlassCard, ProgressRing, Skeleton, ErrorBoundary, SkipLink — zero axe violations |
| `src/tests/a11y/pages.a11y.test.tsx` | Landing page — zero axe violations |
| `src/tests/components/skip-link.test.tsx` | SkipLink rendering and href |
| `src/tests/pages/dashboard.test.tsx` | Dashboard page rendering with mocked hooks |
| `src/tests/pages/coach.test.tsx` | Coach page interaction |
| `e2e/auth.spec.ts` | Login, signup, redirect flows |
| `e2e/dashboard.spec.ts` | Dashboard navigation, log entry |

---

## Coverage Thresholds

Configured in `vitest.config.ts`:

| Metric | Threshold |
|---|---|
| Statements | ≥ 85% |
| Branches | ≥ 80% |
| Functions | ≥ 85% |
| Lines | ≥ 85% |

All carbon calculation modules maintain **100% branch coverage** — the core domain logic has zero untested paths.

---

## AI Tier Integration Tests

The `/api/ai` route is tested against all three fallback tiers:

```
Tier 1 — Vertex AI:     metadata server returns token + aiplatform.googleapis.com mocked
Tier 2 — Gemini Dev:    metadata fails + generativelanguage.googleapis.com mocked
Tier 3 — Heuristic:     all fetch calls fail → local parser/coach responds
```

Edge cases covered: invalid JSON from AI, rate limit exceeded, missing auth cookie, malformed request body.

---

## CI Pipeline

`.github/workflows/ci.yml` runs on every push and pull request to `main`:

1. `npm ci` — clean dependency install
2. `npm run lint` — ESLint (must be 0 errors, 0 warnings)
3. `npm run type-check` — TypeScript strict
4. `npm test` — full test suite with coverage
5. Coverage artifact uploaded (30-day retention)
6. `npm run build` — Next.js production build verification
