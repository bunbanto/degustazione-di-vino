import type { Metadata } from "next";
import ClientAddCardPage from "./ClientAddCardPage";

export const metadata: Metadata = {
  title: "Додати вино",
  description:
    "Додайте своє улюблене вино до каталогу. Поділіться назвою, характеристиками, зображенням та враженнями з спільнотою.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AddCardPage() {
  return <ClientAddCardPage />;
}
