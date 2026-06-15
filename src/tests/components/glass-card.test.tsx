import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { GlassCard } from "@/components/ui/glass-card";

describe("GlassCard Component", () => {
  it("renders children correctly", () => {
    render(<GlassCard><div>Test Content</div></GlassCard>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("applies glow class when glow is true", () => {
    const { container } = render(<GlassCard glow>Content</GlassCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("shadow-[0_0_30px_-5px_var(--glow-color)]");
  });

  it("handles custom component types using 'as' prop", () => {
    render(<GlassCard as="section" aria-label="custom-section">Section Content</GlassCard>);
    const section = screen.getByRole("region", { name: "custom-section" });
    expect(section.tagName).toBe("SECTION");
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<GlassCard onClick={handleClick} role="button">Clickable</GlassCard>);
    fireEvent.click(screen.getByRole("button", { name: "Clickable" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
