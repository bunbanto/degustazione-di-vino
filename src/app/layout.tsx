import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Degustazione di Vino",
  description: "Discover and rate the finest wines",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50 dark:from-dark-900 dark:to-dark-800 flex flex-col transition-colors duration-300">
        <ThemeProvider>
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
