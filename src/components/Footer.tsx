import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-rose-900 dark:bg-dark-950 text-rose-100 dark:text-rose-200 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        {/* Copyright */}
        <div className="border-t border-rose-800 dark:border-dark-800 mt-8 pt-8 text-center">
          <p className="font-serif italic text-rose-300 dark:text-rose-400">
            © {currentYear} Degustazione di Vino. З любов&apos;ю до вина
          </p>
        </div>
      </div>
    </footer>
  );
}
