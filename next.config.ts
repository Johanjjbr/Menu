import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components + Partial Prefetching: los defaults de Next.js 16.
  // Todo lo que lee cookies o datos "en vivo" va dentro de <Suspense>.
  cacheComponents: true,
  partialPrefetching: true,

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  images: {
    // Permite que <Image> optimice las fotos guardadas en Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
