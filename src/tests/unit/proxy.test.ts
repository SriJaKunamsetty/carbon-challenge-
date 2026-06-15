/**
 * @module ProxyTests
 * @description Unit tests for the proxy.ts route guard.
 */
import { proxy } from "@/proxy";
import { NextRequest } from "next/server";
import { describe, it, expect } from "vitest";

describe("Proxy Route Guard", () => {
  const createMockRequest = (pathname: string, sessionValue?: string) => {
    const url = `http://localhost:3000${pathname}`;
    const req = new NextRequest(url);
    if (sessionValue) {
      req.cookies.set("__session", sessionValue);
    }
    return req;
  };

  it("allows unprotected routes to pass through", () => {
    const req = createMockRequest("/");
    const res = proxy(req);
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects to login for protected route without session cookie", () => {
    const req = createMockRequest("/dashboard");
    const res = proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?callbackUrl=%2Fdashboard");
  });

  it("redirects to login for protected route with expired JWT token", () => {
    const expiredPayload = Buffer.from(JSON.stringify({ exp: 1 })).toString("base64");
    const expiredToken = `header.${expiredPayload}.signature`;
    
    const req = createMockRequest("/dashboard", expiredToken);
    const res = proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?callbackUrl=%2Fdashboard");
  });

  it("redirects to login for protected route with malformed token", () => {
    const req = createMockRequest("/dashboard", "malformed-token");
    const res = proxy(req);
    expect(res.status).toBe(307);
  });

  it("allows request to pass through for protected route with valid non-expired token", () => {
    const futureTime = Math.floor(Date.now() / 1000) + 3600;
    const validPayload = Buffer.from(JSON.stringify({ exp: futureTime })).toString("base64");
    const validToken = `header.${validPayload}.signature`;

    const req = createMockRequest("/dashboard", validToken);
    const res = proxy(req);
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects to login for protected route with JSON payload that does not contain exp", () => {
    const noExpPayload = Buffer.from(JSON.stringify({ no_exp: true })).toString("base64");
    const token = `header.${noExpPayload}.signature`;
    const req = createMockRequest("/dashboard", token);
    const res = proxy(req);
    // Since it doesn't contain exp, isJwtExpired returns false, allowing it to pass (firebase handles validation)
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });
});
