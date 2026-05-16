import ClientAddCardPage from "@/app/add-card/ClientAddCardPage";
import type { Metadata } from "next";
import { t, type Lang } from "@/i18n/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: t(lang, "addcard.page.title"),
    description:
      lang === "uk"
        ? "Додайте своє улюблене вино до каталогу. Поділіться назвою, характеристиками, зображенням та відгуком."
        : lang === "en"
          ? "Add your favorite wine to the catalog. Share the name, characteristics, image and notes."
          : "Aggiungi il tuo vino preferito al catalogo. Condividi nome, caratteristiche, immagine e note.",
    robots: { index: false, follow: false },
  };
}

export default async function AddCardPage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  await params;
  return <ClientAddCardPage />;
}
