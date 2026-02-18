import type { Metadata } from "next";
import ClientCardViewPage from "./ClientCardViewPage";
import { SITE_NAME } from "@/lib/seo";

interface PageProps {
  params: Promise<{ id: string }>;
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
    process.env.NEXT_PUBLIC_API_URL ||
    "https://wine-server-b5gr.onrender.com";

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
  const card = (await getCardData(resolvedParams.id)) as MetadataCard | null;
  const canonicalUrl = `/cards/${resolvedParams.id}`;

  if (card && card.name) {
    // Build description with wine details
    const details: string[] = [];
    if (card.winery) details.push(card.winery);
    if (card.country) details.push(card.country);
    if (card.year || card.anno) details.push(`${card.year || card.anno} рік`);
    if (card.rating) details.push(`рейтинг ${card.rating.toFixed(1)}/10`);

    const description =
      details.length > 0
        ? `Детальна інформація про вино ${card.name} - ${details.join(", ")}. Оцінки, коментарі, характеристики та опис.`
        : `Перегляд детальної інформації про вино ${card.name}. Оцінки, коментарі, характеристики та опис.`;

    const imageUrl = card.img || card.image || "/opengraph-image";

    return {
      title: card.name,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: "article",
        locale: "uk_UA",
        siteName: SITE_NAME,
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
    title: "Картка вина",
    description:
      "Перегляд детальної інформації про вино. Оцінки, коментарі, характеристики та опис.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function CardViewPage() {
  return <ClientCardViewPage />;
}
