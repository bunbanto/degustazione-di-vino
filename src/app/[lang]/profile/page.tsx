import ClientProfilePage from "@/app/profile/ClientProfilePage";
import type { Metadata } from "next";
import { t, type Lang } from "@/i18n/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: t(lang, "profile.page.title"),
    description:
      lang === "uk"
        ? "Ваш особистий кабінет. Переглядайте статистику та керуйте своїми винами та налаштуваннями."
        : lang === "en"
          ? "Your personal dashboard. View your stats and manage your wines and settings."
          : "La tua area personale. Visualizza le tue statistiche e gestisci i tuoi vini e le impostazioni.",
    robots: { index: false, follow: false },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  await params;
  return <ClientProfilePage />;
}
