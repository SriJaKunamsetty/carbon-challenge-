import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  describe("merging class names", () => {
    it("merges multiple class strings", () => {
      const result = cn("text-red-500", "font-bold");
      expect(result).toContain("text-red-500");
      expect(result).toContain("font-bold");
    });

    it("returns single class unchanged", () => {
      expect(cn("text-red-500")).toBe("text-red-500");
    });

    it("returns empty string for no arguments", () => {
      expect(cn()).toBe("");
    });
  });

  describe("conditional classes", () => {
    it("includes class when condition is true", () => {
      const isActive = true;
      const result = cn("base", isActive && "active");
      expect(result).toContain("active");
    });

    it("excludes class when condition is false", () => {
      const isActive = false;
      const result = cn("base", isActive && "active");
      expect(result).not.toContain("active");
    });

    it("handles object syntax for conditionals", () => {
      const result = cn({ "bg-red-500": true, "bg-blue-500": false });
      expect(result).toContain("bg-red-500");
      expect(result).not.toContain("bg-blue-500");
    });
  });

  describe("falsy values", () => {
    it("ignores undefined", () => {
      const result = cn("base", undefined);
      expect(result).toBe("base");
    });

    it("ignores null", () => {
      const result = cn("base", null);
      expect(result).toBe("base");
    });

    it("ignores false", () => {
      const result = cn("base", false);
      expect(result).toBe("base");
    });

    it("ignores empty string", () => {
      const result = cn("base", "");
      expect(result).toBe("base");
    });

    it("ignores 0", () => {
      const result = cn("base", 0);
      expect(result).toBe("base");
    });
  });

  describe("Tailwind merge behavior", () => {
    it("resolves conflicting Tailwind classes (last wins)", () => {
      const result = cn("px-4", "px-8");
      expect(result).toBe("px-8");
      expect(result).not.toContain("px-4");
    });

    it("resolves conflicting text colors", () => {
      const result = cn("text-red-500", "text-blue-500");
      expect(result).toBe("text-blue-500");
    });

    it("keeps non-conflicting classes", () => {
      const result = cn("text-red-500", "bg-blue-500", "font-bold");
      expect(result).toContain("text-red-500");
      expect(result).toContain("bg-blue-500");
      expect(result).toContain("font-bold");
    });
  });

  describe("arrays", () => {
    it("handles arrays of class names", () => {
      const result = cn(["text-red-500", "font-bold"]);
      expect(result).toContain("text-red-500");
      expect(result).toContain("font-bold");
    });
  });
});
