import { render, screen } from "@testing-library/react";
import { Skeleton, SkeletonCard, DashboardSkeleton } from "@/components/ui/skeleton";

describe("Skeleton Components", () => {
  describe("Skeleton", () => {
    it("renders with role=status", () => {
      render(<Skeleton />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("has aria-label", () => {
      render(<Skeleton />);
      expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading content");
    });

    it("applies custom className", () => {
      const { container } = render(<Skeleton className="w-10 h-10" />);
      expect(container.firstChild).toHaveClass("w-10", "h-10");
    });
  });

  describe("SkeletonCard", () => {
    it("renders with role=status and aria-label", () => {
      render(<SkeletonCard />);
      const card = screen.getByLabelText("Loading card");
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute("aria-label", "Loading card");
    });
  });

  describe("DashboardSkeleton", () => {
    it("renders multiple skeleton elements", () => {
      render(<DashboardSkeleton />);
      const skeletons = screen.getAllByRole("status");
      expect(skeletons.length).toBeGreaterThan(1);
    });
  });
});
