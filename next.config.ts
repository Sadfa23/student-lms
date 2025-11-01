import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Fix: Tell Next.js the correct project root
  // This silences the warning about multiple lockfiles
  // Note: In Next.js 15+, this is a top-level setting (not in experimental)
  outputFileTracingRoot: "c:\\Users\\ADMIN\\Desktop\\PORTFOLIO-PROJECTS\\student-lms",
};

export default nextConfig;
