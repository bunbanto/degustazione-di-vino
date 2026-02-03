import type { Metadata } from "next";
import ClientFavoritesPage from "./ClientFavoritesPage";

export const metadata: Metadata = {
  title: "Мої улюблені | Degustazione di Vino",
  description:
    "Ваша персональна колекція улюблених вин. Швидкий доступ до вин, які вам сподобалися найбільше.",
};

export default function FavoritesPage() {
  return <ClientFavoritesPage />;
}
