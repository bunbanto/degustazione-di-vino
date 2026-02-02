import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen !bg-amber-50 overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-rose-300/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-300/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-3s" }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-200/15 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Hero Section with liquid glass */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden !bg-amber-50">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/10 to-amber-50/90 z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920')] bg-cover bg-center opacity-15" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Main Title with glass effect */}
          <div className="liquid-glass-heavy inline-block px-8 py-4 rounded-3xl mb-6 animate-float">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-rose-900 drop-shadow-lg">
              Degustazione di Vino
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-rose-800 mb-10 italic font-serif liquid-glass inline-block px-6 py-2 rounded-full">
            Відкрийте для себе світ вин разом з нами
          </p>

          {/* Buttons with liquid glass */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cards"
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
              Переглянути каталог
            </Link>
            <Link
              href="/login"
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
              Увійти / Реєстрація
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section with glass cards */}
      <section className="py-20 px-4 !bg-white/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif text-center text-rose-900 mb-12 liquid-glass inline-block px-8 py-3 rounded-2xl mx-auto">
            Наші переваги
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="liquid-glass-heavy fluid-rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-500 hover:-translate-y-2">
              <div className="liquid-glass rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 animate-float">
                <span className="text-4xl">🍷</span>
              </div>
              <h3 className="text-2xl font-semibold text-rose-800 dark:text-rose-300 mb-4">
                Великий вибір
              </h3>
              <p className="text-rose-700 dark:text-rose-400">
                Колекція найкращих вин з усього світу
              </p>
            </div>

            {/* Feature 2 */}
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
              <h3 className="text-2xl font-semibold text-rose-800 dark:text-rose-300 mb-4">
                Рейтинги
              </h3>
              <p className="text-rose-700 dark:text-rose-400">
                Діліться своїми враженнями та оцінюйте вина
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="liquid-glass-heavy fluid-rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: "1s" }}
            >
              <div
                className="liquid-glass rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 animate-float"
                style={{ animationDelay: "1s" }}
              >
                <span className="text-4xl">👥</span>
              </div>
              <h3 className="text-2xl font-semibold text-rose-800 dark:text-rose-300 mb-4">
                Спільнота
              </h3>
              <p className="text-rose-700 dark:text-rose-400">
                Спілкуйтеся з любителями вин
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 !bg-gradient-to-r from-rose-900/10 to-amber-900/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="liquid-glass-heavy fluid-rounded-3xl p-10">
            <h2 className="text-3xl font-serif font-bold text-rose-900 dark:text-rose-300 mb-4">
              Готові почати?
            </h2>
            <p className="text-rose-700 dark:text-rose-400 mb-8 text-lg">
              Приєднуйтесь до нашої спільноти та відкрийте для себе світ вин
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-4 liquid-btn-wine rounded-2xl text-lg font-semibold hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Приєднатися зараз
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
