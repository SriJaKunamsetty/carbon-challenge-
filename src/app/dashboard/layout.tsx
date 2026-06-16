"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { SkipLink } from "@/components/ui/skip-link";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (profile && !profile.onboarded) {
        router.push("/onboarding");
      }
    }
  }, [user, profile, loading, router]);

  // Loading Screen
  if (loading || !user || (profile && !profile.onboarded)) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        {/* Animated loader */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-12 h-12 rounded-full border border-emerald-500/20 animate-ping" />
          <div className="w-8 h-8 rounded-full border-2 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <span className="text-xs text-zinc-500 mt-6 font-mono tracking-widest uppercase">
          Securing Connection...
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans">
      <SkipLink targetId="main-content" />
      {/* Sidebar navigation */}
      <nav aria-label="Main Navigation">
        <Sidebar />
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header toolbar */}
        <header>
          <Topbar />
        </header>

        {/* Inner page content scrollable */}
        <main id="main-content" className="flex-1 overflow-y-auto bg-black p-8 relative">
          {/* Subtle gradient glowing backgrounds */}
          <div className="absolute top-[10%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/3 blur-[100px] pointer-events-none -z-10" />
          <div className="absolute bottom-[10%] left-[10%] w-[35vw] h-[35vw] rounded-full bg-blue-500/3 blur-[100px] pointer-events-none -z-10" />
          
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
