import ClientLoginPage from "@/app/login/ClientLoginPage";
import type { Metadata } from "next";
import { t, type Lang } from "@/i18n/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: t(lang, "login.page.title"),
    description:
      lang === "uk"
        ? "Увійдіть або зареєструйтеся, щоб отримати доступ до вашого профілю та персональних функцій."
        : lang === "en"
          ? "Sign in or register to access your profile and personalized features."
          : "Accedi o registrati per accedere al tuo profilo e alle funzionalità personalizzate.",
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  await params;
  return <ClientLoginPage />;
}
