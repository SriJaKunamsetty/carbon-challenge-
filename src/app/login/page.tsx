"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/glass-card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logger } from "@/lib/logger";

import { LoginForm } from "@/components/auth/login-form";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";

const LOG_CTX = { module: "LoginPage" };

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, loginWithGoogle, loginWithEmail, signupWithEmail, resetPassword } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isReset, setIsReset] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // If user is already authenticated and onboarded, redirect to dashboard
  useEffect(() => {
    if (user && profile) {
      if (profile.onboarded) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  }, [user, profile, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateAuthInputs(email, password, name, isSignUp, isReset);
    if (validationError) { setError(validationError); return; }

    setActionLoading(true);
    try {
      if (isReset) {
        await resetPassword(email);
        setSuccess("Password reset instructions have been sent to your email.");
        setIsReset(false);
      } else if (isSignUp) {
        await signupWithEmail(email, password, name);
        setSuccess("Account created successfully!");
      } else {
        await loginWithEmail(email, password);
        setSuccess("Logged in successfully!");
      }
    } catch (err) {
      logger.error(LOG_CTX, "Auth error", err);
      setError(getAuthErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(""); setSuccess(""); setActionLoading(true);
    try {
      await loginWithGoogle();
      setSuccess("Logged in with Google!");
    } catch (err) {
      logger.error(LOG_CTX, "Google auth failed", err);
      setError("Google authentication failed. Please try again.");
    } finally { setActionLoading(false); }
  };

  const handleDemoSignIn = () => {
    setError(""); setSuccess(""); setActionLoading(true);
    setTimeout(() => { setError("Demo mode is not available."); setActionLoading(false); }, 800);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden px-4 py-12">
      {/* Animated Aurora lighting grids */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0c_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0c_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo branding */}
        <div className="flex flex-col items-center mb-8">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] mb-4">
            <span className="text-xl">CM</span>
          </motion.div>
          <motion.h1 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl font-bold font-display tracking-tight text-white">CarbonMind AI</motion.h1>
          <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xs text-zinc-500 mt-1">Your Personal Carbon Intelligence Platform</motion.p>
        </div>

        <GlassCard className="relative p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={(() => { if (isReset) { return "reset"; } if (isSignUp) { return "signup"; } return "login"; })()}
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }} className="mb-6">
              <h2 className="text-lg font-semibold text-zinc-100">
                {(() => { if (isReset) { return "Reset Password"; } if (isSignUp) { return "Create Account"; } return "Welcome Back"; })()}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {(() => { if (isReset) { return "Enter your email to receive recovery instructions."; } if (isSignUp) { return "Sign up to start tracking your carbon score."; } return "Sign in to access your sustainability dashboard."; })()}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Feedback Messages */}
          {error && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
              <AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <CheckCircle className="h-4 w-4 shrink-0" /><span>{success}</span>
            </div>
          )}

          <LoginForm isSignUp={isSignUp} isReset={isReset} email={email} password={password} name={name}
            actionLoading={actionLoading} onEmailChange={setEmail} onPasswordChange={setPassword} onNameChange={setName}
            onResetClick={() => setIsReset(true)} onSubmit={handleAuth} />

          {!isReset && (
            <SocialLoginButtons actionLoading={actionLoading} onGoogleLogin={handleGoogleLogin} onDemoSignIn={handleDemoSignIn} />
          )}

          {/* Toggle Login/Signup modes */}
          <div className="text-center mt-6">
            <button onClick={() => { if (isReset) { setIsReset(false); } else { setIsSignUp(!isSignUp); } setError(""); setSuccess(""); }}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none">
              {(() => { if (isReset) { return "Back to Login"; } if (isSignUp) { return "Already have an account? Sign In"; } return "Don't have an account? Sign Up"; })()}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function validateAuthInputs(email: string, password: string, name: string, isSignUp: boolean, isReset: boolean): string | null {
  if (!email) return "Email address is required.";
  if (!isReset && !password) return "Password is required.";
  if (isSignUp && !name) return "Full name is required.";
  return null;
}

function getAuthErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  if (msg.includes("auth/user-not-found") || msg.includes("auth/wrong-password")) return "Invalid email or password combination.";
  if (msg.includes("auth/email-already-in-use")) return "This email address is already in use.";
  if (msg.includes("auth/weak-password")) return "Password should be at least 6 characters.";
  return "Authentication failed. Please check your credentials.";
}
