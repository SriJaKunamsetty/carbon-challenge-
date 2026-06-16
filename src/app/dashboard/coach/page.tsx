"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Send, User, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { logger } from "@/lib/logger";

const LOG_CTX = { module: "AICoachPage" };

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AICoachPage() {
  const { profile } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default welcome message
  const welcomeText = `Hello ${profile?.name || "Eco Friend"}! I'm your **CarbonMind AI Coach**.

I'm here to analyze your carbon habits, suggest easy lifestyle hacks to lower emissions, and answer questions about sustainability.

Here are a few things you can ask me:
1. *"How can I reduce my transportation carbon footprint?"*
2. *"Is eating chicken significantly better than beef for the environment?"*
3. *"What are some ways to save electricity on home cooling?"*
4. *"Can you give me a personalized carbon reduction plan?"*

How can I help you live more sustainably today?`;

  useEffect(() => {
    let active = true;
    if (globalThis.window !== undefined) {
      try {
        const stored = localStorage.getItem("carbonmind_chat_history");
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as typeof messages;
            if (active) setMessages(parsed);
            return () => { active = false; };
          } catch (e) {
            logger.error(LOG_CTX, "Failed to parse chat history", e);
          }
        }
      } catch (storageError) {
        // localStorage may be restricted or over quota on some devices/browsers
        logger.error(LOG_CTX, "Failed to access localStorage for chat history", storageError);
      }
    }
    // Default welcome message
    if (active) setMessages([
      { role: "assistant", content: welcomeText }
    ]);
    return () => { active = false; };
  }, [profile, welcomeText]);

  useEffect(() => {
    if (globalThis.window !== undefined && messages.length > 0) {
      try {
        localStorage.setItem("carbonmind_chat_history", JSON.stringify(messages));
      } catch (storageError) {
        // Storage quota exceeded or restricted — chat still works in memory
        logger.error(LOG_CTX, "Failed to persist chat history to localStorage", storageError);
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userText = inputText;
    setInputText("");
    
    // Add user message to state
    const updatedHistory = [...messages, { role: "user" as const, content: userText }];
    setMessages(updatedHistory);
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: userText,
          mode: "chat",
          history: updatedHistory.slice(-6), // pass recent history context
          profile: {
            name: profile?.name,
            carbonScore: profile?.carbonScore,
            goal: profile?.goal,
            country: profile?.country,
            occupation: profile?.occupation
          },
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      } else {
        throw new Error(data.error || "Empty response");
      }
    } catch (error) {
      logger.error(LOG_CTX, "AI Coach connection failed", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm sorry, I encountered a connection error. Please check your network and try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (globalThis.window !== undefined) {
      localStorage.removeItem("carbonmind_chat_history");
    }
    setMessages([
      { role: "assistant", content: welcomeText }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            AI Sustainability Coach
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Discuss customized strategies, analyze habits, and map out carbon-reduction goals.
          </p>
        </div>

        <button
          onClick={handleClearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-white/20 bg-zinc-950/40 hover:bg-zinc-900/60 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Reset Chat"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Messages Scroll Box */}
      <GlassCard className="flex-1 p-6 overflow-y-auto flex flex-col space-y-6 bg-black/60 relative" role="log" aria-live="polite">
        <div className="flex-1 space-y-6">
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={`${msg.role}-${index}`}
                className={`flex gap-4 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 text-xs font-bold ${
                  isUser
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                }`} aria-hidden="true">
                  {isUser ? <User className="h-4 w-4" /> : "AI"}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-2xl border ${
                  isUser
                    ? "bg-zinc-950/40 border-white/[0.06] rounded-tr-none text-zinc-300"
                    : "bg-zinc-900/40 border-white/[0.04] rounded-tl-none prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800"
                }`}>
                  {isUser ? (
                    <p className="text-xs text-zinc-200 font-sans leading-relaxed m-0">{msg.content}</p>
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading bubble */}
          {loading && (
            <div className="flex gap-4 max-w-[85%] mr-auto" aria-label="AI is typing...">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs" aria-hidden="true">
                AI
              </div>
              <div className="p-4 rounded-2xl border bg-zinc-900/40 border-white/[0.04] rounded-tl-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full motion-safe:animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full motion-safe:animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full motion-safe:animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </GlassCard>

      {/* Input Message Footer */}
      <form onSubmit={handleSendMessage} className="flex gap-3 shrink-0">
        <label htmlFor="chat-input" className="sr-only">Type your message</label>
        <input
          id="chat-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask your Coach a question..."
          className="flex-1 bg-zinc-950/60 border border-white/[0.08] rounded-2xl px-5 py-4 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all font-sans"
          disabled={loading}
          autoComplete="off"
        />
        <Button 
          type="submit" 
          className="h-[50px] w-[50px] rounded-2xl flex items-center justify-center px-0 shrink-0" 
          disabled={loading || !inputText.trim()}
          aria-label="Send message"
        >
          <Send className="h-4.5 w-4.5" aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}
