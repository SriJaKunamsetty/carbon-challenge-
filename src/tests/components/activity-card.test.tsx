/**
 * @file activity-card.test.tsx
 * @description Unit tests for the ActivityCard component — covers all four
 * category icon branches, optional note rendering, and delete callback.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { ActivityCard, type LogEntry } from "@/components/tracker/activity-card";

const makeItem = (overrides: Partial<LogEntry> = {}): LogEntry => ({
  id: "entry-1",
  category: "transport",
  label: "Morning commute",
  value: 25,
  unit: "km",
  carbon: 5.75,
  date: "2026-06-01",
  ...overrides,
});

describe("ActivityCard", () => {
  it("renders label and value", () => {
    render(<ActivityCard item={makeItem()} onDelete={vi.fn()} />);
    expect(screen.getByText("Morning commute")).toBeInTheDocument();
    expect(screen.getByText(/25 km/)).toBeInTheDocument();
  });

  it("renders carbon value", () => {
    render(<ActivityCard item={makeItem()} onDelete={vi.fn()} />);
    expect(screen.getByText("5.75 kg CO2")).toBeInTheDocument();
  });

  it("renders note when present", () => {
    render(<ActivityCard item={makeItem({ note: "Via highway" })} onDelete={vi.fn()} />);
    expect(screen.getByText(/Via highway/)).toBeInTheDocument();
  });

  it("does not render note when absent", () => {
    render(<ActivityCard item={makeItem({ note: undefined })} onDelete={vi.fn()} />);
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("calls onDelete with the correct id when delete button clicked", () => {
    const onDelete = vi.fn();
    render(<ActivityCard item={makeItem({ id: "abc-123" })} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /Delete activity/i }));
    expect(onDelete).toHaveBeenCalledWith("abc-123");
  });

  it("renders food category icon branch", () => {
    render(<ActivityCard item={makeItem({ category: "food", label: "Lunch" })} onDelete={vi.fn()} />);
    expect(screen.getByText("Lunch")).toBeInTheDocument();
  });

  it("renders electricity category icon branch", () => {
    render(<ActivityCard item={makeItem({ category: "electricity", label: "AC usage" })} onDelete={vi.fn()} />);
    expect(screen.getByText("AC usage")).toBeInTheDocument();
  });

  it("renders shopping category icon branch", () => {
    render(<ActivityCard item={makeItem({ category: "shopping", label: "New jacket" })} onDelete={vi.fn()} />);
    expect(screen.getByText("New jacket")).toBeInTheDocument();
  });

  it("renders delete button with accessible label", () => {
    render(<ActivityCard item={makeItem({ label: "Evening run" })} onDelete={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /Delete activity Evening run/i })
    ).toBeInTheDocument();
  });

  it("renders date correctly", () => {
    render(<ActivityCard item={makeItem({ date: "2026-01-15" })} onDelete={vi.fn()} />);
    expect(screen.getByText(/2026-01-15/)).toBeInTheDocument();
  });
});
