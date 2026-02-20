/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "wine-server-b5gr.onrender.com" },
      { protocol: "http", hostname: "localhost", port: "4000" },
      { protocol: "http", hostname: "127.0.0.1", port: "4000" },
    ],
  },
  async rewrites() {
    // Використовуємо змінну середовища для API URL
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://wine-server-b5gr.onrender.com";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
