import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // We are publishing this app to OpenShift Rahti-2, so we need to set the base path
  async rewrites() {
    const rahtiServiceUrl =
      process.env.RAHTI_SERVICE_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/python/:path*",
        destination: `${rahtiServiceUrl}/api/:path*`, // Proxy to Python FastAPI service
      },
    ];
  },
};

export default nextConfig;
