import ClientFavoritesPage from "@/app/favorites/ClientFavoritesPage";
import type { Metadata } from "next";
import { t, type Lang } from "@/i18n/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: t(lang, "favorites.page.title"),
    description:
      lang === "uk"
        ? "Ваша персональна колекція улюблених вин. Швидкий доступ до вин, які вам найбільше подобаються."
        : lang === "en"
          ? "Your personal collection of favorite wines. Quick access to the wines you love most."
          : "La tua collezione personale di vini preferiti. Accesso rapido ai vini che ami di più.",
    robots: { index: false, follow: false },
  };
}

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  await params;
  return <ClientFavoritesPage />;
}
