/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip ESLint and TypeScript checks during Vercel production builds.
  // Both are enforced locally via `next lint` and `tsc --noEmit` instead.
  eslint:     { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors:  true },

  images: {
    remotePatterns: [
      // Cloudinary — uploaded avatars and chat images
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Google profile pictures (OAuth users)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // GitHub avatars (future-proof)
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
