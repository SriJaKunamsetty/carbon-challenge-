type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  readonly module: string;
}

function formatMessage(level: LogLevel, module: string, message: string): string {
  return `[${level.toUpperCase()}][${module}] ${message}`;
}

/**
 * Structured logger for consistent error reporting across the app.
 * Replaces ad-hoc console calls so production telemetry can be wired later.
 */
export const logger = {
  debug(context: LogContext, message: string, detail?: unknown): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(formatMessage("debug", context.module, message), detail ?? "");
    }
  },
  info(context: LogContext, message: string, detail?: unknown): void {
    console.info(formatMessage("info", context.module, message), detail ?? "");
  },
  warn(context: LogContext, message: string, detail?: unknown): void {
    console.warn(formatMessage("warn", context.module, message), detail ?? "");
  },
  error(context: LogContext, message: string, detail?: unknown): void {
    console.error(formatMessage("error", context.module, message), detail ?? "");
  },
};
