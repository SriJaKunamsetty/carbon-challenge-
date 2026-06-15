/**
 * @module mock-ai
 * @description Local fallback AI engine. Provides NLP-based carbon log parsing
 * and a conversational sustainability coach, used when the Gemini API is unavailable.
 */
import type { TransportMode } from "./carbon/transport";
import type { FoodType } from "./carbon/food";
import type { ApplianceType } from "./carbon/electricity";
import type { UserProfile } from "@/types";
import {
  extractTransportEmissions,
  extractFoodEmissions,
  extractElectricityEmissions,
  extractShoppingEmissions,
} from "./mock-ai-parsers";

export interface ParsedLogResult {
  categoryMatches: {
    transport: { mode: TransportMode; distanceKm: number; carbon: number }[];
    food: { type: FoodType; servings: number; carbon: number }[];
    electricity: { type: ApplianceType; hours: number; carbon: number }[];
    shopping: { category: string; count: number; carbon: number }[];
  };
  totalCarbon: number;
  explanation: string;
}

/**
 * Advanced heuristic NLP parser that scans raw text, detects intents and entities,
 * maps them to carbon factors, and computes carbon emissions.
 *
 * @param text - The raw natural-language input from the user
 * @returns Structured carbon data with category breakdowns and total
 */
export function parseCarbonLog(text: string): ParsedLogResult {
  const normalized = text.toLowerCase();

  const transport = extractTransportEmissions(normalized);
  const food = extractFoodEmissions(normalized);
  const electricity = extractElectricityEmissions(normalized);
  const shopping = extractShoppingEmissions(normalized);

  const totalCarbon = [
    ...transport.map(t => t.carbon),
    ...food.map(f => f.carbon),
    ...electricity.map(e => e.carbon),
    ...shopping.map(s => s.carbon),
  ].reduce((sum, c) => sum + c, 0);

  const explanations = [
    ...transport.map(t => `Transport: ${t.distanceKm} km via ${t.mode} (${Math.round(t.carbon * 10) / 10} kg CO2)`),
    ...food.map(f => `Diet: ${f.servings} serving(s) of ${f.type} (${Math.round(f.carbon * 10) / 10} kg CO2)`),
    ...electricity.map(e => `Electricity: ${e.hours} hours of ${e.type} (${Math.round(e.carbon * 10) / 10} kg CO2)`),
    ...shopping.map(s => `Shopping: ${s.count} ${s.category}(s) (${s.carbon} kg CO2)`),
  ];

  return {
    categoryMatches: { transport, food, electricity, shopping },
    totalCarbon: Math.round(totalCarbon * 100) / 100,
    explanation: explanations.length === 0
      ? "No carbon-emitting activities detected. Try typing: 'I travelled 15 km by car, ate a beef steak, and used AC for 3 hours.'"
      : explanations.join('\n'),
  };
}

interface IntentMatch {
  keywords: string[];
  response: (name: string, profile: UserProfile | null) => string;
}

/**
 * Returns a conversational response from the AI Sustainability Coach.
 * Simulates a context-aware chat session referencing user logs, streak, and goals.
 *
 * @param history - Previous chat messages for context
 * @param latestMessage - The user's latest message
 * @param profile - The user's profile for personalized responses
 * @returns A markdown-formatted coach response
 */
export function getCoachResponse(
  history: { role: "user" | "assistant"; content: string }[],
  latestMessage: string,
  profile: UserProfile | null
): string {
  const msg = latestMessage.toLowerCase();
  const name = profile?.name || "Eco Friend";
  const carbonScore = profile?.carbonScore || 70;
  const goal = profile?.goal || 350;

  const intents: IntentMatch[] = [
    {
      keywords: ["hello", "hi ", "hey", "greet"],
      response: () => `Hello **${name}**! I am your **CarbonMind AI Coach**. 

I analyze your daily habits, transportation, diet, and utility usage to help you cut carbon, save money, and live sustainably. 

Your current Carbon Score is **${carbonScore}/100**, and your monthly target is **${goal} kg CO2**. How can I help you reduce your environmental footprint today?`,
    },
    {
      keywords: ["reduce", "decrease", "lower", "cut", "plan"],
      response: () => `Here is a custom **Emissions Reduction Roadmap** for *${profile?.country || "your area"}*:

### 1. Transportation (Highest Impact)
* **Switch 2 Days/Week** to transit/cycling — saves **~40 kg CO2/month**
* **Eco-Driving**: Steady speeds + proper tire inflation — 10-15% fuel savings

### 2. Dietary Adjustments
* **Meatless Mondays**: Saves **15-20 kg CO2/month** — beef emits **16x more** than vegetables
* **Minimize Food Waste**: Composting saves **80% of waste emissions**

### 3. Household Power
* **AC Modulation**: 1.5°C adjustment saves **~42 kg CO2/month**
* **Smart Power Strips**: Phantom power = 5-10% of residential energy

Would you like to run a simulation on your **Carbon Twin**?`,
    },
    {
      keywords: ["eat", "food", "diet", "beef", "chicken", "vegan"],
      response: () => `Dietary footprint per serving:
- **Beef**: ~6.5 kg CO2 | **Pork**: ~2.2 kg | **Poultry**: ~1.8 kg
- **Fish**: ~1.6 kg | **Dairy**: ~0.9 kg | **Grains**: ~0.4 kg | **Vegetables**: ~0.3 kg

**Easy Win**: Swap beef for poultry or plant-based proteins — the single fastest way to reduce food carbon.`,
    },
    {
      keywords: ["ac ", "electricity", "power", "energy", "solar", "heater"],
      response: () => `Energy tips:
1. **Air Conditioning (AC)**: ~1.5 kW draw → **4.2 kg CO2/day** at 6 hrs. Solar panels → near **zero**!
2. **Heating**: Use heat pumps (3-4x more efficient than resistance heating)
3. **LED Lighting**: Cuts lighting power by **85%**`,
    },
    {
      keywords: ["what is", "explain", "carbon footprint"],
      response: () => `A **Carbon Footprint** = total greenhouse gas emissions (CO2e) from your activities.

* **Direct (Scope 1)**: Car fuel, home gas/oil
* **Indirect (Scope 2 & 3)**: Grid electricity, manufacturing

Global average: **4,500 kg/year**. Target: **<2,000 kg** by 2030. CarbonMind tracks your daily progress!`,
    },
  ];

  for (const intent of intents) {
    if (intent.keywords.some(kw => msg.includes(kw))) {
      return intent.response(name, profile);
    }
  }

  return `Thank you for sharing that, ${name}. Every step towards tracking counts! 

* **Small Gains**: Walking/biking saves **0.21 kg CO2/km** vs driving
* **Check Dashboard**: Review your **Carbon Score** against your ${goal} kg target
* **Keep Logging**: Your streak is **${profile?.streak || 0} days** — consistency builds awareness!

What specific habit would you like to analyze next?`;
}
