import type { Metadata } from "next";
import ClientCardViewPage from "./ClientCardViewPage";

export function generateMetadata(): Metadata {
  return {
    title: "Картка вина | Degustazione di Vino",
    description:
      "Перегляд детальної інформації про вино. Оцінки, коментарі, характеристики та опис.",
  };
}

export default function CardViewPage() {
  return <ClientCardViewPage />;
}
