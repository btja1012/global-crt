import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Vercel routes /api/* to the api/ serverless functions before Next.js,
  // so no special configuration is needed here.
};

export default withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
  // Only upload source maps if SENTRY_AUTH_TOKEN is set
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
