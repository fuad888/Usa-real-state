import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Listing photos loaded from the Django media server, a CDN, or the sample
    // Unsplash imagery used in the demo seed data are allow-listed here.
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
