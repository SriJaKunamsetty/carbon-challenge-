/**
 * @module DashboardPageTests
 * @description Unit tests for the dashboard page component.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import DashboardPage from "@/app/dashboard/page";

// Mock next/dynamic to load components synchronously or render placeholders
vi.mock("next/dynamic", () => ({
  default: (loader: () => Promise<any>) => {
    const Component = (props: any) => {
      return <div data-testid="lazy-chart" {...props} />;
    };
    Component.displayName = "LazyChart";
    return Component;
  },
}));

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock hooks
const mockUseActivities = vi.fn();
const mockUseCarbonScore = vi.fn();
const mockUseMonthlyReport = vi.fn();
const mockUseLeaderboard = vi.fn();

vi.mock("@/hooks", () => ({
  useActivities: () => mockUseActivities(),
  useCarbonScore: (activities: any) => mockUseCarbonScore(activities),
  useMonthlyReport: (activities: any) => mockUseMonthlyReport(activities),
  useLeaderboard: () => mockUseLeaderboard(),
  useReducedMotion: () => false,
}));

describe("DashboardPage", () => {
  const mockProfile = {
    uid: "user-123",
    name: "John Doe",
    goal: 300,
  };

  const mockActivities = [
    { id: "act-1", category: "transport", carbonEmit: 10, date: new Date().toISOString() },
  ];

  const mockCarbonScore = {
    score: 85,
    todayCarbon: 5,
    weeklyCarbon: 35,
    monthlyCarbon: 120,
    yearlyProjected: 1.4,
    categoryBreakdown: [
      { category: "transport", totalCarbon: 50 },
      { category: "food", totalCarbon: 40 },
      { category: "electricity", totalCarbon: 20 },
      { category: "shopping", totalCarbon: 10 },
    ],
    trend: [
      { date: new Date().toISOString(), carbon: 10 },
    ],
  };

  const mockMonthlyReport = {
    grade: "A-",
    gradeExplanation: "Great progress this month!",
    prevMonthlyCarbon: 150,
    monthlyCarbon: 120,
    comparisonPercent: -20,
  };

  const mockLeaderboard = {
    entries: [
      { userId: "user-123", name: "John Doe", carbonScore: 85, rank: 1, streak: 3 },
      { userId: "user-456", name: "Jane Smith", carbonScore: 80, rank: 2, streak: 2 },
    ],
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ profile: mockProfile });
    mockUseActivities.mockReturnValue({ activities: mockActivities, loading: false });
    mockUseCarbonScore.mockReturnValue(mockCarbonScore);
    mockUseMonthlyReport.mockReturnValue(mockMonthlyReport);
    mockUseLeaderboard.mockReturnValue(mockLeaderboard);
  });

  it("renders loading skeleton when hook is loading", () => {
    mockUseActivities.mockReturnValueOnce({ activities: [], loading: true });
    render(<DashboardPage />);
    expect(screen.getAllByRole("status")[0]).toBeInTheDocument();
  });

  it("renders welcome banner and stats correctly", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Welcome back, John Doe")).toBeInTheDocument();
    expect(screen.getByText("Your carbon score is 85. Let's improve it today.")).toBeInTheDocument();
    
    // Stats cards
    expect(screen.getByText("5 kg")).toBeInTheDocument();
    expect(screen.getByText("35 kg")).toBeInTheDocument();
    expect(screen.getAllByText("120 kg")[0]).toBeInTheDocument();
    expect(screen.getByText("1.4 t")).toBeInTheDocument();
  });

  it("renders charts and report card components", () => {
    render(<DashboardPage />);
    
    // Check charts placeholder
    const charts = screen.getAllByTestId("lazy-chart");
    expect(charts.length).toBeGreaterThan(0);

    // Monthly Report Card
    expect(screen.getByText("Monthly Eco-Report Card")).toBeInTheDocument();
    expect(screen.getByText("A-")).toBeInTheDocument();
    expect(screen.getByText("Great progress this month!")).toBeInTheDocument();
    expect(screen.getByText("-20%")).toBeInTheDocument();
  });

  it("provides correct AI recommendation based on highest emissions", () => {
    // Highest category is transport (50)
    render(<DashboardPage />);
    expect(screen.getByText("Try Public Transit")).toBeInTheDocument();
    expect(screen.getByText(/Transport is your highest emission source/)).toBeInTheDocument();
  });

  it("recommends vegetarian diet if food is highest emissions", () => {
    // Set food highest
    const foodHighestScore = {
      ...mockCarbonScore,
      categoryBreakdown: [
        { category: "transport", totalCarbon: 10 },
        { category: "food", totalCarbon: 100 },
      ],
    };
    mockUseCarbonScore.mockReturnValueOnce(foodHighestScore);
    render(<DashboardPage />);
    expect(screen.getByText("Meatless Mondays")).toBeInTheDocument();
    expect(screen.getByText(/Swapping one beef meal per week/)).toBeInTheDocument();
  });

  it("recommends eco cooling mode if utilities/electricity is highest emissions", () => {
    // Set electricity highest
    const electricityHighestScore = {
      ...mockCarbonScore,
      categoryBreakdown: [
        { category: "transport", totalCarbon: 10 },
        { category: "electricity", totalCarbon: 100 },
      ],
    };
    mockUseCarbonScore.mockReturnValueOnce(electricityHighestScore);
    render(<DashboardPage />);
    expect(screen.getByText("Switch AC to Eco Mode")).toBeInTheDocument();
    expect(screen.getByText(/Setting your AC to run 1 hour less/)).toBeInTheDocument();
  });
});
