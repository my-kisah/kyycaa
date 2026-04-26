import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  outputFileTracingIncludes: {
    "/*": ["./prisma/dev.db", "./dev.db"],
    "/admin/login": ["./prisma/dev.db", "./dev.db"],
    "/login": ["./prisma/dev.db", "./dev.db"],
    "/register": ["./prisma/dev.db", "./dev.db"],
    "/api/auth/[...nextauth]": ["./prisma/dev.db", "./dev.db"],
    "/api/register": ["./prisma/dev.db", "./dev.db"],
  },
};

export default nextConfig;
