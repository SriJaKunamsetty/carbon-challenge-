/**
 * @file parsed-result-card.test.tsx
 * @description Tests for the ParsedResultCard component — covers rendering
 * all category match branches, empty state, total display, and callbacks.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ParsedResultCard,
  type ParsedResultCardProps,
  type ParsedLogResult,
} from "@/components/log/parsed-result-card";

const emptyResult: ParsedLogResult = {
  totalCarbon: 0,
  categoryMatches: { transport: [], food: [], electricity: [], shopping: [] },
};

const fullResult: ParsedLogResult = {
  totalCarbon: 42.5,
  categoryMatches: {
    transport: [{ mode: "car", distanceKm: 50, carbon: 10.5 }],
    food: [{ type: "beef", servings: 2, carbon: 13.6 }],
    electricity: [{ type: "AC", hours: 8, carbon: 12.4 }],
    shopping: [{ category: "electronics", count: 1, carbon: 6.0 }],
  },
};

const defaultProps: ParsedResultCardProps = {
  parsedResult: emptyResult,
  loading: false,
  onDiscard: vi.fn(),
  onCommit: vi.fn(),
};

describe("ParsedResultCard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows empty state message when no categories matched", () => {
    render(<ParsedResultCard {...defaultProps} />);
    expect(
      screen.getByText(/No matching carbon activities/i)
    ).toBeInTheDocument();
  });

  it("renders total carbon value", () => {
    render(<ParsedResultCard {...defaultProps} parsedResult={fullResult} />);
    expect(screen.getByText("42.5 kg CO2")).toBeInTheDocument();
  });

  it("renders transport item", () => {
    render(<ParsedResultCard {...defaultProps} parsedResult={fullResult} />);
    expect(screen.getByText("Transit: car")).toBeInTheDocument();
    expect(screen.getByText("50 km traveled")).toBeInTheDocument();
  });

  it("renders food item", () => {
    render(<ParsedResultCard {...defaultProps} parsedResult={fullResult} />);
    expect(screen.getByText("Diet: beef")).toBeInTheDocument();
    expect(screen.getByText("2 serving(s)")).toBeInTheDocument();
  });

  it("renders electricity item", () => {
    render(<ParsedResultCard {...defaultProps} parsedResult={fullResult} />);
    expect(screen.getByText("Utility: AC")).toBeInTheDocument();
    expect(screen.getByText("8 hours running")).toBeInTheDocument();
  });

  it("renders shopping item", () => {
    render(<ParsedResultCard {...defaultProps} parsedResult={fullResult} />);
    expect(screen.getByText("Purchase: electronics")).toBeInTheDocument();
    expect(screen.getByText("1 item(s)")).toBeInTheDocument();
  });

  it("calls onDiscard when Discard button is clicked", () => {
    const onDiscard = vi.fn();
    render(<ParsedResultCard {...defaultProps} parsedResult={fullResult} onDiscard={onDiscard} />);
    fireEvent.click(screen.getByRole("button", { name: /Discard log/i }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it("calls onCommit when Log Habits button is clicked", () => {
    const onCommit = vi.fn();
    render(<ParsedResultCard {...defaultProps} parsedResult={fullResult} onCommit={onCommit} />);
    fireEvent.click(screen.getByRole("button", { name: /Log these habits/i }));
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it("disables Log Habits button when loading is true", () => {
    render(<ParsedResultCard {...defaultProps} parsedResult={fullResult} loading={true} />);
    expect(screen.getByRole("button", { name: /Log these habits/i })).toBeDisabled();
  });

  it("does not show empty-state message when categories are present", () => {
    render(<ParsedResultCard {...defaultProps} parsedResult={fullResult} />);
    expect(screen.queryByText(/No matching carbon activities/i)).not.toBeInTheDocument();
  });

  it("has accessible region label", () => {
    render(<ParsedResultCard {...defaultProps} />);
    expect(screen.getByRole("region", { name: /AI Parsing Breakdown/i })).toBeInTheDocument();
  });
});
