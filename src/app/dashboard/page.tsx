"use client";

import React, { useMemo, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCarbonScore, useLeaderboard, useActivities, useMonthlyReport } from "@/hooks";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const AreaChart = dynamic(() => import("@/components/ui/svg-charts").then((mod) => mod.AreaChart));
const DonutChart = dynamic(() => import("@/components/ui/svg-charts").then((mod) => mod.DonutChart));
import { Sparkles } from "lucide-react";
import Link from "next/link";

import { StatCard } from "@/components/dashboard/stat-card";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default function DashboardPage() {
  const { profile } = useAuth();
  const { activities, loading: activitiesLoading } = useActivities({ userId: profile?.uid ?? null });
  const { score: carbonScore, todayCarbon, weeklyCarbon, monthlyCarbon, yearlyProjected, categoryBreakdown, trend } = useCarbonScore(activities);
  const report = useMonthlyReport(activities);
  const { entries: climbers, loading: climbersLoading } = useLeaderboard({ userId: profile?.uid ?? null, topN: 3 });

  const loading = activitiesLoading || climbersLoading;
  const limitGoal = profile?.goal ?? 350;

  const categoryData = useMemo(() => {
    const getVal = (cat: string) => categoryBreakdown.find((c) => c.category === cat)?.totalCarbon || 0;
    return [
      { name: "Transport", value: Math.round(getVal("transport") * 10) / 10, color: "#3B82F6" },
      { name: "Diet", value: Math.round(getVal("food") * 10) / 10, color: "#10B981" },
      { name: "Utilities", value: Math.round(getVal("electricity") * 10) / 10, color: "#F59E0B" },
      { name: "Shopping", value: Math.round(getVal("shopping") * 10) / 10, color: "#8B5CF6" },
    ].filter(item => item.value > 0);
  }, [categoryBreakdown]);

  const weeklyData = useMemo(() => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return trend.slice(-7).map(t => {
      const d = new Date(t.date);
      return { label: dayNames[d.getDay()], value: Math.round(t.carbon * 10) / 10 };
    });
  }, [trend]);

  const aiRecommendation = useMemo(() => {
    const highestCat = [...categoryData].sort((a, b) => b.value - a.value)[0];
    if (highestCat?.name === "Transport") {
      return { title: "Try Public Transit", description: `Transport is your highest emission source. Taking the bus twice a week could save ~40 kg CO2 per month.`, potentialSaving: "40 kg CO2/mo", cta: "Simulate impact in Carbon Twin" };
    } else if (highestCat?.name === "Diet") {
      return { title: "Meatless Mondays", description: `Swapping one beef meal per week for a plant-based option saves roughly 26 kg CO2 per month.`, potentialSaving: "26 kg CO2/mo", cta: "Simulate impact in Carbon Twin" };
    }
    return { title: "Switch AC to Eco Mode", description: `Setting your AC to run 1 hour less per day will save approximately 32 kg CO2 and $15 per month.`, potentialSaving: "32 kg CO2/mo", cta: "Simulate impact in Carbon Twin" };
  }, [categoryData]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Welcome back, {profile?.name || "Eco Friend"}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">Your carbon score is {carbonScore}. Let&apos;s improve it today.</p>
        </div>
        <Link href="/dashboard/log" tabIndex={-1}>
          <Button className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 motion-safe:animate-pulse" /><span>AI Daily Log</span>
          </Button>
        </Link>
      </div>

      {/* Main Grid overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6" id="score-label">Sustainability Score</h2>
          <ProgressRing score={carbonScore} size={170} aria-labelledby="score-label" />
          <div className="mt-6 border-t border-white/[0.06] pt-4 w-full grid grid-cols-2 gap-2 text-left">
            <div>
              <span className="text-[10px] text-zinc-500 font-mono block">Monthly Target</span>
              <span className="text-sm font-bold text-zinc-200">{limitGoal} kg CO2</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-mono block">Actual Emission</span>
              <span className="text-sm font-bold text-emerald-400">{monthlyCarbon} kg CO2</span>
            </div>
          </div>
        </GlassCard>

        <div className="lg:col-span-2 grid grid-cols-2 gap-6">
          <StatCard title="Today&apos;s CO2" value={`${todayCarbon} kg`} icon="today" glowColor="rgba(59, 130, 246, 0.15)" subtitle="Real-time updated" subtitleColor="text-emerald-400" />
          <StatCard title="Weekly CO2" value={`${weeklyCarbon} kg`} icon="weekly" glowColor="rgba(139, 92, 246, 0.15)" subtitle={`Limit Cap: ${Math.round(limitGoal / 4)} kg`} subtitleColor="text-zinc-500 font-mono" />
          <StatCard title="Monthly Total" value={`${monthlyCarbon} kg`} icon="monthly" glowColor="rgba(245, 158, 11, 0.15)"
            subtitle={limitGoal - monthlyCarbon > 0 ? `${Math.round((limitGoal - monthlyCarbon) * 10) / 10} kg below limit` : "Limit exceeded!"} subtitleColor="text-emerald-400" />
          <StatCard title="Yearly Projected" value={`${yearlyProjected} t`} icon="yearly" glowColor="rgba(16, 185, 129, 0.15)" subtitle="Global Average: 4.8 t" />
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Emissions Trend (This Week)</h2>
            <span className="text-[10px] font-mono font-bold text-zinc-400 bg-white/5 border border-white/[0.08] px-2.5 py-1 rounded-full">
              Daily Average: {Math.round((weeklyCarbon / 7) * 10) / 10} kg CO2
            </span>
          </div>
          <Suspense fallback={<div className="h-[180px] w-full animate-pulse bg-zinc-900/50 rounded-xl" />}>
            <AreaChart data={weeklyData} height={180} color="#10B981" />
          </Suspense>
        </GlassCard>

        <GlassCard>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Footprint Breakdown</h2>
          <div className="flex items-center justify-center h-full">
            {categoryData.length > 0 ? (
              <Suspense fallback={<div className="h-[150px] w-[150px] animate-pulse bg-zinc-900/50 rounded-full" />}>
                <DonutChart data={categoryData} size={150} />
              </Suspense>
            ) : (
              <p className="text-sm text-zinc-500 pb-8">No data yet.</p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Monthly Report section */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Monthly Eco-Report Card</h2>
            <p className="text-xl font-bold text-white font-display">
              Grade: <span className="text-emerald-400">{report.grade}</span>
            </p>
            <p className="text-xs text-zinc-400 mt-1">{report.gradeExplanation}</p>
          </div>
          <div className="flex gap-6 border-l border-white/[0.06] pl-6 w-full md:w-auto justify-between md:justify-start">
            <div>
              <span className="text-[10px] text-zinc-500 font-mono block">Previous Month</span>
              <span className="text-sm font-bold text-zinc-300">{report.prevMonthlyCarbon} kg</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-mono block">Current Month</span>
              <span className="text-sm font-bold text-zinc-100">{report.monthlyCarbon} kg</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-mono block">Change</span>
              <span className={`text-sm font-bold ${report.comparisonPercent <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {report.comparisonPercent <= 0 ? '' : '+'}{report.comparisonPercent}%
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      <QuickActions aiRecommendation={aiRecommendation} climbers={climbers} />
    </div>
  );
}
