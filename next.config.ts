import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",

  // Workaround for React 19 compatibility with react-query-swagger
  // Ensures React is properly resolved during build
  transpilePackages: ["react-query-swagger"],
};

export default nextConfig;
