/**
 * @module ai-prompts
 * @description Prompt templates for Gemini AI carbon parsing and coaching.
 * Emission factors are dynamically sourced to prevent drift.
 */
import { EMISSION_FACTORS } from "@/lib/carbon/emissionFactors";
import type { ChatHistoryEntry, UserProfileContext } from "./ai-utils";

/** Maximum conversation history entries */
const MAX_HISTORY_LENGTH = 20;

/**
 * Builds the AI Coach chat prompt with user context.
 *
 * @param text - The user's latest message
 * @param history - Previous conversation entries
 * @param profile - User profile context for personalisation
 * @returns The full prompt string
 */
export function buildChatPrompt(
  text: string,
  history: ChatHistoryEntry[],
  profile: UserProfileContext
): string {
  const name = profile?.name || "Eco Friend";
  const score = profile?.carbonScore ?? 70;
  const goal = profile?.goal ?? 350;
  const country = profile?.country || "Unknown";
  const occupation = profile?.occupation || "";

  const historyText = history
    .slice(-MAX_HISTORY_LENGTH)
    .map((h) => `${h.role === "user" ? "User" : "Coach"}: ${h.content}`)
    .join("\n");

  return `You are CarbonMind AI Coach, a world-class sustainability expert and personal carbon advisor.

User Profile:
- Name: ${name}
- Carbon Score: ${score}/100 (higher = greener)
- Monthly Goal: ${goal} kg CO2/month
- Country: ${country}
${occupation ? `- Occupation: ${occupation}` : ""}

Conversation history:
${historyText}

User: ${text}

Instructions:
1. Provide personalized, actionable sustainability advice
2. Reference the user's score and goals when relevant
3. Explain WHY each recommendation helps reduce carbon
4. Use Markdown formatting (bold, lists, headers)
5. Be encouraging but data-driven
6. Keep responses concise (200-300 words max)
7. Consider the user's country for region-specific advice`;
}

/**
 * Builds the carbon log parsing prompt.
 * Emission factors are dynamically sourced from EMISSION_FACTORS to prevent drift.
 *
 * @param text - The natural language carbon log to parse
 * @returns The full prompt string
 */
export function buildParserPrompt(text: string): string {
  const t = EMISSION_FACTORS.transport;
  const f = EMISSION_FACTORS.food;
  const a = EMISSION_FACTORS.appliances;
  const g = EMISSION_FACTORS.electricity.standardGrid;
  const s = EMISSION_FACTORS.shopping;

  return `You are a Carbon Logging Assistant. Parse this natural language log: "${text}"

Extract carbon-emitting activities and respond ONLY with valid JSON matching this schema:
{
  "categoryMatches": {
    "transport": [{"mode": "gasolineCar|electricCar|motorcycle|bus|train|flightShort|flightLong|bicycle|walking", "distanceKm": number, "carbon": number}],
    "food": [{"type": "beef|poultry|pork|fish|dairy|vegetables|grains", "servings": number, "carbon": number}],
    "electricity": [{"type": "airConditioner|heater|television|computer", "hours": number, "carbon": number}],
    "shopping": [{"category": "clothing|electronics|furniture|misc", "count": number, "carbon": number}]
  },
  "totalCarbon": number,
  "explanation": "Newline-separated description of each parsed item"
}

Emission factors:
- Gasoline car: ${t.gasolineCar} kg CO2/km | Electric car: ${t.electricCar} | Bus: ${t.bus} | Train: ${t.train}
- Flight (short <1500km): ${t.flightShort} | Flight (long): ${t.flightLong}
- Beef: ${f.beef} kg/serving | Poultry: ${f.poultry} | Fish: ${f.fish} | Vegetables: ${f.vegetables}
- AC: ${a.airConditioner}kW×${g}=${Math.round(a.airConditioner * g * 1000) / 1000} kg/hr | Heater: ${a.heater}kW×${g}=${Math.round(a.heater * g * 1000) / 1000} | TV: ${Math.round(a.television * g * 1000) / 1000} | Computer: ${Math.round(a.computer * g * 1000) / 1000}
- Clothing: ${s.clothing}kg | Electronics: ${s.electronics}kg | Furniture: ${s.furniture}kg

Return empty arrays for categories with no matches.`;
}
