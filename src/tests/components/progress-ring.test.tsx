import { render, screen } from "@testing-library/react";
import { ProgressRing } from "@/components/ui/progress-ring";

describe("ProgressRing", () => {
  it("has role=progressbar", () => {
    render(<ProgressRing score={75} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("has aria-valuenow matching score", () => {
    render(<ProgressRing score={82} />);
    const ring = screen.getByRole("progressbar");
    expect(ring).toHaveAttribute("aria-valuenow", "82");
  });

  it("has aria-valuemin=0", () => {
    render(<ProgressRing score={50} />);
    const ring = screen.getByRole("progressbar");
    expect(ring).toHaveAttribute("aria-valuemin", "0");
  });

  it("has aria-valuemax=100", () => {
    render(<ProgressRing score={50} />);
    const ring = screen.getByRole("progressbar");
    expect(ring).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders score text", () => {
    render(<ProgressRing score={65} />);
    expect(screen.getByText("65")).toBeInTheDocument();
  });

  it("shows rating label when showLabels=true", () => {
    render(<ProgressRing score={85} showLabels={true} />);
    expect(screen.getAllByText(/Excellent/i).length).toBeGreaterThan(0);
  });

  it("does not show rating label when showLabels=false", () => {
    const { container } = render(<ProgressRing score={85} showLabels={false} />);
    // The badge container (with mt-4 and text-center) should not be rendered
    const badgeContainer = container.querySelector('.mt-4.text-center');
    expect(badgeContainer).not.toBeInTheDocument();
  });

  it("has sr-only descriptive text", () => {
    render(<ProgressRing score={90} />);
    const srText = screen.getByText(/Your carbon score is 90 out of 100/);
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass("sr-only");
  });

  it("shows encouraging message for high scores", () => {
    render(<ProgressRing score={85} />);
    expect(
      screen.getByText(/Excellent work on reducing your carbon footprint/i)
    ).toBeInTheDocument();
  });

  it("shows improvement message for low scores", () => {
    render(<ProgressRing score={40} />);
    expect(
      screen.getByText(/room for improvement/i)
    ).toBeInTheDocument();
  });

  it("applies custom aria-label", () => {
    render(
      <ProgressRing
        score={50}
        aria-label="Custom label for progress"
      />
    );
    const ring = screen.getByRole("progressbar");
    expect(ring).toHaveAttribute(
      "aria-label",
      "Custom label for progress"
    );
  });

  it("renders Carbon Rating label", () => {
    render(<ProgressRing score={70} />);
    expect(screen.getByText("Carbon Rating")).toBeInTheDocument();
  });

  it("handles score of 0", () => {
    render(<ProgressRing score={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
    const ring = screen.getByRole("progressbar");
    expect(ring).toHaveAttribute("aria-valuenow", "0");
  });

  it("handles score of 100", () => {
    render(<ProgressRing score={100} />);
    expect(screen.getByText("100")).toBeInTheDocument();
    const ring = screen.getByRole("progressbar");
    expect(ring).toHaveAttribute("aria-valuenow", "100");
  });
});
