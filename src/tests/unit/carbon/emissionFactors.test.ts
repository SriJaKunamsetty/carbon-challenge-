
import { EMISSION_FACTORS } from "@/lib/carbon/emissionFactors";

describe("EMISSION_FACTORS", () => {
  describe("transport factors", () => {
    const expectedKeys = [
      "gasolineCar",
      "electricCar",
      "motorcycle",
      "bus",
      "train",
      "flightShort",
      "flightLong",
      "bicycle",
      "walking",
    ] as const;

    it("has all expected transport keys", () => {
      for (const key of expectedKeys) {
        expect(EMISSION_FACTORS.transport).toHaveProperty(key);
      }
    });

    it("all transport values are non-negative numbers", () => {
      for (const key of expectedKeys) {
        const value = EMISSION_FACTORS.transport[key];
        expect(typeof value).toBe("number");
        expect(value).toBeGreaterThanOrEqual(0);
      }
    });

    it("bicycle and walking have zero emissions", () => {
      expect(EMISSION_FACTORS.transport.bicycle).toBe(0);
      expect(EMISSION_FACTORS.transport.walking).toBe(0);
    });

    it("gasoline car emits more than electric car", () => {
      expect(EMISSION_FACTORS.transport.gasolineCar).toBeGreaterThan(
        EMISSION_FACTORS.transport.electricCar
      );
    });

    it("transport values are within reasonable range (0 to 1 kg CO2/km)", () => {
      for (const key of expectedKeys) {
        expect(EMISSION_FACTORS.transport[key]).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("food factors", () => {
    const expectedKeys = [
      "beef",
      "poultry",
      "pork",
      "fish",
      "dairy",
      "vegetables",
      "grains",
    ] as const;

    it("has all expected food keys", () => {
      for (const key of expectedKeys) {
        expect(EMISSION_FACTORS.food).toHaveProperty(key);
      }
    });

    it("all food values are positive numbers", () => {
      for (const key of expectedKeys) {
        const value = EMISSION_FACTORS.food[key];
        expect(typeof value).toBe("number");
        expect(value).toBeGreaterThan(0);
      }
    });

    it("beef has highest food emissions", () => {
      for (const key of expectedKeys) {
        expect(EMISSION_FACTORS.food.beef).toBeGreaterThanOrEqual(
          EMISSION_FACTORS.food[key]
        );
      }
    });

    it("food values are within reasonable range (0.1 to 10 kg CO2/serving)", () => {
      for (const key of expectedKeys) {
        expect(EMISSION_FACTORS.food[key]).toBeGreaterThanOrEqual(0.1);
        expect(EMISSION_FACTORS.food[key]).toBeLessThanOrEqual(10);
      }
    });
  });

  describe("electricity factors", () => {
    const expectedKeys = ["standardGrid", "solar", "wind"] as const;

    it("has all expected electricity keys", () => {
      for (const key of expectedKeys) {
        expect(EMISSION_FACTORS.electricity).toHaveProperty(key);
      }
    });

    it("all electricity values are positive numbers", () => {
      for (const key of expectedKeys) {
        expect(EMISSION_FACTORS.electricity[key]).toBeGreaterThan(0);
      }
    });

    it("grid emissions are higher than renewable sources", () => {
      expect(EMISSION_FACTORS.electricity.standardGrid).toBeGreaterThan(
        EMISSION_FACTORS.electricity.solar
      );
      expect(EMISSION_FACTORS.electricity.standardGrid).toBeGreaterThan(
        EMISSION_FACTORS.electricity.wind
      );
    });

    it("electricity values are within reasonable range (0 to 1 kg CO2/kWh)", () => {
      for (const key of expectedKeys) {
        expect(EMISSION_FACTORS.electricity[key]).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("shopping factors", () => {
    const expectedKeys = [
      "clothing",
      "electronics",
      "furniture",
      "misc",
    ] as const;

    it("has all expected shopping keys", () => {
      for (const key of expectedKeys) {
        expect(EMISSION_FACTORS.shopping).toHaveProperty(key);
      }
    });

    it("all shopping values are positive numbers", () => {
      for (const key of expectedKeys) {
        expect(EMISSION_FACTORS.shopping[key]).toBeGreaterThan(0);
      }
    });

    it("electronics has highest shopping emissions", () => {
      for (const key of expectedKeys) {
        expect(EMISSION_FACTORS.shopping.electronics).toBeGreaterThanOrEqual(
          EMISSION_FACTORS.shopping[key]
        );
      }
    });

    it("shopping values are within reasonable range (1 to 200 kg CO2/item)", () => {
      for (const key of expectedKeys) {
        expect(EMISSION_FACTORS.shopping[key]).toBeGreaterThanOrEqual(1);
        expect(EMISSION_FACTORS.shopping[key]).toBeLessThanOrEqual(200);
      }
    });
  });

  describe("water factors", () => {
    it("has tapWater and bottledWater keys", () => {
      expect(EMISSION_FACTORS.water).toHaveProperty("tapWater");
      expect(EMISSION_FACTORS.water).toHaveProperty("bottledWater");
    });

    it("all water values are positive numbers", () => {
      expect(EMISSION_FACTORS.water.tapWater).toBeGreaterThan(0);
      expect(EMISSION_FACTORS.water.bottledWater).toBeGreaterThan(0);
    });

    it("bottled water has higher emissions than tap water", () => {
      expect(EMISSION_FACTORS.water.bottledWater).toBeGreaterThan(
        EMISSION_FACTORS.water.tapWater
      );
    });
  });

  describe("waste factors", () => {
    const expectedKeys = ["landfill", "recycled", "compost"] as const;

    it("has all expected waste keys", () => {
      for (const key of expectedKeys) {
        expect(EMISSION_FACTORS.waste).toHaveProperty(key);
      }
    });

    it("all waste values are positive numbers", () => {
      for (const key of expectedKeys) {
        expect(EMISSION_FACTORS.waste[key]).toBeGreaterThan(0);
      }
    });

    it("landfill has highest waste emissions", () => {
      expect(EMISSION_FACTORS.waste.landfill).toBeGreaterThan(
        EMISSION_FACTORS.waste.recycled
      );
      expect(EMISSION_FACTORS.waste.landfill).toBeGreaterThan(
        EMISSION_FACTORS.waste.compost
      );
    });
  });

  describe("appliances factors", () => {
    const expectedKeys = [
      "airConditioner",
      "heater",
      "television",
      "computer",
    ] as const;

    it("has all expected appliance keys", () => {
      for (const key of expectedKeys) {
        expect(EMISSION_FACTORS.appliances).toHaveProperty(key);
      }
    });

    it("all appliance values are positive numbers", () => {
      for (const key of expectedKeys) {
        expect(EMISSION_FACTORS.appliances[key]).toBeGreaterThan(0);
      }
    });

    it("heater draws more power than television", () => {
      expect(EMISSION_FACTORS.appliances.heater).toBeGreaterThan(
        EMISSION_FACTORS.appliances.television
      );
    });

    it("appliance values are within reasonable range (0.01 to 5 kW)", () => {
      for (const key of expectedKeys) {
        expect(EMISSION_FACTORS.appliances[key]).toBeGreaterThanOrEqual(0.01);
        expect(EMISSION_FACTORS.appliances[key]).toBeLessThanOrEqual(5);
      }
    });
  });

  describe("structure", () => {
    it("has all top-level category keys", () => {
      expect(EMISSION_FACTORS).toHaveProperty("transport");
      expect(EMISSION_FACTORS).toHaveProperty("food");
      expect(EMISSION_FACTORS).toHaveProperty("electricity");
      expect(EMISSION_FACTORS).toHaveProperty("shopping");
      expect(EMISSION_FACTORS).toHaveProperty("water");
      expect(EMISSION_FACTORS).toHaveProperty("waste");
      expect(EMISSION_FACTORS).toHaveProperty("appliances");
    });
  });
});
