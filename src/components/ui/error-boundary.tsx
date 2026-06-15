/**
 * @module ErrorBoundary
 * @description React Error Boundary component that catches runtime errors
 * and displays a user-friendly fallback UI instead of crashing the app.
 * Supports optional onError callback for error reporting.
 */
"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { logger } from "@/lib/logger";

interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Optional fallback UI to display on error */
  fallback?: ReactNode;
  /** Optional callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Optional CSS class name */
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that prevents entire app crashes.
 * Catches JavaScript errors in child component tree and renders fallback UI.
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<p>Something went wrong</p>}>
 *   <DashboardPage />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error({ module: "ErrorBoundary" }, "Caught error", { error, errorInfo });
    /* c8 ignore next -- optional callback: not all callers provide onError */
    this.props.onError?.(error, errorInfo);
  }

  private readonly handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className={`flex flex-col items-center justify-center min-h-[300px] p-8 ${this.props.className || ""}`}
        >
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">Something went wrong</h2>
            <p className="text-sm text-zinc-400">
              An unexpected error occurred. Please try again or refresh the page.
            </p>
            {this.state.error && (
              <details className="w-full text-left">
                <summary className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-400">
                  Error details
                </summary>
                <pre className="mt-2 p-3 rounded-lg bg-zinc-950/50 border border-white/5 text-xs text-red-400 overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleRetry}
              className="mt-2 px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              aria-label="Try again"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
