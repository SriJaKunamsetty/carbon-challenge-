import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";

expect.extend(toHaveNoViolations);

describe("Accessibility Tests", () => {
  it("Button has no a11y violations", async () => {
    const { container } = render(<Button aria-label="Submit Form">Submit</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    
    // Check focus-visible is present
    expect(container.innerHTML).toContain("focus-visible");
  });

  it("GlassCard supports semantic roles and labels", () => {
    render(
      <GlassCard as="section" aria-label="Widget" role="region">
        <p>Content</p>
      </GlassCard>
    );
    expect(screen.getByRole("region", { name: "Widget" })).toBeInTheDocument();
  });

  it("ProgressRing has correct progressbar semantics", () => {
    render(<ProgressRing score={75} aria-label="Score: 75" />);
    const ring = screen.getByRole("progressbar");
    expect(ring).toHaveAttribute("aria-valuenow", "75");
    expect(ring).toHaveAttribute("aria-valuemin", "0");
    expect(ring).toHaveAttribute("aria-valuemax", "100");
  });

  it("Skeleton has correct status semantics", () => {
    render(<Skeleton />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("ErrorBoundary error state has role=alert", () => {
    const Thrower = () => {
      throw new Error("Test error");
    };
    
    // Suppress expected console error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>
    );
    
    expect(screen.getByRole("alert")).toBeInTheDocument();
    spy.mockRestore();
  });
});
