# CarbonMind AI - Database

## Overview

CarbonMind AI uses Cloud Firestore as the primary application database. The current repository models user activity through top-level collections rather than Cloud Functions-maintained aggregate pipelines.

## Active Collections

### `users`

Stores profile and aggregate user fields.

Key fields:

- `uid`
- `name`
- `email`
- `photoURL`
- `createdAt`
- `country`
- `age`
- `occupation`
- `streak`
- `points`
- `goal`
- `preferences`
- `carbonScore`
- `onboarded`
- optional `monthlyCarbon`
- optional `lastActivityAt`

### `activities`

Stores individual user activities used by tracker views and derived carbon-score analytics.

Common fields:

- `userId`
- `category`
- `value`
- `unit`
- optional `type`
- optional `note`
- `date`
- optional `createdAt`

### `daily_logs`

Stores natural-language daily entries and their parsed structure.

Common fields:

- `userId`
- `date`
- `rawText`
- `parsedItems`
- `totalCarbon`
- `createdAt`

### `goals`

Stores user-defined reduction goals.

Common fields:

- `userId`
- `title`
- `category`
- `targetValue`
- `currentValue`
- `deadline`
- `status`
- `createdAt`

### `achievements`

Stores unlocked user achievements.

Common fields:

- `userId`
- `badgeId`
- `title`
- `description`
- `unlockedAt`

### `leaderboard`

Stores leaderboard-ready user ranking information.

Common fields:

- `userId`
- `name`
- `photoURL`
- `points`
- `streak`
- `carbonScore`
- `level`

## Access Patterns in Code

| Code path | Main collection usage |
|-----------|-----------------------|
| `AuthContext` | `users` |
| `useActivities`, tracker page, dashboard | `activities` |
| daily log page | `daily_logs` and `activities` |
| `useGoals` | `goals` |
| `useLeaderboard` | `users` for ranking snapshot |
| achievements constants and leaderboard page | `achievements` and derived badge logic |

## Important Consistency Note

The repository currently mixes two patterns:

1. Top-level collections used directly by pages such as tracker and daily log
2. Hook and service abstractions that model user activity and goal access in reusable code

Reducing that split is still one of the best maintainability improvements left for code-quality scoring.

## Rules Source of Truth

Behavioral access control is enforced by `firestore.rules`, not by this document. When the schema evolves, update the rules and this file together.
