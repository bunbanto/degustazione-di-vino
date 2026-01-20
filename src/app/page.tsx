import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/20 to-amber-50/90 z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920')] bg-cover bg-center opacity-20" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-rose-900 mb-6 drop-shadow-lg">
            Degustazione di Vino
          </h1>
          <p className="text-xl md:text-2xl text-rose-800 mb-8 italic font-serif">
            Відкрийте для себе світ винразом з нами
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cards"
              className="px-8 py-4 bg-gradient-to-r from-rose-700 to-rose-600 text-white rounded-full text-lg font-semibold shadow-lg hover:from-rose-800 hover:to-rose-700 transition-all transform hover:scale-105"
            >
              Переглянути каталог
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white/80 backdrop-blur text-rose-800 rounded-full text-lg font-semibold border-2 border-rose-300 hover:bg-rose-50 transition-all"
            >
              Увійти / Реєстрація
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif text-center text-rose-900 mb-12">
            Наші переваги
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl text-center hover:transform hover:scale-105 transition-all">
              <div className="text-6xl mb-4">🍷</div>
              <h3 className="text-2xl font-semibold text-rose-800 mb-4">
                Великий вибір
              </h3>
              <p className="text-rose-700">
                Колекція найкращих вин з усього світу
              </p>
            </div>
            <div className="glass-card p-8 rounded-2xl text-center hover:transform hover:scale-105 transition-all">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-2xl font-semibold text-rose-800 mb-4">
                Рейтинги
              </h3>
              <p className="text-rose-700">
                Діліться своїми враженнями та оцінюйте вина
              </p>
            </div>
            <div className="glass-card p-8 rounded-2xl text-center hover:transform hover:scale-105 transition-all">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-semibold text-rose-800 mb-4">
                Спільнота
              </h3>
              <p className="text-rose-700">Спілкуйтеся з любителями вин</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
