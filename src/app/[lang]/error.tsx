"use client";

import Link from "next/link";
import { useEffect } from "react";
import { t, type Lang } from "@/i18n/i18n";
import { usePathname } from "next/navigation";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function currentLangFromPath(pathname: string): Lang {
  const parts = pathname.split("/").filter(Boolean);
  const lang = parts.find((p) => p === "uk" || p === "en" || p === "it");
  return (
    lang === "uk" || lang === "en" || lang === "it" ? lang : "uk"
  ) as Lang;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const pathname = usePathname();
  const lang = currentLangFromPath(pathname);

  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl w-full liquid-glass-heavy rounded-3xl p-8 text-center">
        <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-2">
          {t(lang, "error.title")}
        </p>
        <h1 className="text-3xl font-serif font-bold text-rose-900 dark:text-rose-300 mb-3">
          {t(lang, "error.subtitle")}
        </h1>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors"
          >
            {t(lang, "error.retry")}
          </button>
          <Link
            href={`/${lang}/cards`}
            className="px-5 py-2.5 rounded-xl liquid-glass text-rose-700 dark:text-rose-300 font-semibold hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-colors"
          >
            {t(lang, "error.backCatalog")}
          </Link>
          <Link
            href={`/${lang}`}
            className="px-5 py-2.5 rounded-xl liquid-glass text-rose-700 dark:text-rose-300 font-semibold hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-colors"
          >
            {t(lang, "error.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
