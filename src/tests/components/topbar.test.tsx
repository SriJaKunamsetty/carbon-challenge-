import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { Topbar } from "@/components/dashboard/topbar";
import { useAuth } from "@/context/AuthContext";

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

describe("Topbar", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      profile: {
        uid: "user-1",
        name: "John Doe",
        email: "john@example.com",
        photoURL: null,
        streak: 5,
        points: 100,
      },
    } as ReturnType<typeof useAuth>);
  });

  it("renders profile summary data", () => {
    render(<Topbar />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("5 DAY STREAK")).toBeInTheDocument();
    expect(screen.getByText("100 ECO XP")).toBeInTheDocument();
  });

  it("opens notifications and marks alerts as read", () => {
    render(<Topbar />);

    fireEvent.click(screen.getByRole("button", { name: "Toggle notifications" }));

    expect(screen.getByText("Streak Multiplier Active")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Mark all read" }));

    expect(screen.queryByRole("button", { name: "Mark all read" })).not.toBeInTheDocument();
  });

  it("opens the profile menu", () => {
    render(<Topbar />);

    fireEvent.click(screen.getByRole("button", { name: "Toggle profile menu" }));

    expect(screen.getByText("Green Level: Pioneer")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("closes dropdown menus when Escape key is pressed", () => {
    render(<Topbar />);

    fireEvent.click(screen.getByRole("button", { name: "Toggle profile menu" }));
    expect(screen.getByText("Green Level: Pioneer")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByText("Green Level: Pioneer")).not.toBeInTheDocument();
  });

  it("allows tab focus on notification and profile buttons", () => {
    render(<Topbar />);
    const notifBtn = screen.getByRole("button", { name: "Toggle notifications" });
    const profileBtn = screen.getByRole("button", { name: "Toggle profile menu" });
    
    notifBtn.focus();
    expect(document.activeElement).toBe(notifBtn);
    
    profileBtn.focus();
    expect(document.activeElement).toBe(profileBtn);
  });
});
