"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { User } from "lucide-react";

export interface ProfileSectionProps {
  name: string;
  country: string;
  occupation: string;
  onNameChange: (v: string) => void;
  onCountryChange: (v: string) => void;
  onOccupationChange: (v: string) => void;
}

export function ProfileSection({
  name,
  country,
  occupation,
  onNameChange,
  onCountryChange,
  onOccupationChange,
}: ProfileSectionProps) {
  return (
    <GlassCard className="p-6 space-y-5">
      <div className="flex items-center gap-2.5 mb-2">
        <User className="h-4.5 w-4.5 text-emerald-400" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-200">Account Details</h3>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="settings-display-name" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Full Display Name</label>
        <input
          id="settings-display-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all font-sans"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="settings-country" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Country of Residence</label>
          <input
            id="settings-country"
            type="text"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="settings-occupation" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Occupation</label>
          <input
            id="settings-occupation"
            type="text"
            value={occupation}
            onChange={(e) => onOccupationChange(e.target.value)}
            className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all"
          />
        </div>
      </div>
    </GlassCard>
  );
}
