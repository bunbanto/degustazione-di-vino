import ClientCardViewPage from "@/app/cards/[id]/ClientCardViewPage";
import type { Metadata } from "next";
import { getLocaleFromLang, t, type Lang } from "@/i18n/i18n";

interface PageProps {
  params: Promise<{ lang: Lang; id: string }>;
}

interface MetadataCard {
  name?: string;
  winery?: string;
  country?: string;
  year?: number;
  anno?: number;
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
  const { lang, id } = await params;
  const locale = getLocaleFromLang(lang);
  const card = (await getCardData(id)) as MetadataCard | null;
  const canonicalUrl = `/${lang}/cards/${id}`;

  if (card?.name) {
    const details: string[] = [];
    if (card.winery) details.push(card.winery);
    if (card.country) details.push(card.country);
    if (card.year || card.anno) {
      details.push(
        lang === "en"
          ? `${card.year || card.anno}`
          : lang === "it"
            ? `anno ${card.year || card.anno}`
            : `${card.year || card.anno} рік`,
      );
    }
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
    title: t(lang, "cards.page.title"),
    description: "",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function CardViewPage({ params }: PageProps) {
  await params;
  return <ClientCardViewPage />;
}
