# CarbonMind AI - Testing

## Current Test Stack

| Layer | Tooling | Current coverage |
|-------|---------|------------------|
| Unit and integration | Vitest, Testing Library, jest-dom, jest-axe | Hooks, services, validators, API route, context, UI components |
| Accessibility | `jest-axe` | Component-level coverage, with room for more page-level checks |
| End to end | Playwright | Authentication flow today |

## Commands

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

`npm test` generates coverage reports in `coverage/`, including `coverage/lcov.info` for SonarCloud.

## What Is Covered Well

- Carbon calculation modules under `src/lib/carbon`
- Validators and parsing logic
- Firestore and analytics service wrappers
- Custom hooks such as `useActivities`, `useGoals`, `useLeaderboard`, and `useCarbonScore`
- Root auth context behavior

## What Still Needs Better Coverage

- Large route pages in `src/app/**/page.tsx`
- Dashboard chrome interactions
- Full daily-log user journey
- More failure-path tests around auth, parsing, and settings flows

## Coverage Reality

The local suite currently provides strong line coverage overall, but that should not be confused with full product confidence. The remaining high-value work is:

1. Page-level smoke and accessibility tests
2. More branch coverage in `AuthContext` and dashboard chrome
3. End-to-end coverage for onboarding, logging, and dashboard feedback loops

## Test File Conventions

| Location | Purpose |
|----------|---------|
| `src/tests/unit` | Domain logic and utility behavior |
| `src/tests/hooks` | Custom hook behavior |
| `src/tests/components` | UI component behavior |
| `src/tests/services` | Firebase/analytics service wrappers |
| `src/tests/context` | Shared context behavior |
| `src/tests/integration` | API route and cross-layer behavior |
| `src/tests/a11y` | Accessibility checks |
| `e2e` | Playwright browser flows |

## CI Expectations

The repository includes `.github/workflows/ci.yml`, which runs:

1. Dependency install
2. Lint
3. Type-check
4. Unit tests with coverage
5. Coverage artifact upload

Future quality improvements should keep this workflow green and extend it rather than bypass it.
