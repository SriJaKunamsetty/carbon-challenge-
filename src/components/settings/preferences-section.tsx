"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Bell } from "lucide-react";

export interface PreferencesSectionProps {
  theme: string;
  notifications: boolean;
  weeklyDigest: boolean;
  onThemeChange: (v: "dark" | "light" | "system") => void;
  onNotificationToggle: (checked: boolean) => void;
  onWeeklyDigestChange: (checked: boolean) => void;
}

export function PreferencesSection({
  theme,
  notifications,
  weeklyDigest,
  onThemeChange,
  onNotificationToggle,
  onWeeklyDigestChange,
}: PreferencesSectionProps) {
  return (
    <GlassCard className="p-6 space-y-5">
      <div className="flex items-center gap-2.5 mb-2">
        <Bell className="h-4.5 w-4.5 text-emerald-400" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-200">System Preferences</h3>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="settings-theme" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">UI Theme</label>
        <select
          id="settings-theme"
          value={theme}
          onChange={(e) => onThemeChange(e.target.value as "dark" | "light" | "system")}
          className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all"
        >
          <option value="dark">Carbon Dark First</option>
          <option value="light">Solar Light</option>
          <option value="system">System Preference</option>
        </select>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-white/[0.04]">
          <label htmlFor="settings-alerts" className="cursor-pointer flex-1 mr-4">
            <span className="text-xs font-semibold text-zinc-200">System Alerts</span>
            <p className="text-[10px] text-zinc-500 mt-0.5">Receive streak notifications and goal alerts.</p>
          </label>
          <input
            id="settings-alerts"
            type="checkbox"
            checked={notifications}
            onChange={(e) => onNotificationToggle(e.target.checked)}
            className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-white/[0.04]">
          <label htmlFor="settings-digest" className="cursor-pointer flex-1 mr-4">
            <span className="text-xs font-semibold text-zinc-200">Weekly Digest Reports</span>
            <p className="text-[10px] text-zinc-500 mt-0.5">Receive weekly AI summary and comparison stats.</p>
          </label>
          <input
            id="settings-digest"
            type="checkbox"
            checked={weeklyDigest}
            onChange={(e) => onWeeklyDigestChange(e.target.checked)}
            className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>
    </GlassCard>
  );
}
