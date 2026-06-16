"use client";

import React from "react";

import { Shield } from "lucide-react";

export interface SocialLoginButtonsProps {
  actionLoading: boolean;
  onGoogleLogin: () => void;
  onDemoSignIn: () => void;
}

export function SocialLoginButtons({ actionLoading, onGoogleLogin, onDemoSignIn }: SocialLoginButtonsProps) {
  return (
    <>
      <div className="relative flex py-4 items-center">
        <div className="flex-grow border-t border-white/[0.06]"></div>
        <span className="flex-shrink mx-4 text-zinc-500 text-[10px] uppercase font-bold tracking-widest font-mono">
          Or Continue With
        </span>
        <div className="flex-grow border-t border-white/[0.06]"></div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onGoogleLogin}
          disabled={actionLoading}
          className="flex items-center justify-center gap-2 bg-zinc-950/50 hover:bg-zinc-900 border border-white/[0.08] hover:border-white/10 rounded-xl py-2.5 px-4 text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.822-6.3-6.3s2.822-6.3 6.3-6.3c1.706 0 3.24.685 4.35 1.795l3.056-3.056C19.24 2.585 16.012 1.3 12.24 1.3 6.22 1.3 1.3 6.22 1.3 12.24s4.92 10.94 10.94 10.94c6.262 0 10.428-4.407 10.428-10.612 0-.685-.062-1.354-.185-1.983H12.24z"
            />
          </svg>
          <span>Google</span>
        </button>

        <button
          onClick={onDemoSignIn}
          disabled={actionLoading}
          className="flex items-center justify-center gap-2 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/20 rounded-xl py-2.5 px-4 text-xs font-semibold text-emerald-400 transition-all cursor-pointer"
        >
          <Shield className="h-4 w-4" />
          <span>Demo Mode</span>
        </button>
      </div>
    </>
  );
}
