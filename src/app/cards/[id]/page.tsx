import ClientCardViewPage from "./ClientCardViewPage";
import type { Metadata } from "next";
import { t, type Lang } from "@/i18n/i18n";
import { getLocaleFromLang } from "@/i18n/i18n";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface MetadataCard {
  name?: string;
  winery?: string;
  country?: string;
  year?: number;
  anno?: number;
  volume?: number | string;
  rating?: number;
  img?: string;
  image?: string;
}

async function getCardData(id: string) {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://wine-server-b5gr.onrender.com";

  try {
    const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching card data:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  // This route DOES NOT include [lang], so keep metadata deterministic.
  // Language-specific metadata is handled by /cards/[id]/[lang] route.
  const lang: Lang = "uk";
  const locale = getLocaleFromLang(lang);

  const card = (await getCardData(resolvedParams.id)) as MetadataCard | null;
  const canonicalUrl = `/cards/${resolvedParams.id}`;

  if (card && card.name) {
    const details: string[] = [];
    if (card.winery) details.push(card.winery);
    if (card.country) details.push(card.country);
    if (card.year || card.anno) details.push(`${card.year || card.anno} рік`);
    if (card.volume) details.push(`${card.volume} мл`);
    if (card.rating) details.push(`rating ${card.rating.toFixed(1)}/10`);

    const description =
      details.length > 0
        ? `${card.name} - ${details.join(", ")}.`
        : `${card.name}.`;

    const imageUrl = card.img || card.image || "/opengraph-image";

    return {
      title: card.name,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: "article",
        locale,
        siteName: "Degustazione di Vino",
        url: canonicalUrl,
        title: card.name,
        description,
        images: [{ url: imageUrl, alt: card.name }],
      },
      twitter: {
        card: "summary_large_image",
        title: card.name,
        description,
        images: [imageUrl],
      },
    };
  }

  return {
    title: t("uk", "cards.page.title"),
    description: "",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function CardViewPage({ params }: PageProps) {
  // Note: this route is /cards/[id] (no [lang] param). Keep it functional but
  // language-specific UI is handled by components/other [lang] routes.
  await params;
  return <ClientCardViewPage />;
}
