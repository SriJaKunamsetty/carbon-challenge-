/**
 * @module mock-ai-parsers
 * @description NLP extraction functions for transport, food, electricity,
 * and shopping categories. Used by the local fallback AI parser.
 */
import { calculateTransportEmissions, TransportMode } from "./carbon/transport";
import { calculateFoodEmissions, FoodType } from "./carbon/food";
import { calculateElectricityEmissions, ApplianceType } from "./carbon/electricity";
import { EMISSION_FACTORS } from "./carbon/emissionFactors";

/** Conversion factor from miles to kilometers */
const MILES_TO_KM = 1.60934;

/** Assumed average flight speed in km/h for distance estimation */
const FLIGHT_SPEED_KMH = 800;

/** Distance threshold in km distinguishing short-haul from long-haul flights */
const SHORT_HAUL_THRESHOLD_KM = 1500;

function processTransportMatch(
  textCopy: string,
  keyword: string,
  item: { mode: TransportMode; label: string },
  results: { mode: TransportMode; distanceKm: number; carbon: number }[]
): string {
  const keywordRegex = new RegExp(String.raw`(?:${keyword}[^\d]{0,10}|[^\d]{0,10}${keyword}[^\d]{0,10})(\d{1,5}(?:\.\d{1,2})?)`, "i");
  const fallbackRegex = /(\d{1,5}(?:\.\d{1,2})?)\s{0,3}(?:kms?|miles?)?/i;
  const numberMatch = keywordRegex.exec(textCopy) || fallbackRegex.exec(textCopy);

  if (!numberMatch) return textCopy;

  let distance = Number.parseFloat(numberMatch[1]);
  if (textCopy.includes("mile") || textCopy.includes("miles")) {
    distance = distance * MILES_TO_KM;
  }

  if (distance > 0) {
    const carbon = calculateTransportEmissions(item.mode, distance);
    results.push({
      mode: item.mode,
      distanceKm: Math.round(distance * 10) / 10,
      carbon: Math.round(carbon * 100) / 100,
    });
    return textCopy.replace(numberMatch[0], "");
  }
  return textCopy;
}

function processFlightMatch(
  normalized: string,
  results: { mode: TransportMode; distanceKm: number; carbon: number }[]
) {
  if (normalized.includes("flight") || normalized.includes("flew") || normalized.includes("plane")) {
    const flightHoursMatch = /(\d{1,5}(?:\.\d{1,2})?)\s{0,3}(?:hours?|hrs?)/.exec(normalized);
    const hours = flightHoursMatch ? Number.parseFloat(flightHoursMatch[1]) : 2;
    const distance = hours * FLIGHT_SPEED_KMH;
    const mode = distance > SHORT_HAUL_THRESHOLD_KM ? "flightLong" : "flightShort";
    const carbon = calculateTransportEmissions(mode, distance);
    results.push({ mode, distanceKm: distance, carbon: Math.round(carbon * 100) / 100 });
  }
}

/** Extracts transport-related carbon emissions from normalized text */
export function extractTransportEmissions(
  normalized: string
): { mode: TransportMode; distanceKm: number; carbon: number }[] {
  const results: { mode: TransportMode; distanceKm: number; carbon: number }[] = [];
  const modes: { keywords: string[]; mode: TransportMode; label: string }[] = [
    { keywords: ["electric car", "tesla", "ev"], mode: "electricCar", label: "Electric Vehicle" },
    { keywords: ["car", "drove", "drive", "taxi", "cab", "uber", "lyft"], mode: "gasolineCar", label: "Gasoline Car" },
    { keywords: ["bike", "bicycle", "cycle", "cycled", "cycling"], mode: "bicycle", label: "Bicycle" },
    { keywords: ["walk", "walked", "walking", "foot"], mode: "walking", label: "Walking" },
    { keywords: ["bus", "shuttle"], mode: "bus", label: "Bus" },
    { keywords: ["train", "subway", "metro", "rail", "tram"], mode: "train", label: "Train" },
    { keywords: ["motorcycle", "scooter", "motorbike"], mode: "motorcycle", label: "Motorcycle" },
  ];

  let textCopy = normalized;
  for (const item of modes) {
    for (const keyword of item.keywords) {
      if (textCopy.includes(keyword)) {
        textCopy = processTransportMatch(textCopy, keyword, item, results);
        if (!textCopy.includes(keyword)) break;
      }
    }
  }

  processFlightMatch(normalized, results);
  return results;
}

