import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkipLink } from "@/components/ui/skip-link";
import { DonutChart } from "@/components/ui/charts/donut-chart";

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

  it("SkipLink has no a11y violations and renders with correct href", async () => {
    // Wrap in a landmark so the skip link target exists
    const { container } = render(
      <div>
        <SkipLink targetId="main-content" />
        <main id="main-content"><p>Main content</p></main>
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    const link = screen.getByText("Skip to main content");
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("SkipLink renders custom label correctly", () => {
    render(<SkipLink targetId="content" label="Jump to content" />);
    expect(screen.getByText("Jump to content")).toHaveAttribute("href", "#content");
  });

  it("Button renders with danger variant accessibly", async () => {
    const { container } = render(
      <Button variant="danger" aria-label="Delete item">Delete</Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Button in disabled state is accessible", async () => {
    const { container } = render(
      <Button disabled aria-label="Submit (unavailable)">Submit</Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.querySelector("button")).toBeDisabled();
  });

  it("DonutChart SVG has no a11y violations", async () => {
    const data = [
      { name: "Transport", value: 40, color: "#10B981" },
      { name: "Food", value: 30, color: "#F59E0B" },
      { name: "Electricity", value: 30, color: "#3B82F6" },
    ];
    const { container } = render(
      <div aria-label="Carbon breakdown chart">
        <DonutChart data={data} size={180} />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
