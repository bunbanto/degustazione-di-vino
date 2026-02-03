import type { Metadata } from "next";
import ClientCardsPage from "./ClientCardsPage";

export const metadata: Metadata = {
  title: "Каталог вин | Degustazione di Vino",
  description:
    "Переглядайте та фільтруйте найкращі вина з усього світу. Шукайте за типом, кольором, рейтингом та іншими параметрами.",
};

export default function CardsPage() {
  return <ClientCardsPage />;
}
