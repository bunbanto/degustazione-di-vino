import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl w-full liquid-glass-heavy rounded-3xl p-8 text-center">
        <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-2">
          Помилка 404
        </p>
        <h1 className="text-3xl font-serif font-bold text-rose-900 dark:text-rose-300 mb-3">
          Сторінку не знайдено
        </h1>
        <p className="text-rose-700 dark:text-rose-400 mb-6">
          Можливо, посилання застаріло або сторінку було переміщено.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/cards"
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors"
          >
            Перейти в каталог
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
