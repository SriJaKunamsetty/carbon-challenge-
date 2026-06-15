import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  it("renders with correct default text and variant", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole("button", { name: "Click Me" });
    expect(button).toBeInTheDocument();
    // Default size 'md' has these classes in sizeStyles
    expect(button.className).toContain("px-6 py-2.5");
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Click Me" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Click Me</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Click Me" }));
    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Click Me" })).toBeDisabled();
  });

  it("renders loader and sets aria-busy when loading", () => {
    render(<Button loading>Submit</Button>);
    const button = screen.getByRole("button", { name: /Submit/i });
    expect(button).toHaveAttribute("aria-busy", "true");
    // Loading state disables the button
    expect(button).toBeDisabled();
    // Screen reader loading text
    expect(screen.getByText("Loading, please wait...")).toBeInTheDocument();
  });

  it("applies variant and size styles correctly", () => {
    render(
      <Button variant="danger" size="sm">
        Delete
      </Button>
    );
    const button = screen.getByRole("button", { name: "Delete" });
    // danger variant styles - uses hover:bg-red-500/20 and border-red-500/20
    expect(button.className).toContain("hover:bg-red-500/20");
    // sm size styles
    expect(button.className).toContain("px-4 py-1.5");
  });
});
