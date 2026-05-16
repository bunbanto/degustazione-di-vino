import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { getLangFromSegment, getLocaleFromLang } from "@/i18n/i18n";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  getLangFromSegment(resolvedParams?.lang);

  return children;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = getLangFromSegment(resolvedParams?.lang);
  const locale = getLocaleFromLang(lang);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME}`,
      template: `%s | ${SITE_NAME}`,
    },
    description: "Degustazione di Vino — your wine discovery community.",
    keywords: ["wine", "degustazione", "catalog"],
    authors: [{ name: "Degustazione di Vino" }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    alternates: {
      canonical: `/${lang}`,
    },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale,
      url: `/${lang}`,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: "Degustazione di Vino — wine reviews & discovery.",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: "Degustazione di Vino — wine reviews & discovery.",
      images: ["/twitter-image"],
      creator: "@degustazione",
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
      apple: "/favicon.svg",
    },
    category: "food & drink",
  };
}
