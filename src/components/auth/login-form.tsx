"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User } from "lucide-react";

export interface LoginFormProps {
  isSignUp: boolean;
  isReset: boolean;
  email: string;
  password: string;
  name: string;
  actionLoading: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onNameChange: (v: string) => void;
  onResetClick: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({
  isSignUp,
  isReset,
  email,
  password,
  name,
  actionLoading,
  onEmailChange,
  onPasswordChange,
  onNameChange,
  onResetClick,
  onSubmit,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isSignUp && (
        <div className="relative">
          <label htmlFor="fullName" className="sr-only">Full Name</label>
          <span className="absolute left-3 top-3.5 text-zinc-500" aria-hidden="true">
            <User className="h-4 w-4" />
          </span>
          <input
            id="fullName"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all font-sans"
            disabled={actionLoading}
          />
        </div>
      )}

      <div className="relative">
        <label htmlFor="emailAddress" className="sr-only">Email Address</label>
        <span className="absolute left-3 top-3.5 text-zinc-500" aria-hidden="true">
          <Mail className="h-4 w-4" />
        </span>
        <input
          id="emailAddress"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all font-mono"
          disabled={actionLoading}
        />
      </div>

      {!isReset && (
        <div className="relative">
          <label htmlFor="password" className="sr-only">Password</label>
          <span className="absolute left-3 top-3.5 text-zinc-500" aria-hidden="true">
            <Lock className="h-4 w-4" />
          </span>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all font-mono"
            disabled={actionLoading}
          />
        </div>
      )}

      {/* Forgot password trigger */}
      {!isSignUp && !isReset && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onResetClick}
            className="text-xs text-zinc-400 hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm transition-colors font-sans"
          >
            Forgot Password?
          </button>
        </div>
      )}

      <Button type="submit" className="w-full py-3 mt-2" loading={actionLoading}>
        {(() => { if (isReset) { return "Reset Password"; } if (isSignUp) { return "Create Account"; } return "Sign In"; })()}
      </Button>
    </form>
  );
}
