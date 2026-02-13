import type { Metadata } from "next";
import ClientCardViewPage from "./ClientCardViewPage";

interface PageProps {
  params: Promise<{ id: string }>;
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
  const card = await getCardData(resolvedParams.id);

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

    return {
      title: `${card.name} | Degustazione di Vino`,
      description,
    };
  }

  return {
    title: "Картка вина | Degustazione di Vino",
    description:
      "Перегляд детальної інформації про вино. Оцінки, коментарі, характеристики та опис.",
  };
}

export default function CardViewPage() {
  return <ClientCardViewPage />;
}
