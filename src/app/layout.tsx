import type { Metadata } from "next";
import "./globals.css";
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
    <html lang="uk">
      <body className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50 flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}
