"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useActivities } from "@/hooks";
import { exportToCsv } from "@/lib/export-utils";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Database, Trash2, Check, Download } from "lucide-react";
import confetti from "canvas-confetti";
import { logger } from "@/lib/logger";

import { ProfileSection } from "@/components/settings/profile-section";
import { PreferencesSection } from "@/components/settings/preferences-section";

const LOG_CTX = { module: "SettingsPage" };

export default function SettingsPage() {
  const { profile, updateProfile, logout } = useAuth();
  
  const [name, setName] = useState(profile?.name || "");
  const [country, setCountry] = useState(profile?.country || "");
  const [occupation, setOccupation] = useState(profile?.occupation || "");
  const [theme, setTheme] = useState(profile?.preferences?.theme || "dark");
  const [notifications, setNotifications] = useState(profile?.preferences?.notifications ?? true);
  const [weeklyDigest, setWeeklyDigest] = useState(profile?.preferences?.weeklyDigest ?? true);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleNotificationToggle = async (checked: boolean) => {
    setNotifications(checked);
    if (checked && globalThis.window !== undefined && "Notification" in globalThis.window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const { getFirebaseMessaging } = await import("@/lib/firebase");
          const messaging = getFirebaseMessaging();
          if (messaging) {
            const { getToken } = await import("firebase/messaging");
            await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY });
          }
        }
      } catch (err) {
        logger.warn(LOG_CTX, "FCM registration failed", err);
      }
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSuccess(false);
    try {
      await updateProfile({
        name, country, occupation,
        preferences: { theme: theme as "dark" | "light" | "system", notifications, weeklyDigest },
      });
      confetti({ particleCount: 20, spread: 30, origin: { y: 0.8 } });
      setSuccess(true);
    } catch (err) {
      logger.error(LOG_CTX, "Failed to save settings", err);
    } finally { setSaving(false); }
  };

  const { activities } = useActivities({ userId: profile?.uid ?? null });

  const handleExportCsv = () => {
    if (!profile || !activities) return;
    exportToCsv(activities);
  };

  const handleExportData = () => {
    if (!profile) return;
    const exportObj = {
      profile: { uid: profile.uid, name: profile.name, email: profile.email, country: profile.country, carbonScore: profile.carbonScore, ecoXP: profile.points, streak: profile.streak, monthlyGoal: profile.goal },
      exportedAt: new Date().toISOString(), platform: "CarbonMind AI",
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `carbonmind_data_${profile.uid}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">System Settings</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Configure profile metrics, platform settings, notification preferences, and export records.</p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="h-4.5 w-4.5" /><span>Profile configuration updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        <ProfileSection name={name} country={country} occupation={occupation}
          onNameChange={setName} onCountryChange={setCountry} onOccupationChange={setOccupation} />

        <PreferencesSection theme={theme} notifications={notifications} weeklyDigest={weeklyDigest}
          onThemeChange={setTheme} onNotificationToggle={handleNotificationToggle} onWeeklyDigestChange={setWeeklyDigest} />

        {/* Data Management */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2.5 mb-2">
            <Database className="h-4.5 w-4.5 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-200">Data Management</h3>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl bg-zinc-950/40 border border-white/[0.04]">
            <div>
              <span className="text-xs font-semibold text-zinc-200">Export Carbon Data</span>
              <p className="text-[10px] text-zinc-500 mt-0.5">Download your profile metrics and history logs in JSON or CSV format.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button type="button" variant="outline" size="sm" onClick={handleExportData} className="flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /><span>Export JSON</span>
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleExportCsv} className="flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /><span>Export CSV</span>
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
            <div>
              <span className="text-xs font-semibold text-red-400">Request Account Deletion</span>
              <p className="text-[10px] text-zinc-500 mt-0.5">Irreversibly delete your account logs and settings history.</p>
            </div>
            <Button type="button" variant="danger" size="sm" onClick={() => logout()} className="shrink-0">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /><span>Delete Account</span>
            </Button>
          </div>
        </GlassCard>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="px-8" loading={saving}>Save Configurations</Button>
        </div>
      </form>
    </div>
  );
}
