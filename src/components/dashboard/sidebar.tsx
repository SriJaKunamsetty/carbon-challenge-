"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  History,
  LayoutDashboard,
  Leaf,
  LogOut,
  PenLine,
  Settings,
  Sparkles,
  Trophy,
} from "lucide-react";
import { getValue } from "firebase/remote-config";
import { useAuth } from "@/context/AuthContext";
import { getFirebaseRemoteConfig } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [twinEnabled] = React.useState(() => {
    const remoteConfig = getFirebaseRemoteConfig();

    if (!remoteConfig) {
      return true;
    }

    try {
      return getValue(remoteConfig, "enable_carbon_twin").asBoolean() !== false;
    } catch (error) {
      logger.error({ module: "Sidebar" }, "Remote config read failed", error);
      return true;
    }
  });

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Daily Log", href: "/dashboard/log", icon: PenLine },
    { name: "Carbon Tracker", href: "/dashboard/tracker", icon: History },
    ...(twinEnabled ? [{ name: "Carbon Twin", href: "/dashboard/twin", icon: Leaf }] : []),
    { name: "AI Coach", href: "/dashboard/coach", icon: Sparkles },
    { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "w-64 border-r border-white/[0.06] bg-black flex flex-col shrink-0 h-screen",
        className
      )}
      {...props}
    >
      <div className="h-16 flex items-center gap-3 px-6 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-sm shadow-[0_0_15px_rgba(16,185,129,0.05)]">
          CM
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight text-white block">CarbonMind AI</span>
          <span className="text-[10px] text-zinc-500 font-mono block">v1.0.0</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer",
                isActive
                  ? "bg-white/5 border border-white/[0.08] text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                  : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-emerald-400" : "text-zinc-500")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/[0.06] bg-zinc-950/20">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/5 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/10 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
