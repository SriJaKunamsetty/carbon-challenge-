# CarbonMind AI — Accessibility Implementation

## Overview

CarbonMind AI targets WCAG 2.2 AA compliance across all user-facing surfaces: the public landing page, authentication flow, onboarding wizard, and dashboard. The implementation includes semantic markup, keyboard navigation, visible focus states, screen-reader announcements, reduced-motion support, and automated axe-core checks.

---

## WCAG 2.2 AA Compliance Checklist

| Criterion | Implementation | Status |
|---|---|---|
| 1.1.1 Non-text Content | All icons have `aria-hidden="true"` + adjacent visible/SR text | ✅ |
| 1.3.1 Info and Relationships | Semantic HTML5 elements (`header`, `nav`, `main`, `section`, `article`) | ✅ |
| 1.3.2 Meaningful Sequence | DOM order matches visual order; no CSS-only reordering | ✅ |
| 1.3.3 Sensory Characteristics | Status/validation communicated via text, not colour alone | ✅ |
| 1.4.1 Use of Color | Error states include icon + text; success states include icon + text | ✅ |
| 1.4.3 Contrast (Minimum) | 4.5:1 on all text; 3:1 on large text (Tailwind zinc/emerald palette) | ✅ |
| 1.4.4 Resize Text | Rem-based font sizing; no fixed px heights that clip text | ✅ |
| 1.4.10 Reflow | Responsive Tailwind layout; single column on 320px width | ✅ |
| 1.4.11 Non-text Contrast | UI components have 3:1 contrast against background | ✅ |
| 2.1.1 Keyboard | All interactive elements reachable and operable via keyboard | ✅ |
| 2.1.2 No Keyboard Trap | Modals restore focus on close; no focus traps without escape | ✅ |
| 2.4.1 Bypass Blocks | `<SkipLink />` on every layout targeting `#main-content` | ✅ |
| 2.4.2 Page Titled | Unique `<title>` per page via Next.js `metadata` export | ✅ |
| 2.4.3 Focus Order | Logical tab order follows DOM; Sidebar → Topbar → Main | ✅ |
| 2.4.4 Link Purpose | All links have descriptive text or `aria-label` | ✅ |
| 2.4.7 Focus Visible | `focus-visible:ring-2` on all interactive elements | ✅ |
| 2.5.3 Label in Name | Button and input visible labels match accessible names | ✅ |
| 3.1.1 Language of Page | `<html lang="en" dir="ltr">` on root layout | ✅ |
| 3.2.1 On Focus | No context change on focus; only on user-initiated action | ✅ |
| 3.2.2 On Input | Form submission only via explicit button action | ✅ |
| 3.3.1 Error Identification | Inline Zod validation errors identify the specific field | ✅ |
| 3.3.2 Labels or Instructions | All form inputs have associated `<label>` elements | ✅ |
| 4.1.2 Name, Role, Value | ARIA roles/states on all interactive and dynamic elements | ✅ |
| 4.1.3 Status Messages | `role="status"` on loading; `role="alert"` on errors | ✅ |

---

## Key Component Implementations

### SkipLink (`src/components/ui/skip-link.tsx`)
- Renders `sr-only` by default; appears on keyboard focus
- Targets `id="main-content"` on every dashboard and public page
- Tested: `src/tests/components/skip-link.test.tsx`

### ProgressRing (`src/components/ui/progress-ring.tsx`)
- Uses a native `<progress>` element (sr-only) with `aria-valuenow/min/max`
- SVG ring has `aria-hidden="true"` and `focusable="false"`
- Screen-reader text summary with contextual encouragement
- Respects `prefers-reduced-motion` via `useReducedMotion()` hook

### ErrorBoundary (`src/components/ui/error-boundary.tsx`)
- Error state renders `role="alert" aria-live="assertive"`
- Retry button has explicit `aria-label="Try again"`
- Tested: `src/tests/a11y/components.a11y.test.tsx`

### GlassCard (`src/components/ui/glass-card.tsx`)
- Polymorphic — renders as `div`, `section`, `article`, or `aside`
- Passes `aria-label`, `aria-describedby`, `role`, `tabIndex` through
- Tested: `src/tests/a11y/components.a11y.test.tsx`

### Skeleton (`src/components/ui/skeleton.tsx`)
- Uses `role="status"` with visually hidden "Loading..." text
- Pulse animation respects `prefers-reduced-motion`

---

## Animations and Motion

All Framer Motion animations check `useReducedMotion()`:
```tsx
const prefersReducedMotion = useReducedMotion();
<motion.div
  animate={{ opacity: 1 }}
  transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
/>
```

Components with animation: `ProgressRing`, `GlassCard` (hover), `Sidebar`, `Topbar` dropdown, onboarding step transitions.

---

## Automated Testing

### axe-core (jest-axe) — Component Level
File: `src/tests/a11y/components.a11y.test.tsx`
- Button component
- GlassCard component
- ProgressRing component
- Skeleton component
- ErrorBoundary error state

### axe-core (jest-axe) — Page Level
File: `src/tests/a11y/pages.a11y.test.tsx`
- Landing page: zero axe violations

### Keyboard Navigation Tests
File: `src/tests/components/skip-link.test.tsx`
- SkipLink renders with correct href and label
- SkipLink supports custom targetId and label

### Playwright E2E
- Auth flow keyboard navigation
- Dashboard primary navigation
- Form submission via keyboard

Run all accessibility checks:
```bash
npm test                # Includes jest-axe checks
npm run test:e2e        # Includes Playwright keyboard flows
```

---

## Screen Reader Support

Tested with:
- NVDA + Chrome (Windows)
- VoiceOver + Safari (macOS)
- Axe DevTools browser extension

Key announcements verified:
- Page navigation (route changes announce new `<title>`)
- Form validation errors read immediately after submission
- Activity add/delete success messages via `role="status"`
- Carbon score changes announced via `aria-live="polite"`
