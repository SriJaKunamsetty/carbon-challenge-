# Contributing to CarbonMind AI

Thank you for your interest in contributing! This document outlines the project standards, workflow, and quality expectations.

## Development Workflow

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/SriRamkunamsetty/carbonmind-ai.git
   cd carbonmind-ai
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add your Firebase credentials.

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Before committing, always verify all quality gates pass:
   ```bash
   npm run lint        # Must show 0 errors, 0 warnings
   npm run type-check  # Must pass with no errors
   npm test            # Must pass with ≥80% coverage on all thresholds
   npm run build       # Must produce a clean standalone build
   ```

## Code Standards

### TypeScript
- Strict mode is enabled. All code must be fully typed — no `any` unless casting for a documented test scenario.
- Prefer `unknown` over `any` for external inputs; narrow the type before use.
- Export types and interfaces from their own `types/` file or co-located with the module.

### Carbon Calculation Functions
All functions in `src/lib/carbon/` must be:
- **Pure** — no side effects, no external state, deterministic output
- **Documented** — full JSDoc with `@param`, `@returns`, and an example where helpful
- **Tested** — corresponding unit test file in `src/tests/unit/carbon/` with 100% branch coverage
- **Simple** — one responsibility per function; aggregate in `calculator.ts`

### Components
- Use `memo()` for all leaf components that receive props
- Every interactive element must have an `aria-label` or visible text label
- Animations must respect `useReducedMotion()` / `prefers-reduced-motion`
- Use `<SkipLink />` in layouts with navigation

### API Routes
- All inputs validated with a Zod schema before processing
- Authentication checked first (before any other work)
- Rate limit checked second
- Always return typed `NextResponse.json()` with correct status codes

## Testing Requirements

Every code contribution must maintain or improve test coverage:

| Layer | Location | Minimum |
|---|---|---|
| Unit (carbon) | `src/tests/unit/carbon/` | 100% branch coverage per module |
| Unit (utils) | `src/tests/unit/` | Full coverage of happy path + edge cases |
| Hooks | `src/tests/hooks/` | All state transitions and error paths |
| Integration | `src/tests/integration/` | All API fallback tiers |
| Accessibility | `src/tests/a11y/` | No `jest-axe` violations |
| E2E | `e2e/` | Critical user journeys |

## Pull Request Checklist

Before opening a PR, confirm:

- [ ] `npm run lint` passes with 0 warnings
- [ ] `npm run type-check` passes
- [ ] `npm test` passes and coverage is maintained or improved
- [ ] New public functions have JSDoc comments
- [ ] New components have ARIA attributes and focus management
- [ ] Any new carbon calculation function has a corresponding unit test file

## Project Structure

See `docs/ARCHITECTURE.md` for the full directory layout and data-flow diagrams.
