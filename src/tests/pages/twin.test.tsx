/**
 * @file twin.test.tsx
 * @description Page-level tests for the Carbon Twin simulator dashboard page.
 * Verifies that the page renders simulation controls, results, and chart data
 * correctly given a mocked useTwinSimulation hook.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mock next/dynamic ──────────────────────────────────────────────────────
vi.mock("next/dynamic", () => ({
  default: () => {
    const MockBarChart = () => <div data-testid="bar-chart">BarChart</div>;
    MockBarChart.displayName = "MockBarChart";
    return MockBarChart;
  },
}));

// ── Mock AuthContext ────────────────────────────────────────────────────────
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { uid: "test-user", displayName: "Test User" },
    profile: { name: "Test User", carbonScore: 72 },
    loading: false,
  }),
}));

// ── Mock useTwinSimulation ─────────────────────────────────────────────────
vi.mock("@/hooks/useTwinSimulation", () => ({
  useTwinSimulation: () => ({
    transitDays: 3,
    acReduction: 30,
    vegMealsSwaps: 2,
    renewableUtility: false,
    useEV: false,
    setTransitDays: vi.fn(),
    setAcReduction: vi.fn(),
    setVegMealsSwaps: vi.fn(),
    setRenewableUtility: vi.fn(),
    setUseEV: vi.fn(),
    baselineTotal: 420,
    carbonSaved: 65.4,
    moneySaved: 1200,
    treesEquivalent: 3,
    scoreImprovement: 8,
    chartData: [
      { label: "Baseline", value: 420 },
      { label: "Simulated", value: 354.6 },
    ],
  }),
}));

// ── Mock GlassCard ─────────────────────────────────────────────────────────
vi.mock("@/components/ui/glass-card", () => ({
  GlassCard: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

// ── Mock Skeleton ──────────────────────────────────────────────────────────
vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div className={className} data-testid="skeleton" />
  ),
}));

import CarbonTwinPage from "@/app/dashboard/twin/page";

describe("CarbonTwinPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page heading and description", () => {
    render(<CarbonTwinPage />);
    expect(screen.getByText("AI Carbon Twin")).toBeInTheDocument();
    expect(screen.getByText(/simulate carbon-reduction scenarios/i)).toBeInTheDocument();
  });

  it("renders all simulation control labels", () => {
    render(<CarbonTwinPage />);
    expect(screen.getByText(/Swap Car for Bike\/Transit/i)).toBeInTheDocument();
    expect(screen.getByText(/Reduce AC Usage/i)).toBeInTheDocument();
    expect(screen.getByText(/Vegetarian.*Meal Swap/i)).toBeInTheDocument();
    expect(screen.getByText(/Renewable Energy Offset/i)).toBeInTheDocument();
    expect(screen.getByText(/Switch to EV driving/i)).toBeInTheDocument();
  });

  it("displays simulated carbon savings from mock hook", () => {
    render(<CarbonTwinPage />);
    // 65.4 kg saved — appears in results panel
    expect(screen.getByText(/65\.4/)).toBeInTheDocument();
  });

  it("displays money saved value", () => {
    render(<CarbonTwinPage />);
    expect(screen.getByText(/\$1200\/mo|\$1,200/)).toBeInTheDocument();
  });

  it("displays trees equivalent value", () => {
    render(<CarbonTwinPage />);
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it("displays score improvement value", () => {
    render(<CarbonTwinPage />);
    expect(screen.getByText(/\+8|8 pts/i)).toBeInTheDocument();
  });

  it("renders range inputs with accessible labels", () => {
    render(<CarbonTwinPage />);
    const transitInput = screen.getByRole("slider", { name: /swap car for bike\/transit/i });
    expect(transitInput).toBeInTheDocument();
    expect(transitInput).toHaveAttribute("type", "range");
  });

  it("renders the Simulation Variables section heading", () => {
    render(<CarbonTwinPage />);
    expect(screen.getByText(/simulation variables/i)).toBeInTheDocument();
  });
});