/** Extracts food/diet-related carbon emissions from normalized text */
export function extractFoodEmissions(
  normalized: string
): { type: FoodType; servings: number; carbon: number }[] {
  const results: { type: FoodType; servings: number; carbon: number }[] = [];
  const foods: { keywords: string[]; type: FoodType; label: string }[] = [
    { keywords: ["beef", "steak", "burger", "hamburger", "red meat"], type: "beef", label: "Beef" },
    { keywords: ["chicken", "poultry", "turkey", "biryani", "chicken biryani"], type: "poultry", label: "Poultry" },
    { keywords: ["pork", "bacon", "ham"], type: "pork", label: "Pork" },
    { keywords: ["fish", "salmon", "tuna", "seafood"], type: "fish", label: "Fish" },
    { keywords: ["dairy", "cheese", "milk", "butter", "egg", "eggs"], type: "dairy", label: "Dairy & Eggs" },
    { keywords: ["vegetable", "vegetables", "salad", "vegan", "vegetarian", "veg", "tofu"], type: "vegetables", label: "Plant-based" },
    { keywords: ["rice", "bread", "wheat", "grain", "grains", "cereal"], type: "grains", label: "Grains" },
  ];

  for (const item of foods) {
    const found = item.keywords.some(keyword => normalized.includes(keyword));
    if (found) {
      const keywordEscaped = item.keywords[0].replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
      const servingRegex1 = new RegExp(String.raw`(\d{1,5})\s{0,3}(?:serving|servings|plate|plates|portion|portions|item|items|cup|cups|burger|burgers)?\s{0,3}(?:of\s{0,3})?${keywordEscaped}`, "i");
      const servingRegex2 = new RegExp(String.raw`${keywordEscaped}[^\d]{0,10}(\d{1,5})`, "i");
      const servingMatch = servingRegex1.exec(normalized) || servingRegex2.exec(normalized);
      const servings = servingMatch ? Number.parseInt(servingMatch[1], 10) : 1;
      const carbon = calculateFoodEmissions([{ type: item.type, servings }]);
      results.push({ type: item.type, servings, carbon: Math.round(carbon * 100) / 100 });
    }
  }

  return results;
}

/** Extracts electricity/appliance carbon emissions from normalized text */
export function extractElectricityEmissions(
  normalized: string
): { type: ApplianceType; hours: number; carbon: number }[] {
  const results: { type: ApplianceType; hours: number; carbon: number }[] = [];
  const appliances: { keywords: string[]; type: ApplianceType; label: string }[] = [
    { keywords: ["ac", "aircon", "air conditioner", "air conditioning"], type: "airConditioner", label: "Air Conditioner" },
    { keywords: ["heater", "heating", "boiler"], type: "heater", label: "Space Heater" },
    { keywords: ["tv", "television", "netflix", "show"], type: "television", label: "Television" },
    { keywords: ["computer", "pc", "laptop", "gaming", "workstation"], type: "computer", label: "Computer" },
  ];

  for (const item of appliances) {
    const found = item.keywords.some(keyword => normalized.includes(keyword));
    if (found) {
      const keywordEscaped = item.keywords[0].replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
      const hoursRegex1 = new RegExp(String.raw`(\d{1,5}(?:\.\d{1,2})?)\s{0,3}(?:hours?|hrs?|h)\s{0,3}(?:of\s{0,3})?${keywordEscaped}`, "i");
      const hoursRegex2 = new RegExp(String.raw`${keywordEscaped}[^\d]{0,10}(\d{1,5}(?:\.\d{1,2})?)\s{0,3}(?:hours?|hrs?|h)`, "i");
      const hoursRegex3 = new RegExp(String.raw`(?:used|ran|on)\s{0,3}${keywordEscaped}[^\d]{0,10}(\d{1,5}(?:\.\d{1,2})?)`, "i");
      const hoursRegex4 = /(\d{1,5}(?:\.\d{1,2})?)\s{0,3}(?:hours?|hrs?|h)/i;
      const hoursMatch = hoursRegex1.exec(normalized) || hoursRegex2.exec(normalized)
        || hoursRegex3.exec(normalized) || hoursRegex4.exec(normalized);
      const hours = hoursMatch ? Number.parseFloat(hoursMatch[1]) : 4;
      const carbon = calculateElectricityEmissions([{ type: item.type, hours }]);
      results.push({ type: item.type, hours: Math.round(hours * 10) / 10, carbon: Math.round(carbon * 100) / 100 });
    }
  }

  return results;
}

/** Extracts shopping-related carbon emissions from normalized text */
export function extractShoppingEmissions(
  normalized: string
): { category: string; count: number; carbon: number }[] {
  const results: { category: string; count: number; carbon: number }[] = [];
  const shoppingCats: { keywords: string[]; category: string; factor: number }[] = [
    { keywords: ["clothes", "shirt", "pants", "shoe", "shoes", "jacket", "clothing"], category: "clothing", factor: EMISSION_FACTORS.shopping.clothing },
    { keywords: ["phone", "laptop", "tablet", "gadget", "electronics", "tv purchase"], category: "electronics", factor: EMISSION_FACTORS.shopping.electronics },
    { keywords: ["chair", "table", "sofa", "bed", "furniture"], category: "furniture", factor: EMISSION_FACTORS.shopping.furniture },
    { keywords: ["bought", "purchased", "items"], category: "misc", factor: EMISSION_FACTORS.shopping.misc },
  ];

  for (const item of shoppingCats) {
    const found = item.keywords.some(keyword => normalized.includes(keyword));
    if (found) {
      const keywordEscaped = item.keywords[0].replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
      const countRegex1 = new RegExp(String.raw`(\d{1,5})\s{0,3}(?:items|pcs|units|brand\s{0,3}new)?\s{0,3}${keywordEscaped}`, "i");
      const countRegex2 = /bought\s{0,3}(\d{1,5})/i;
      const countMatch = countRegex1.exec(normalized) || countRegex2.exec(normalized);
      const count = countMatch ? Number.parseInt(countMatch[1], 10) : 1;
      results.push({ category: item.category, count, carbon: count * item.factor });
    }
  }

  return results;
}
