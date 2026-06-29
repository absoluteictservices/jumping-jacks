/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Allow remote images (e.g. uploaded castle photos hosted on a CDN / object storage).
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
