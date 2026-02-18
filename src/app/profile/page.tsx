import type { Metadata } from "next";
import ClientProfilePage from "./ClientProfilePage";

export const metadata: Metadata = {
  title: "Мій профіль",
  description:
    "Ваш особистий кабінет. Переглядайте статистику, керуйте своїми винами та улюбленими.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return <ClientProfilePage />;
}
