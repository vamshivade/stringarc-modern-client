/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false, // ✅ disables source maps in production
  webpack(config, { dev, isServer }) {
    if (dev) {
      config.devtool = false;
    }
    return config;
  },
};

module.exports = nextConfig;
