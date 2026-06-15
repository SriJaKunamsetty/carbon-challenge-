/**
 * @module CarbonTrackerPageTests
 * @description Unit tests for the carbon tracker page component.
 */
import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import CarbonTrackerPage from "@/app/dashboard/tracker/page";
import * as firestore from "firebase/firestore";

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock canvas-confetti
vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

describe("CarbonTrackerPage", () => {
  const mockProfile = {
    uid: "user-123",
  };

  const mockDocs = [
    {
      id: "act-1",
      data: () => ({
        userId: "user-123",
        category: "transport",
        type: "gasolineCar",
        value: 15,
        unit: "km",
        date: new Date("2026-06-12"),
        note: "Daily commute to work",
        carbonEmit: 2.7,
      }),
    },
    {
      id: "act-2",
      data: () => ({
        userId: "user-123",
        category: "food",
        type: "poultry",
        value: 1,
        unit: "servings",
        date: new Date("2026-06-11"),
        note: "Chicken lunch",
        carbonEmit: 1.1,
      }),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ profile: mockProfile });
    
    // Setup default mock implementation for getDocs
    vi.mocked(firestore.getDocs).mockResolvedValue({
      docs: mockDocs,
      empty: false,
      size: mockDocs.length,
    } as any);
  });

  it("renders page header and mock list correctly", async () => {
    await act(async () => {
      render(<CarbonTrackerPage />);
    });

    expect(screen.getByText("Carbon Tracker")).toBeInTheDocument();
    expect(screen.getByText("Daily commute to work")).toBeInTheDocument();
    expect(screen.getByText("Chicken lunch")).toBeInTheDocument();
  });

  it("filters entries based on category tab selection", async () => {
    await act(async () => {
      render(<CarbonTrackerPage />);
    });

    // When the component renders, it queries firestore.
    // Changing the category calls useEffect and triggers a new query.
    vi.mocked(firestore.getDocs).mockResolvedValueOnce({
      docs: [mockDocs[0]], // Only transport doc
      empty: false,
      size: 1,
    } as any);

    const transportTab = screen.getByRole("tab", { name: /transport/i });
    
    await act(async () => {
      fireEvent.click(transportTab);
    });

    expect(firestore.getDocs).toHaveBeenCalledTimes(2); // Initial load + tab click
  });

  it("deletes an entry when delete button is clicked", async () => {
    await act(async () => {
      render(<CarbonTrackerPage />);
    });

    const deleteButtons = screen.getAllByRole("button", { name: /delete activity/i });
    expect(deleteButtons.length).toBe(2);

    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    expect(firestore.deleteDoc).toHaveBeenCalled();
  });

  it("opens modal and allows adding a new activity entry", async () => {
    vi.mocked(firestore.addDoc).mockResolvedValueOnce({ id: "new-doc-id" } as any);

    await act(async () => {
      render(<CarbonTrackerPage />);
    });

    const addBtn = screen.getByRole("button", { name: /add activity/i });
    fireEvent.click(addBtn);

    // Modal forms should render
    expect(screen.getByText("Log Carbon Activity")).toBeInTheDocument();

    const noteInput = screen.getByLabelText(/note/i);
    const valueInput = screen.getByLabelText(/volume/i);
    const typeSelect = screen.getByLabelText(/type/i);
    const submitBtn = screen.getByRole("button", { name: /add entry/i });

    fireEvent.change(noteInput, { target: { value: "Weekend drive" } });
    fireEvent.change(valueInput, { target: { value: "30" } });
    fireEvent.change(typeSelect, { target: { value: "gasolineCar" } });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(firestore.addDoc).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        userId: "user-123",
        value: 30,
        note: "Weekend drive",
      })
    );
  });
});
