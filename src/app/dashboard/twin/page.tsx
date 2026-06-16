"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/glass-card";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const BarChart = dynamic(
  () => import("@/components/ui/svg-charts").then((mod) => mod.BarChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-2xl bg-zinc-900/50" />,
  }
);
import { Sparkles, TrendingDown, Coins, TreePine, Leaf } from "lucide-react";

import { useTwinSimulation } from "@/hooks/useTwinSimulation";

export default function CarbonTwinPage() {
  useAuth();

  const {
    transitDays, acReduction, vegMealsSwaps, renewableUtility, useEV,
    setTransitDays, setAcReduction, setVegMealsSwaps, setRenewableUtility, setUseEV,
    baselineTotal, carbonSaved, moneySaved, treesEquivalent, scoreImprovement, chartData,
  } = useTwinSimulation();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">AI Carbon Twin</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Simulate carbon-reduction scenarios. Adjust your lifestyle toggles to visualize projections in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sliders Input Panel */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4.5 w-4.5 text-emerald-400 fill-current" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-200">Simulation Variables</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label htmlFor="twin-transit" className="text-xs font-semibold text-zinc-300">Swap Car for Bike/Transit</label>
                <span className="text-xs text-emerald-400 font-bold font-mono">{transitDays} day(s)/week</span>
              </div>
              <input id="twin-transit" type="range" min="0" max="7" value={transitDays}
                aria-valuetext={`${transitDays} day${transitDays === 1 ? "" : "s"} per week`}
                aria-describedby="twin-transit-desc"
                onChange={(e) => setTransitDays(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              <p id="twin-transit-desc" className="text-[10px] text-zinc-500 leading-normal">Saves approx 20 km of driving per day. Replaces high-impact combustion with green transit.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label htmlFor="twin-ac" className="text-xs font-semibold text-zinc-300">Reduce AC Usage</label>
                <span className="text-xs text-emerald-400 font-bold font-mono">{acReduction} hour(s)/day</span>
              </div>
              <input id="twin-ac" type="range" min="0" max="8" value={acReduction}
                aria-valuetext={`${acReduction} hour${acReduction === 1 ? "" : "s"} per day`}
                aria-describedby="twin-ac-desc"
                onChange={(e) => setAcReduction(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              <p id="twin-ac-desc" className="text-[10px] text-zinc-500 leading-normal">Trims runtime on heavy climate compressors, lowering household utility grids.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label htmlFor="twin-veg" className="text-xs font-semibold text-zinc-300">Vegetarian / Vegetarian Meal Swap</label>
                <span className="text-xs text-emerald-400 font-bold font-mono">{vegMealsSwaps} meal(s)/week</span>
              </div>
              <input id="twin-veg" type="range" min="0" max="14" value={vegMealsSwaps}
                aria-valuetext={`${vegMealsSwaps} meal${vegMealsSwaps === 1 ? "" : "s"} per week`}
                aria-describedby="twin-veg-desc"
                onChange={(e) => setVegMealsSwaps(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              <p id="twin-veg-desc" className="text-[10px] text-zinc-500 leading-normal">Replaces high-emission red meat servings with low-impact plant proteins.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label htmlFor="twin-renewable" className="text-xs font-semibold text-zinc-300">Renewable Energy Offset</label>
                <span className="text-xs text-emerald-400 font-bold font-mono">{renewableUtility}% solar/wind</span>
              </div>
              <input id="twin-renewable" type="range" min="0" max="100" step="10" value={renewableUtility}
                aria-valuetext={`${renewableUtility} percent solar and wind`}
                aria-describedby="twin-renewable-desc"
                onChange={(e) => setRenewableUtility(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              <p id="twin-renewable-desc" className="text-[10px] text-zinc-500 leading-normal">Uses clean solar/wind credits to reduce the carbon intensity of all electric usage.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-white/[0.04]">
                <label htmlFor="twin-ev" className="cursor-pointer flex-1 mr-4">
                  <span className="text-xs font-semibold text-zinc-200 block">Switch to EV driving</span>
                  <span className="text-[9px] text-zinc-500 mt-0.5 block">Use Electric Vehicle instead of Gas</span>
                </label>
                <input id="twin-ev" type="checkbox" checked={useEV} onChange={(e) => setUseEV(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500 bg-zinc-950 border-white/[0.08] cursor-pointer" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Projections Panel */}
        <div className="space-y-6">
          <GlassCard className="p-6 flex flex-col items-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Carbon Twin Projection</h3>
            <BarChart data={chartData} height={170} color="#3B82F6" />
            <div className="mt-6 border-t border-white/[0.06] pt-4 w-full text-center">
              <span className="text-xs text-zinc-400 font-medium">Potential Reduction:</span>
              <span className="text-xl font-bold font-mono text-emerald-400 block mt-1">
                {carbonSaved} kg CO2/month ({Math.round((carbonSaved / (baselineTotal || 1)) * 100)}% off)
              </span>
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 gap-4">
            <GlassCard p-4 glowColor="from-blue-500/5 to-transparent">
              <div className="flex flex-col">
                <Coins className="h-5 w-5 text-blue-400 mb-2" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Utility Savings</span>
                <span className="text-lg font-bold font-mono text-zinc-100 mt-1">${moneySaved}/mo</span>
              </div>
            </GlassCard>
            <GlassCard p-4 glowColor="from-emerald-500/5 to-transparent">
              <div className="flex flex-col">
                <TreePine className="h-5 w-5 text-emerald-400 mb-2" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Tree Offsets</span>
                <span className="text-lg font-bold font-mono text-zinc-100 mt-1">{treesEquivalent} trees/yr</span>
              </div>
            </GlassCard>
            <GlassCard p-4 glowColor="from-violet-500/5 to-transparent">
              <div className="flex flex-col">
                <Leaf className="h-5 w-5 text-violet-400 mb-2" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Score Lift</span>
                <span className="text-lg font-bold font-mono text-zinc-100 mt-1">+{scoreImprovement} pts</span>
              </div>
            </GlassCard>
            <GlassCard p-4 glowColor="from-amber-500/5 to-transparent">
              <div className="flex flex-col">
                <TrendingDown className="h-5 w-5 text-amber-400 mb-2" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Yearly Avoided</span>
                <span className="text-lg font-bold font-mono text-zinc-100 mt-1">
                  {Math.round((carbonSaved * 12) / 100) / 10} tonnes
                </span>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
