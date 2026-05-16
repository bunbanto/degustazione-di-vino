import { t, type Lang } from "@/i18n/i18n";
import Link from "next/link";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang;

  return (
    <main className="home-page min-h-screen !bg-amber-50 overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-rose-300/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-300/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-3s" }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-200/15 rounded-full blur-3xl animate-pulse" />
      </div>

      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden !bg-amber-50">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/10 to-amber-50/90 z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920')] bg-cover bg-center opacity-15" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-rose-900 drop-shadow-lg mb-6 animate-float">
            {t(lang, "home.hero.title")}
          </h1>

          <p className="text-xl md:text-2xl text-rose-800 mb-10 italic font-serif liquid-glass inline-block px-6 py-2 rounded-full bg-white/30">
            {t(lang, "home.hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${lang}/cards`}
              className="px-8 py-4 liquid-btn-wine rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              {t(lang, "home.cta.catalog")}
            </Link>

            <Link
              href={`/${lang}/login`}
              className="px-8 py-4 liquid-glass rounded-2xl text-lg font-semibold border-2 border-rose-300 hover:bg-rose-100/50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              {t(lang, "home.cta.login")}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 !bg-white/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif text-center text-rose-900 mb-12 liquid-glass bg-white/30 w-fit px-8 py-3 rounded-2xl mx-auto">
            {t(lang, "home.features.title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="liquid-glass-heavy fluid-rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-500 hover:-translate-y-2">
              <div className="liquid-glass rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 animate-float">
                <span className="text-4xl">🍷</span>
              </div>
              <h3 className="text-2xl font-semibold text-rose-800 mb-4">
                {t(lang, "home.feature1.title")}
              </h3>
              <p className="text-rose-700">{t(lang, "home.feature1.body")}</p>
            </div>

            <div
              className="liquid-glass-heavy fluid-rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: "0.5s" }}
            >
              <div
                className="liquid-glass rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 animate-float"
                style={{ animationDelay: "0.5s" }}
              >
                <span className="text-4xl">⭐</span>
              </div>
              <h3 className="text-2xl font-semibold text-rose-800 mb-4">
                {t(lang, "home.feature2.title")}
              </h3>
              <p className="text-rose-700">{t(lang, "home.feature2.body")}</p>
            </div>

            <div
              className="liquid-glass-heavy fluid-rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: "1s" }}
            >
              <div
                className="liquid-glass rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 animate-float"
                style={{ animationDelay: "1s" }}
              >
                <span className="text-4xl">👑</span>
              </div>
              <h3 className="text-2xl font-semibold text-rose-800 mb-4">
                {t(lang, "home.feature3.title")}
              </h3>
              <p className="text-rose-700">{t(lang, "home.feature3.body")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 !bg-gradient-to-r from-rose-900/10 to-amber-900/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="liquid-glass-heavy fluid-rounded-3xl p-10">
            <h2 className="text-3xl font-serif font-bold text-rose-900 mb-4">
              {t(lang, "home.cta.title")}
            </h2>
            <p className="text-rose-700 mb-8 text-lg">
              {t(lang, "home.cta.body")}
            </p>
            <Link
              href={`/${lang}/login`}
              className="inline-block px-8 py-4 liquid-btn-wine rounded-2xl text-lg font-semibold hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
            >
              {t(lang, "home.cta.button")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
