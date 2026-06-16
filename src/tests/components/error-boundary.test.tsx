import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "@/components/ui/error-boundary";

// Suppress expected console errors from React error boundary during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Error thrown for testing")) {
      return;
    }
    originalConsoleError(...args);
  };
});
afterAll(() => {
  console.error = originalConsoleError;
});

const ErrorThrower = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Error thrown for testing");
  }
  return <div>Safe content</div>;
};

describe("ErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ErrorThrower shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Safe content")).toBeInTheDocument();
  });

  it("shows fallback UI on error", () => {
    render(
      <ErrorBoundary>
        <ErrorThrower shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  it("shows custom fallback when provided", () => {
    const CustomFallback = <div>Custom error message</div>;
    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ErrorThrower shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("calls onError callback", () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ErrorThrower shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalled();
  });

  it("recovers when the Try Again button is clicked", async () => {
    const user = userEvent.setup();
    // Render with a controllable component so we can swap shouldThrow
    let throwError = true;
    const RecoverableThrower = () => {
      if (throwError) throw new Error("Error thrown for testing");
      return <div>Recovered content</div>;
    };

    render(
      <ErrorBoundary>
        <RecoverableThrower />
      </ErrorBoundary>
    );

    // Boundary should show the error UI
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();

    // Simulate fix: stop throwing, then click retry
    throwError = false;
    await user.click(screen.getByRole("button", { name: /try again/i }));

    // After retry the boundary should render children normally
    expect(screen.getByText("Recovered content")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
