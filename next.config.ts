/**
 * @module next.config
 * @description Next.js configuration with production security headers,
 * image remote patterns, and package import optimizations.
 */
import type { NextConfig } from "next";

/**
 * Security headers applied to all routes.
 * These mitigate common web vulnerabilities including XSS, clickjacking,
 * MIME-type sniffing, and information leakage.
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
 * @see https://owasp.org/www-project-secure-headers/
 */
const securityHeaders = [
  {
    /** Prevents the page from being embedded in iframes (clickjacking protection) */
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    /** Stops browsers from MIME-sniffing the content-type */
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    /** Enforces HTTPS for 1 year, including subdomains */
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    /** Controls how much referrer information is sent with requests */
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    /** Disables browser features that are not needed (camera, mic, geolocation, etc.) */
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    /**
     * Content Security Policy - restricts resource loading origins.
     * - self: same origin
     * - unsafe-inline / unsafe-eval: required by Next.js in dev; review for prod
     * - Firebase and Google domains are explicitly allowed
     */
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "production" ? "" : "'unsafe-eval'"} https://apis.google.com https://www.googletagmanager.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://lh3.googleusercontent.com https://www.googletagmanager.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebase.com https://firebaseinstallations.googleapis.com https://www.google-analytics.com https://analyticsreporting.googleapis.com",
      "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
  {
    /** Opts out of Google's Federated Learning of Cohorts (FLoC) */
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  /**
   * Optimize tree-shaking for large icon and Firebase libraries.
   * This reduces client bundle size by only including used exports.
   */
  experimental: {
    optimizePackageImports: ["lucide-react", "firebase"],
  },

  /**
   * Apply security headers to all routes.
   * @returns Array of header configuration objects
   */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
