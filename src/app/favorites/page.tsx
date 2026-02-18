import type { Metadata } from "next";
import ClientFavoritesPage from "./ClientFavoritesPage";

export const metadata: Metadata = {
  title: "Мої улюблені",
  description:
    "Ваша персональна колекція улюблених вин. Швидкий доступ до вин, які вам сподобалися найбільше.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FavoritesPage() {
  return <ClientFavoritesPage />;
}
