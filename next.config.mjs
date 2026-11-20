/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    cpus: 1,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      { source: "/admin/dashboard", destination: "/", permanent: false },
      { source: "/admin/pesanan", destination: "/bookings/list", permanent: false },
      { source: "/admin/keuangan", destination: "/finance", permanent: false },
      { source: "/admin/kemitraan", destination: "/travels", permanent: false },
      { source: "/admin/master-data", destination: "/packages", permanent: false },
      { source: "/admin/administrator/pengguna", destination: "/users", permanent: false },
      { source: "/admin/pengaturan/profil", destination: "/settings/profil", permanent: false },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/admin/:path*",
        destination: "/:path*",
      },
    ];
  },
};

export default nextConfig;
