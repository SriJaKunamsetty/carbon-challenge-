"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  TrendingDown,
  CheckCircle2,
  Calendar,
  Zap,
  Award,
} from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string;
  icon: "today" | "weekly" | "monthly" | "yearly";
  glowColor: string;
  subtitle: string;
  subtitleColor?: string;
}

const iconMap = {
  today: { Icon: Zap, bgClass: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  weekly: { Icon: Calendar, bgClass: "bg-violet-500/10 border-violet-500/20 text-violet-400" },
  monthly: { Icon: CheckCircle2, bgClass: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
  yearly: { Icon: Award, bgClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
};

export function StatCard({ title, value, icon, glowColor, subtitle, subtitleColor }: StatCardProps) {
  const { Icon, bgClass } = iconMap[icon];
  return (
    <GlassCard glowColor={glowColor}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">{title}</h3>
          <span className="text-2xl font-bold font-mono text-white mt-1 block">{value}</span>
        </div>
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${bgClass}`} aria-hidden="true">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className={`mt-4 flex items-center gap-1.5 text-[10px] ${subtitleColor || "text-zinc-500"}`}>
        {icon === "today" && <TrendingDown className="h-3.5 w-3.5" />}
        <span>{subtitle}</span>
      </div>
    </GlassCard>
  );
}
