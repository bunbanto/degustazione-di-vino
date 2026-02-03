import type { Metadata } from "next";
import ClientLoginPage from "./ClientLoginPage";

export const metadata: Metadata = {
  title: "Вхід та реєстрація | Degustazione di Vino",
  description:
    "Увійдіть або зареєструйтеся, щоб отримати доступ до повного функціоналу Degustazione di Vino. Зберігайте улюблені вина, оцінюйте та коментуйте.",
};

export default function LoginPage() {
  return <ClientLoginPage />;
}
