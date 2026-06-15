# CarbonMind AI - Accessibility

## Overview

CarbonMind AI targets WCAG 2.2 AA-level behavior across the public landing page, authentication flow, and dashboard surfaces. The repository includes semantic markup, keyboard-accessible controls, visible focus states, reduced-motion support, and automated accessibility checks for key routes.

## Current strengths

- Semantic landmarks are used across page layouts (`header`, `nav`, `main`, `aside`, `footer`).
- Icon-only controls include accessible names with `aria-label`.
- Tabs, dialogs, dropdowns, and loading states expose screen-reader-friendly state.
- Focus-visible styles are present on interactive controls.
- Animated UI respects reduced-motion-safe patterns where practical.
- The test suite includes automated axe checks for important pages.

## Implemented patterns

### Navigation

- Skip-link support is defined in the app shell.
- Sidebar and top navigation identify the active route.
- Mobile navigation uses `aria-expanded` and descriptive control labels.

### Forms

- Inputs use explicit labels or screen-reader-only labels.
- Validation and status messages are rendered as readable text instead of color alone.
- Buttons expose loading and disabled states in a way that remains understandable.

### Dynamic UI

- Loading sections use `aria-busy` when content is pending.
- Notifications, profile menus, and modals expose state changes with appropriate ARIA attributes.
- Alerts and success messages are rendered in readable regions instead of silent visual-only changes.

## Automated verification

The repository currently includes:

- unit and integration coverage for interactive dashboard chrome
- `jest-axe` checks for important pages under `src/tests/a11y`
- Playwright end-to-end checks for core flows

Run the checks with:

```bash
npm run test
npm run test:e2e
```

## Remaining improvement areas

These are the highest-value accessibility upgrades still worth doing for a perfect evaluator score:

1. Add axe coverage for more authenticated dashboard routes such as tracker, onboarding, and settings.
2. Verify all dialogs trap focus and restore focus consistently after close.
3. Expand screen-reader announcements for async mutations such as add/delete activity actions.
4. Keep route-level heading hierarchy disciplined as larger pages are refactored into smaller sections.

## Maintenance rule

When adding a new page or major component:

1. Provide a clear page heading.
2. Ensure all icon-only buttons have accessible names.
3. Confirm keyboard access for every interaction.
4. Add or update automated accessibility coverage when the surface is user-facing.
