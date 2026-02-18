import type { Metadata } from "next";
import ClientLoginPage from "./ClientLoginPage";

export const metadata: Metadata = {
  title: "Вхід та реєстрація",
  description:
    "Увійдіть або зареєструйтеся, щоб отримати доступ до повного функціоналу Degustazione di Vino. Зберігайте улюблені вина, оцінюйте та коментуйте.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <ClientLoginPage />;
}
