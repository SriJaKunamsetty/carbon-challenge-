import { vi } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
  const originalEnv = process.env.NODE_ENV;
  let debugSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    (process.env as any).NODE_ENV = originalEnv;
    debugSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("writes debug logs only in development", () => {
    (process.env as any).NODE_ENV = "development";
    logger.debug({ module: "tracker" }, "fetch started", { page: 1 });

    expect(debugSpy).toHaveBeenCalledWith("[DEBUG][tracker] fetch started", { page: 1 });

    (process.env as any).NODE_ENV = "test";
    logger.debug({ module: "tracker" }, "fetch skipped");

    expect(debugSpy).toHaveBeenCalledTimes(1);
  });

  it("writes info, warn, and error logs with a consistent format", () => {
    logger.info({ module: "auth" }, "signed in");
    logger.warn({ module: "settings" }, "notifications disabled", { source: "browser" });
    logger.error({ module: "ai" }, "request failed", new Error("boom"));

    expect(infoSpy).toHaveBeenCalledWith("[INFO][auth] signed in", "");
    expect(warnSpy).toHaveBeenCalledWith("[WARN][settings] notifications disabled", { source: "browser" });
    expect(errorSpy).toHaveBeenCalledWith("[ERROR][ai] request failed", expect.any(Error));
  });
});
