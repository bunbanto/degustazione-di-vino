import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://degustazione-di-vino.com"),
  title: {
    default: "Degustazione di Vino | Відкрийте світ вин",
    template: "%s | Degustazione di Vino",
  },
  description:
    "Degustazione di Vino — ваш провідник у світі вин. Відкривайте, оцінюйте та діліться враженнями про найкращі вина з усього світу. Приєднуйтесь до спільноти любителів вин.",
  keywords: [
    "вино",
    "wine",
    "дегустація вин",
    "каталог вин",
    "рейтинги вин",
    "оцінки вин",
    "винний гід",
    "вина світу",
    "червоне вино",
    "біле вино",
    "рожеве вино",
    "ігристе вино",
  ],
  authors: [{ name: "Degustazione di Vino" }],
  creator: "Degustazione di Vino",
  publisher: "Degustazione di Vino",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "uk_UA",
    url: "/",
    siteName: "Degustazione di Vino",
    title: "Degustazione di Vino | Відкрийте світ вин",
    description:
      "Ваш провідник у світі вин. Відкривайте, оцінюйте та діліться враженнями про найкращі вина.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Degustazione di Vino",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Degustazione di Vino | Відкрийте світ вин",
    description:
      "Ваш провідник у світі вин. Відкривайте, оцінюйте та діліться враженнями.",
    images: ["/og-image.jpg"],
    creator: "@degustazione",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  category: "food & drink",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Script to apply theme before React hydration
const themeScript = `
  (function() {
    try {
      var savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (savedTheme === "light") {
        document.documentElement.classList.remove("dark");
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50 flex flex-col transition-colors duration-300">
        <ThemeProvider>
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
