"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/i18n/i18n";
import { getLangFromPath, withLang } from "@/i18n/routeUtils";

export default function Footer() {
  const pathname = usePathname();
  const lang = getLangFromPath(pathname);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="!bg-rose-900 !text-rose-100 py-8 mt-auto relative overflow-hidden">
      <div className="absolute inset-0 liquid-glass pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="liquid-glass px-4 py-2 rounded-2xl">
            <Link
              href={withLang("/", lang)}
              className="text-xl font-serif font-bold text-rose-200 hover:text-white transition-colors"
            >
              🍷 Degustazione di Vino
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href={withLang("/cards", lang)}
              className="text-rose-300 hover:text-white transition-colors liquid-glass px-3 py-1.5 rounded-full text-sm"
            >
              {t(lang, "footer.catalog")}
            </Link>
            <Link
              href={withLang("/login", lang)}
              className="text-rose-300 hover:text-white transition-colors liquid-glass px-3 py-1.5 rounded-full text-sm"
            >
              {t(lang, "footer.login")}
            </Link>
          </div>
        </div>

        <div className="border-t !border-rose-800/50 pt-6 text-center">
          <div className="liquid-glass inline-block px-4 py-2 rounded-full">
            <p className="font-serif italic !text-rose-300">
              © {currentYear} Degustazione di Vino. {t(lang, "footer.copy")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
