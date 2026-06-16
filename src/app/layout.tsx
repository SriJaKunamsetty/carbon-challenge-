/**
 * @module RootLayout
 * @description Root layout for CarbonMind AI application.
 * Provides global font configuration, AuthProvider context,
 * skip navigation for accessibility, and error boundary protection.
 */
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

/** SEO metadata for the application */
export const metadata: Metadata = {
  title: {
    default: "CarbonMind AI - Your Personal Carbon Intelligence Platform",
    template: "%s | CarbonMind AI",
  },
  description:
    "AI-powered carbon intelligence platform that helps you measure, track, simulate, and reduce your environmental impact through personalized insights.",
  keywords: [
    "carbon footprint",
    "sustainability",
    "climate action",
    "carbon tracking",
    "AI coach",
    "eco friendly",
  ],
  authors: [{ name: "CarbonMind Team" }],
  openGraph: {
    type: "website",
    title: "CarbonMind AI",
    description: "Your Personal Carbon Intelligence Platform",
    siteName: "CarbonMind AI",
  },
  robots: { index: true, follow: true },
};

/** Viewport configuration */
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

/**
 * Root layout component wrapping all pages.
 * Provides authentication context, accessibility features, and global styles.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-black text-zinc-100">
        {/* Skip navigation link for keyboard accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:bg-emerald-600 focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-black transition-all"
        >
          Skip to main content
        </a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
