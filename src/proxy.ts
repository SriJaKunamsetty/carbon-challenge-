import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTE_PREFIX = "/dashboard";
const SESSION_COOKIE_NAME = "__session";
const LOGIN_PATH = "/login";

/**
 * Helper to check if a JWT token is structurally invalid or expired.
 */
function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    if (payload && typeof payload.exp === "number") {
      const currentTime = Math.floor(Date.now() / 1000);
      return currentTime >= payload.exp;
    }
    return false;
  } catch {
    return true;
  }
}

/**
 * Server-side route guard for dashboard pages.
 * Redirects unauthenticated requests before client bundles load.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith(PROTECTED_ROUTE_PREFIX)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value || isJwtExpired(sessionCookie.value)) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
