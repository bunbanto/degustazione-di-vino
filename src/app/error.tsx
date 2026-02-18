"use client";

import Link from "next/link";
import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl w-full liquid-glass-heavy rounded-3xl p-8 text-center">
        <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-2">
          Помилка застосунку
        </p>
        <h1 className="text-3xl font-serif font-bold text-rose-900 dark:text-rose-300 mb-3">
          Щось пішло не так
        </h1>
        <p className="text-rose-700 dark:text-rose-400 mb-6">
          Ми не змогли виконати цю дію. Спробуйте перезавантажити сторінку або
          повернутися до каталогу.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors"
          >
            Спробувати ще раз
          </button>
          <Link
            href="/cards"
            className="px-5 py-2.5 rounded-xl liquid-glass text-rose-700 dark:text-rose-300 font-semibold hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-colors"
          >
            До каталогу
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl liquid-glass text-rose-700 dark:text-rose-300 font-semibold hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-colors"
          >
            На головну
          </Link>
        </div>
      </div>
    </div>
  );
}
