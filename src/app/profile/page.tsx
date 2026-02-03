import type { Metadata } from "next";
import ClientProfilePage from "./ClientProfilePage";

export const metadata: Metadata = {
  title: "Мій профіль | Degustazione di Vino",
  description:
    "Ваш особистий кабінет. Переглядайте статистику, керуйте своїми винами та улюбленими.",
};

export default function ProfilePage() {
  return <ClientProfilePage />;
}
