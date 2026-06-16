/**
 * @module middleware
 * @description Next.js Edge Middleware entry point.
 *
 * Next.js requires this file to be named exactly `middleware.ts` (or `middleware.js`)
 * placed at the project root or inside `src/`. Any other filename is silently ignored.
 *
 * This module re-exports the route guard implementation from `src/proxy.ts`
 * so it can be properly registered by Next.js as Edge Middleware.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 * @see src/proxy.ts for the full route guard implementation and JWT expiry logic
 */
export { proxy as middleware, config } from "./proxy";
