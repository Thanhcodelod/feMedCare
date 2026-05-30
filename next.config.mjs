/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "img.vietqr.io" },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  experimental: {
    // `optimizePackageImports` already tree-shakes lucide-react safely
    // through Next's compiler. A custom `modularizeImports` rule is NOT
    // safe for lucide-react: each icon file uses `export { X as default }`
    // (no named export), so rewriting `import { Star } from "lucide-react"`
    // to that path makes `Star` undefined → renders nothing on the server,
    // mismatching the client and triggering hydration errors with the
    // generic "<svg> in <td>" message.
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns",
      "@radix-ui/react-icons",
      "clsx",
      "tailwind-merge",
      "zod",
    ],
  },
};

export default nextConfig;
