import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Paquet autonome pour l’hébergement cPanel (o2switch) : activé par scripts/build-o2switch.mjs
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  poweredByHeader: false,
  serverExternalPackages: ["pg"],
  experimental: { serverActions: { bodySizeLimit: "30mb" } },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
