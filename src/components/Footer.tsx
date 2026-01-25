import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="!bg-rose-900 !text-rose-100 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        {/* Copyright */}
        <div className="border-t !border-rose-800 mt-8 pt-8 text-center">
          <p className="font-serif italic !text-rose-300">
            © {currentYear} Degustazione di Vino. З любов&apos;ю до вина
          </p>
        </div>
      </div>
    </footer>
  );
}
