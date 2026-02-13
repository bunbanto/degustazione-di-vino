/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
