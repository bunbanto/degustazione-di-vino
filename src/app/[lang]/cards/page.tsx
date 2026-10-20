import ClientCardsPage from "@/app/cards/ClientCardsPage";
import type { Metadata } from "next";
import { t, type Lang } from "@/i18n/i18n";
import { SITE_NAME } from "@/lib/seo";
import { SUPPORTED_LANGS } from "@/i18n/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: t(lang, "cards.page.title"),
    description:
      lang === "uk"
        ? "Переглядайте найкращі вина з усього світу. Шукайте за типом, кольором, рейтингом та іншими параметрами."
        : lang === "en"
          ? "Browse the best wines from around the world. Search by type, color, rating and more."
          : "Esplora i migliori vini da tutto il mondo. Cerca per tipo, colore, valutazione e altro.",
    alternates: {
      canonical: `/${lang}/cards`,
      languages: Object.fromEntries(
        SUPPORTED_LANGS.map((supportedLang) => [supportedLang, `/${supportedLang}/cards`]),
      ),
    },
    openGraph: { url: `/${lang}/cards`, siteName: SITE_NAME },
  };
}

export default async function CardsPage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  await params;
  return <ClientCardsPage />;
}
