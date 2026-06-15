import { parseCarbonLog, getCoachResponse } from "@/lib/mock-ai";
import { mockProfile } from "../test-utils";

describe("parseCarbonLog", () => {
  describe("transport parsing", () => {
    it("parses car travel with distance", () => {
      const result = parseCarbonLog("I drove 20 km by car");
      expect(result.categoryMatches.transport.length).toBeGreaterThanOrEqual(1);
      const carMatch = result.categoryMatches.transport.find(
        (t) => t.mode === "gasolineCar"
      );
      expect(carMatch).toBeDefined();
      expect(carMatch!.distanceKm).toBeGreaterThan(0);
      expect(carMatch!.carbon).toBeGreaterThan(0);
    });

    it("parses bus travel", () => {
      const result = parseCarbonLog("Took the bus for 10 km");
      const busMatch = result.categoryMatches.transport.find(
        (t) => t.mode === "bus"
      );
      expect(busMatch).toBeDefined();
      expect(busMatch!.carbon).toBeGreaterThan(0);
    });

    it("parses bicycle travel with zero emissions", () => {
      const result = parseCarbonLog("Cycled 5 km on my bicycle");
      const bikeMatch = result.categoryMatches.transport.find(
        (t) => t.mode === "bicycle"
      );
      expect(bikeMatch).toBeDefined();
      expect(bikeMatch!.carbon).toBe(0);
    });

    it("parses flight with default distance", () => {
      const result = parseCarbonLog("I took a flight today");
      expect(result.categoryMatches.transport.length).toBeGreaterThanOrEqual(1);
      const flightMatch = result.categoryMatches.transport.find(
        (t) => t.mode === "flightShort" || t.mode === "flightLong"
      );
      expect(flightMatch).toBeDefined();
      expect(flightMatch!.carbon).toBeGreaterThan(0);
    });
  });

  describe("food parsing", () => {
    it("parses beef consumption", () => {
      const result = parseCarbonLog("I ate beef steak for lunch");
      const beefMatch = result.categoryMatches.food.find(
        (f) => f.type === "beef"
      );
      expect(beefMatch).toBeDefined();
      expect(beefMatch!.carbon).toBeGreaterThan(0);
    });

    it("parses poultry consumption", () => {
      const result = parseCarbonLog("Had chicken biryani for dinner");
      const poultryMatch = result.categoryMatches.food.find(
        (f) => f.type === "poultry"
      );
      expect(poultryMatch).toBeDefined();
      expect(poultryMatch!.servings).toBeGreaterThanOrEqual(1);
    });

    it("parses vegetable consumption", () => {
      const result = parseCarbonLog("Ate a big salad with vegetables");
      const vegMatch = result.categoryMatches.food.find(
        (f) => f.type === "vegetables"
      );
      expect(vegMatch).toBeDefined();
      expect(vegMatch!.carbon).toBeGreaterThan(0);
    });

    it("parses multiple food items", () => {
      const result = parseCarbonLog(
        "Had beef steak and a salad with vegetables"
      );
      expect(result.categoryMatches.food.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("electricity parsing", () => {
    it("parses AC usage with hours", () => {
      const result = parseCarbonLog("Used air conditioner for 3 hours");
      const acMatch = result.categoryMatches.electricity.find(
        (e) => e.type === "airConditioner"
      );
      expect(acMatch).toBeDefined();
      expect(acMatch!.hours).toBe(3);
      expect(acMatch!.carbon).toBeGreaterThan(0);
    });

    it("parses heater usage", () => {
      const result = parseCarbonLog("Ran the heater for 2 hours");
      const heaterMatch = result.categoryMatches.electricity.find(
        (e) => e.type === "heater"
      );
      expect(heaterMatch).toBeDefined();
      expect(heaterMatch!.carbon).toBeGreaterThan(0);
    });

    it("parses TV usage via 'netflix' keyword", () => {
      const result = parseCarbonLog("Watched netflix for 4 hours");
      const tvMatch = result.categoryMatches.electricity.find(
        (e) => e.type === "television"
      );
      expect(tvMatch).toBeDefined();
    });
  });

  describe("shopping parsing", () => {
    it("parses clothing purchase", () => {
      const result = parseCarbonLog("Bought a new shirt");
      const clothingMatch = result.categoryMatches.shopping.find(
        (s) => s.category === "clothing"
      );
      expect(clothingMatch).toBeDefined();
      expect(clothingMatch!.carbon).toBeGreaterThan(0);
    });

    it("parses electronics purchase", () => {
      const result = parseCarbonLog("Purchased a new phone");
      const electronicsMatch = result.categoryMatches.shopping.find(
        (s) => s.category === "electronics"
      );
      expect(electronicsMatch).toBeDefined();
      expect(electronicsMatch!.carbon).toBe(120);
    });
  });

  describe("total carbon computation", () => {
    it("totalCarbon is non-negative", () => {
      const result = parseCarbonLog("Drove 10 km and ate beef");
      expect(result.totalCarbon).toBeGreaterThanOrEqual(0);
    });

    it("totalCarbon equals sum of all category emissions", () => {
      const result = parseCarbonLog("Drove 10 km by car and ate a salad");
      let sum = 0;
      result.categoryMatches.transport.forEach((t) => (sum += t.carbon));
      result.categoryMatches.food.forEach((f) => (sum += f.carbon));
      result.categoryMatches.electricity.forEach((e) => (sum += e.carbon));
      result.categoryMatches.shopping.forEach((s) => (sum += s.carbon));
      expect(result.totalCarbon).toBeCloseTo(
        Math.round(sum * 100) / 100,
        2
      );
    });
  });

  describe("edge cases", () => {
    it("returns no matches and helpful explanation for empty input", () => {
      const result = parseCarbonLog("");
      expect(result.totalCarbon).toBe(0);
      expect(result.explanation).toContain("No carbon-emitting activities");
    });

    it("returns no matches for gibberish input", () => {
      const result = parseCarbonLog("asdfghjkl qwerty zxcvbnm");
      expect(result.totalCarbon).toBe(0);
      expect(result.categoryMatches.transport).toHaveLength(0);
      expect(result.categoryMatches.food).toHaveLength(0);
    });

    it("handles very long input without crashing", () => {
      const longText = "I drove 10 km by car. ".repeat(500);
      const result = parseCarbonLog(longText);
      expect(result.totalCarbon).toBeGreaterThanOrEqual(0);
      expect(typeof result.explanation).toBe("string");
    });
  });
});

describe("getCoachResponse", () => {
  describe("greeting intents", () => {
    it("responds to 'hello' with user name and score", () => {
      const response = getCoachResponse([], "hello there", mockProfile);
      expect(response).toContain("Alice");
      expect(response).toContain("CarbonMind AI Coach");
      expect(response).toContain("75");
    });

    it("responds to 'hey' greeting", () => {
      const response = getCoachResponse([], "hey", mockProfile);
      expect(response).toContain("CarbonMind AI Coach");
    });

    it("uses 'Eco Friend' when profile is null", () => {
      const response = getCoachResponse([], "hello there", null);
      expect(response).toContain("Eco Friend");
    });
  });

  describe("reduction tips", () => {
    it("provides a reduction roadmap when asked to reduce", () => {
      const response = getCoachResponse([], "How can I reduce my footprint?", mockProfile);
      expect(response).toContain("Reduction Roadmap");
      expect(response).toContain("Transportation");
    });

    it("responds to 'plan' keyword", () => {
      const response = getCoachResponse([], "Give me a plan", mockProfile);
      expect(response).toContain("Reduction Roadmap");
    });
  });

  describe("food advice", () => {
    it("provides food footprint breakdown when asked about diet", () => {
      const response = getCoachResponse([], "What should I eat?", mockProfile);
      expect(response).toContain("Beef");
      expect(response).toContain("6.5");
    });

    it("responds to 'vegan' keyword", () => {
      const response = getCoachResponse([], "Should I go vegan?", mockProfile);
      expect(response).toContain("Dietary");
    });
  });

  describe("energy/electricity advice", () => {
    it("provides energy advice for electricity query", () => {
      const response = getCoachResponse(
        [],
        "How to save electricity at home?",
        mockProfile
      );
      expect(response).toContain("Air Conditioning");
      expect(response).toContain("Heating");
    });
  });

  describe("explanation of carbon footprint", () => {
    it("explains what carbon footprint is", () => {
      const response = getCoachResponse(
        [],
        "What is a carbon footprint?",
        mockProfile
      );
      expect(response).toContain("Carbon Footprint");
      expect(response).toContain("greenhouse gas emissions");
    });
  });

  describe("fallback response", () => {
    it("provides a default response for unrecognized input", () => {
      const response = getCoachResponse(
        [],
        "random unrelated message",
        mockProfile
      );
      expect(response).toContain("Alice");
      expect(response).toContain("Small Gains");
    });

    it("includes streak info in fallback", () => {
      const response = getCoachResponse(
        [],
        "something random",
        mockProfile
      );
      expect(response).toContain("5 days");
    });
  });

  describe("edge cases", () => {
    it("handles empty message gracefully (fallback)", () => {
      const response = getCoachResponse([], "", mockProfile);
      expect(typeof response).toBe("string");
      expect(response.length).toBeGreaterThan(0);
    });

    it("handles null profile", () => {
      const response = getCoachResponse([], "hello there", null);
      expect(response).toContain("Eco Friend");
    });
  });
});
