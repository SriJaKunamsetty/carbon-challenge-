"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Car,
  Utensils,
  Zap,
  ShoppingBag,
  History,
  Trash2,
} from "lucide-react";

export interface LogEntry {
  id: string;
  category: "transport" | "food" | "electricity" | "shopping";
  label: string;
  value: number;
  unit: string;
  carbon: number;
  date: string;
  note?: string;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "transport": return <Car className="h-4 w-4 text-blue-400" aria-hidden="true" />;
    case "food": return <Utensils className="h-4 w-4 text-emerald-400" aria-hidden="true" />;
    case "electricity": return <Zap className="h-4 w-4 text-amber-400" aria-hidden="true" />;
    case "shopping": return <ShoppingBag className="h-4 w-4 text-violet-400" aria-hidden="true" />;
    default: return <History className="h-4 w-4 text-zinc-400" aria-hidden="true" />;
  }
}

export interface ActivityCardProps {
  item: LogEntry;
  onDelete: (id: string) => void;
}

export function ActivityCard({ item, onDelete }: ActivityCardProps) {
  return (
    <GlassCard className="p-5 flex items-start justify-between">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-zinc-950/60 border border-white/[0.08] flex items-center justify-center shrink-0">
          {getCategoryIcon(item.category)}
        </div>
        <div>
          <h3 className="text-xs font-semibold text-zinc-200">{item.label}</h3>
          <span className="text-[10px] text-zinc-500 font-mono block mt-1">
            Value: {item.value} {item.unit} | Date: {item.date}
          </span>
          {item.note && (
            <p className="text-[10px] text-zinc-500 italic mt-2 border-l border-white/5 pl-2">
              &quot;{item.note}&quot;
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
        <span className="text-xs font-mono font-bold text-emerald-400">
          {item.carbon} kg CO2
        </span>
        <button
          onClick={() => onDelete(item.id)}
          aria-label={`Delete activity ${item.label}`}
          className="p-1.5 rounded-lg border border-transparent hover:border-red-500/10 hover:bg-red-500/5 text-zinc-600 hover:text-red-400 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </GlassCard>
  );
}
