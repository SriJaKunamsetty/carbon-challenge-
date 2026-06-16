/**
 * @module AICoachPageTests
 * @description Unit tests for the AI Coach page component.
 */
import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import AICoachPage from "@/app/dashboard/coach/page";

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock scrollIntoView
const mockScrollIntoView = vi.fn();
window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

describe("AICoachPage", () => {
  const mockProfile = {
    uid: "user-123",
    name: "John Doe",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ profile: mockProfile });
    globalThis.fetch = vi.fn();
    localStorage.clear();
  });

  it("renders welcome message initially", () => {
    render(<AICoachPage />);
    expect(screen.getByText("AI Sustainability Coach")).toBeInTheDocument();
    expect(screen.getByText(/I'm your/)).toBeInTheDocument();
    expect(screen.getByText(/CarbonMind AI Coach/)).toBeInTheDocument();
  });

  it("loads message history from localStorage if available", () => {
    const history = [
      { role: "assistant", content: "Hello there!" },
      { role: "user", content: "Hi coach" },
    ];
    localStorage.setItem("carbonmind_chat_history", JSON.stringify(history));

    render(<AICoachPage />);
    expect(screen.getByText("Hello there!")).toBeInTheDocument();
    expect(screen.getByText("Hi coach")).toBeInTheDocument();
  });

  it("sends a message and renders the AI response", async () => {
    const mockApiResponse = {
      response: "Try walking or cycling to reduce your transport emissions.",
    };
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });

    render(<AICoachPage />);
    
    const input = screen.getByPlaceholderText("Ask your Coach a question...");
    const submitButton = screen.getByLabelText("Send message");

    fireEvent.change(input, { target: { value: "How can I reduce emissions?" } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(screen.getByText("How can I reduce emissions?")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/ai", expect.any(Object));
      expect(screen.getByText(/Try walking or cycling/)).toBeInTheDocument();
    });
  });

  it("handles server/network failure gracefully", async () => {
    (globalThis.fetch as any).mockRejectedValue(new Error("Network error"));

    render(<AICoachPage />);
    
    const input = screen.getByPlaceholderText("Ask your Coach a question...");
    const submitButton = screen.getByLabelText("Send message");

    fireEvent.change(input, { target: { value: "Hello" } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/encountered a connection error/)).toBeInTheDocument();
    });
  });

  it("resets chat history when Reset Chat button is clicked", () => {
    const history = [
      { role: "assistant", content: "Hello there!" },
      { role: "user", content: "Hi coach" },
    ];
    localStorage.setItem("carbonmind_chat_history", JSON.stringify(history));

    render(<AICoachPage />);
    expect(screen.getByText("Hi coach")).toBeInTheDocument();

    const resetButton = screen.getByLabelText("Reset Chat");
    fireEvent.click(resetButton);

    expect(screen.queryByText("Hi coach")).not.toBeInTheDocument();
    const storedHistory = JSON.parse(localStorage.getItem("carbonmind_chat_history") || "[]");
    expect(storedHistory.length).toBe(1);
    expect(storedHistory[0].content).toContain("Hello John Doe");
  });
});
