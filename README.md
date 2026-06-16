# CarbonMind AI — Carbon Footprint Awareness Platform

> **Google PromptWars Hackathon Submission**  
> Challenge Vertical: Carbon Footprint Awareness Platform  
> Helps individuals **understand**, **track**, and **reduce** their personal carbon footprint through natural-language logging, a live dashboard, an AI sustainability coach, and a Carbon Twin simulator.

[![CI](https://img.shields.io/github/actions/workflow/status/SriJaKunamsetty/carbon-challenge-/ci.yml?branch=main&label=CI&logo=github)](https://github.com/SriJaKunamsetty/carbon-challenge-/actions)
[![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)](https://github.com/SriJaKunamsetty/carbon-challenge-/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG_2.2-AA-green)](docs/ACCESSIBILITY.md)
[![Tests](https://img.shields.io/badge/tests-350%2B-brightgreen)](docs/TESTING.md)

---

## Problem Statement Alignment

| Challenge Requirement | CarbonMind AI Feature | Key Files |
|---|---|---|
| **Understand** emissions | Carbon score (0–100), category breakdown, trend charts, yearly projection | `src/app/dashboard/page.tsx`, `src/hooks/useCarbonScore.ts` |
| **Understand** impact of choices | Carbon Twin what-if simulator (swap transport mode, diet, energy source) | `src/app/dashboard/twin/page.tsx`, `src/hooks/useTwinSimulation.ts` |
| **Track** daily activities | Natural-language daily log with AI parsing (Gemini / Vertex AI) | `src/app/dashboard/log/page.tsx`, `src/app/api/ai/route.ts` |
| **Track** history | Activity history with search, edit, and pagination | `src/app/dashboard/tracker/page.tsx`, `src/hooks/useActivities.ts` |
| **Track** progress | Streaks, points, achievements, community leaderboard | `src/constants/achievements.ts`, `src/app/dashboard/leaderboard/page.tsx` |
| **Reduce** through guidance | Personalized AI sustainability coach (Gemini with heuristic fallback) | `src/app/dashboard/coach/page.tsx` |
| **Reduce** with goals | Monthly carbon goal setting during onboarding; progress ring on dashboard | `src/hooks/useGoals.ts`, `src/components/onboarding/step-goals.tsx` |
| **Simple actions** | Log a full day in one plain-English sentence (AI extracts the activities) | `src/lib/mock-ai-parsers.ts`, `src/lib/mock-ai.ts` |
| **Personalized insights** | Score relative to global baseline; category-weighted breakdown; smart tips | `src/lib/carbon/score.ts`, `src/hooks/useCarbonScore.ts` |
| **Track** water usage | Water consumption calculator (tap vs bottled) surfaced in the activity tracker | `src/lib/carbon/water.ts`, `src/app/dashboard/tracker/page.tsx` |
| **Track** waste & recycling | Waste disposal calculator (landfill / recycled / compost) with full branch coverage | `src/lib/carbon/waste.ts`, `src/tests/unit/carbon/waste.test.ts` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router + React 19 |
| Styling | Tailwind CSS 4 |
| Auth & DB | Firebase Auth, Firestore, Storage, App Check |
| AI | Gemini Developer API / Vertex AI (3-tier fallback to local heuristics) |
| Validation | Zod 4 schemas on all API inputs |
| Testing | Vitest, Testing Library, jest-axe, Playwright E2E |
| CI | GitHub Actions (lint → typecheck → coverage on every push) |
| Deploy | Docker / Google Cloud Run (`output: standalone`) |

---

## Architecture

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Landing page
│   ├── login/                  # Auth page
│   ├── onboarding/             # 5-step onboarding wizard
│   ├── dashboard/
│   │   ├── page.tsx            # Main dashboard (score, charts, insights)
│   │   ├── log/                # Natural-language activity log
│   │   ├── tracker/            # Activity history + CRUD
│   │   ├── coach/              # AI sustainability coach chat
│   │   ├── twin/               # Carbon Twin what-if simulator
│   │   ├── leaderboard/        # Community leaderboard
│   │   └── settings/           # Profile, preferences, export
│   └── api/ai/route.ts         # Server-side AI route (auth + rate limit)
├── lib/
│   ├── carbon/                 # Pure domain calculation functions
│   │   ├── calculator.ts       # aggregateMonthlyCarbon()
│   │   ├── transport.ts        # calculateTransportEmissions()
│   │   ├── food.ts             # calculateFoodEmissions()
│   │   ├── electricity.ts      # calculateElectricityEmissions()
│   │   ├── shopping.ts         # calculateShoppingEmissions()
│   │   ├── water.ts            # calculateWaterEmissions()
│   │   ├── waste.ts            # calculateWasteEmissions()
│   │   ├── score.ts            # calculateCarbonScore(), getScoreRating()
│   │   └── emissionFactors.ts  # Centralised emission constants
│   ├── validators/             # Zod schemas (auth, activity, profile)
│   ├── ai-utils.ts             # Rate limiting, sanitisation, Gemini API
│   ├── mock-ai.ts              # Local heuristic coach (offline fallback)
│   └── mock-ai-parsers.ts      # Local heuristic NL parser (offline fallback)
├── hooks/                      # Custom React hooks (data + business logic)
├── services/                   # Firebase Firestore + Analytics wrappers
├── components/                 # Reusable UI components
├── context/                    # AuthContext (Firebase Auth + profile)
├── types/                      # Shared TypeScript interfaces
├── constants/                  # Achievements, app config
└── proxy.ts                    # Next.js middleware (route guard)
```

### AI Three-Tier Fallback

```
User request
    │
    ▼
1. Vertex AI (GCP metadata credentials — Cloud Run production)
    │ fails?
    ▼
2. Gemini Developer API (GEMINI_API_KEY — local dev)
    │ fails?
    ▼
3. Local heuristic engine (always available, zero cost)
```

This ensures the app remains fully functional even without AI credentials — important for judging and offline scenarios.

---

## Carbon Calculation Engine

All calculations are pure, deterministic TypeScript functions with zero side effects:

| Category | Function | Factors |
|---|---|---|
| Transport | `calculateTransportEmissions(mode, km)` | 9 modes: gasoline car, EV, motorcycle, bus, train, short/long flight, bicycle, walking |
| Food | `calculateFoodEmissions(entries, isLocalOrOrganic)` | 7 types: beef, poultry, pork, fish, dairy, vegetables, grains |
| Electricity | `calculateElectricityEmissions(usage, customKwh, renewableRatio)` | 4 appliances + custom kWh + renewable offset |
| Shopping | `calculateShoppingEmissions(items)` | 4 categories: clothing, electronics, furniture, misc |
| Water | `calculateWaterEmissions(tapLiters, bottlesCount)` | Tap vs bottled |
| Waste | `calculateWasteEmissions(landfill, recycled, compost)` | 3 disposal methods |
| Score | `calculateCarbonScore(monthlyKg, baseline)` | 0–100 linear scale vs configurable baseline |

---

## Quality Signals

| Signal | Status |
|---|---|
| `npm run lint` | ✅ 0 errors, 0 warnings |
| `npm run type-check` | ✅ passes |
| `npm test` | ✅ 350+ tests pass; statements ~95%, branches ~87% |
| `npm run build` | ✅ Next.js 16 standalone build |
| GitHub Actions CI | ✅ lint → typecheck → coverage on every push to `main` |
| jest-axe WCAG 2.2 AA | ✅ no violations on all rendered components |
| Playwright E2E | ✅ auth + dashboard journeys |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Firebase project credentials
- Optional: Gemini API key or Google Cloud project (Vertex AI)

### Installation

```bash
git clone https://github.com/SriJaKunamsetty/carbon-challenge-.git
cd carbonmind-ai
npm install
```

### Environment

Copy `.env.example` to `.env.local` and fill in your credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=1:your_sender_id:web:your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-your_measurement_id
NEXT_PUBLIC_APP_CHECK_SITE_KEY=your_recaptcha_site_key
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_fcm_vapid_key
GEMINI_API_KEY=your_gemini_api_key
GCP_PROJECT_ID=your_google_cloud_project_id
```

> **Note:** The app works fully without AI credentials by falling back to the local heuristic engine. Firebase credentials are required for auth and data persistence.

### Local Development

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run lint      # ESLint check
npm run type-check # TypeScript check
npm test          # Vitest unit + integration + a11y tests with coverage
npm run test:e2e  # Playwright E2E tests (requires built app)
npm run build     # Production build
```

---

## Testing Strategy

The test suite follows the Google Engineering testing pyramid:

```
         ┌──────────┐
         │   E2E    │  Playwright: auth flow, dashboard journey
         ├──────────┤
         │  Pages   │  Component-level tests with mocked hooks
         ├──────────┤
         │ A11y     │  jest-axe WCAG 2.2 AA — components + pages
         ├──────────┤
         │  Hooks   │  renderHook + vitest mocks for all custom hooks
         ├──────────┤
         │Integration│ Full POST request/response for AI API route
         ├──────────┤
         │   Unit   │  Pure functions: all carbon calculators, validators,
         └──────────┘  utils, services, logger
```

Key test files:
- `src/tests/unit/carbon/` — 100% branch coverage of all emission calculators
- `src/tests/integration/api-ai.test.ts` — Vertex AI, Gemini, and heuristic fallback paths
- `src/tests/a11y/` — WCAG 2.2 AA compliance with axe-core
- `e2e/` — Playwright auth + dashboard journeys

---

## Security

- **CSRF / Origin validation**: AI route rejects cross-origin browser requests by comparing `Origin` vs `Host`; returns 403 on mismatch
- **Route guard**: `src/proxy.ts` (Next.js middleware) redirects unauthenticated requests to `/login` before any client bundle loads
- **API auth**: Every `/api/ai` request requires a valid `__session` cookie
- **Rate limiting**: Per-IP in-memory limiter (30 req/min) on the AI route; exceeded requests return 429 with `Retry-After` and `X-RateLimit-*` headers
- **Rate limit map cleanup**: Expired IP entries are purged every 5 minutes to prevent memory growth on long-running instances
- **Input sanitisation**: Control-character stripping + length cap on all AI inputs
- **Zod validation**: All API request bodies validated via `AiRequestSchema.safeParse()` before any field is accessed — no manual type-casting
- **Firestore rules**: Users can only read/write their own documents; computed fields (`carbonScore`, `points`, `streak`) are write-protected
- **CSP headers**: Strict Content-Security-Policy set in `next.config.ts`
- **HSTS, X-Frame-Options, X-Content-Type-Options**: All set in response headers

> **Known advisory — `npm audit`**: `postcss < 8.5.10` (GHSA-qx2v-qp2m-jg93, moderate severity) is flagged as a transitive dependency bundled **inside Next.js 16.2.9's own toolchain** (`node_modules/next/node_modules/postcss`). This postcss instance is only used at build time for CSS processing and is never shipped to the browser. The `npm audit fix --force` resolution would downgrade Next.js to v9.3.3, which is not a viable option. This advisory does not affect application security at runtime and will be resolved automatically when the Next.js team ships a patch release that updates their internal postcss dependency.

See [`docs/SECURITY.md`](docs/SECURITY.md) for the full security model.

---

## Accessibility

- Skip-to-content link on every page (`<SkipLink />`)
- All interactive elements have ARIA labels and focus-visible rings
- `prefers-reduced-motion` respected by all Framer Motion animations
- `ProgressRing` implements `role="progressbar"` with `aria-valuenow/min/max`
- `ErrorBoundary` error state uses `role="alert"`
- `Skeleton` uses `role="status"` with screen-reader text
- Colour contrast meets WCAG 2.2 AA on all text/background combinations

See [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md) for the full accessibility implementation.

---

## Deployment

```bash
# Docker
docker build -t carbonmind-ai .
docker run -p 3000:3000 --env-file .env.local carbonmind-ai

# Google Cloud Run
gcloud run deploy carbonmind-ai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Assumptions

1. Emission factors are sourced from publicly available datasets (IPCC, EPA, DEFRA) and stored in `src/lib/carbon/emissionFactors.ts`. They represent approximate global averages and can be updated per-region via `CARBON_SCORE_BASELINE` config.
2. The local heuristic AI parser covers the most common activity patterns (driving, flights, food choices, energy use). Uncommon activities fall through to a generic "other" category.
3. Firestore is used for persistence; the app has no backend server beyond Next.js API routes and Firebase.
4. The leaderboard is opt-in: only users who have completed onboarding appear.

---

## Docs

- [`docs/CHALLENGE_ALIGNMENT.md`](docs/CHALLENGE_ALIGNMENT.md) — Full requirement-to-feature mapping
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Component and data-flow diagrams
- [`docs/SECURITY.md`](docs/SECURITY.md) — Security model and threat mitigations
- [`docs/TESTING.md`](docs/TESTING.md) — Testing strategy and coverage targets
- [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md) — WCAG 2.2 AA implementation details
- [`docs/DATABASE.md`](docs/DATABASE.md) — Firestore schema and security rules
