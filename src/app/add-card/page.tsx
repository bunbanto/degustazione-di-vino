import type { Metadata } from "next";
import ClientAddCardPage from "./ClientAddCardPage";

export const metadata: Metadata = {
  title: "Додати вино | Degustazione di Vino",
  description:
    "Додайте своє улюблене вино до каталогу. Поділіться назвою, характеристиками, зображенням та враженнями з спільнотою.",
};

export default function AddCardPage() {
  return <ClientAddCardPage />;
}
