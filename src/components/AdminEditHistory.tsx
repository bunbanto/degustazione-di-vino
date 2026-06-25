"use client";

import { AdminEdit } from "@/types";
import { t, type Lang } from "@/i18n/i18n";

const FIELD_LABELS: Record<string, Record<Lang, string>> = {
  name: { uk: "Назва", en: "Name", it: "Nome" },
  type: { uk: "Тип", en: "Type", it: "Tipo" },
  color: { uk: "Колір", en: "Color", it: "Colore" },
  frizzante: { uk: "Frizzante", en: "Frizzante", it: "Frizzante" },
  unfiltered: { uk: "Нефільтроване", en: "Unfiltered", it: "Non filtrata" },
  winery: { uk: "Виробник", en: "Winery", it: "Cantina" },
  country: { uk: "Країна", en: "Country", it: "Paese" },
  region: { uk: "Регіон", en: "Region", it: "Regione" },
  anno: { uk: "Рік", en: "Year", it: "Anno" },
  alcohol: { uk: "Алкоголь", en: "Alcohol", it: "Alcol" },
  price: { uk: "Ціна", en: "Price", it: "Prezzo" },
  volume: { uk: "Об'єм", en: "Volume", it: "Volume" },
  description: { uk: "Опис", en: "Description", it: "Descrizione" },
  img: { uk: "Фото", en: "Image", it: "Immagine" },
};

function getFieldLabel(field: string, lang: Lang): string {
  return FIELD_LABELS[field]?.[lang] || field;
}

function formatDate(value: string, lang: Lang): string {
  const locale = lang === "uk" ? "uk-UA" : lang === "it" ? "it-IT" : "en-US";

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatValue(value: unknown, lang: Lang): string {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? t(lang, "common.yes") : t(lang, "common.no");
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    return value.length > 80 ? `${value.slice(0, 80)}...` : value;
  }

  return JSON.stringify(value);
}

export default function AdminEditHistory({
  edits,
  lang,
  compact = false,
}: {
  edits?: AdminEdit[];
  lang: Lang;
  compact?: boolean;
}) {
  if (!edits?.length) {
    return null;
  }

  const sortedEdits = [...edits].sort(
    (a, b) =>
      new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
  );

  return (
    <div
      className={
        compact
          ? "mb-4 liquid-glass rounded-2xl p-4"
          : "glass-card rounded-2xl p-6 shadow-lg"
      }
    >
      <h2
        className={
          compact
            ? "font-medium text-gray-700 dark:text-gray-300 mb-3"
            : "text-xl font-serif font-bold text-rose-900 dark:text-rose-300 mb-4"
        }
      >
        {t(lang, "card.adminChanges")}
      </h2>

      <div className="space-y-3">
        {sortedEdits.map((edit, index) => (
          <div
            key={edit._id || `${edit.changedAt}-${index}`}
            className="rounded-xl bg-white/50 dark:bg-dark-700/50 p-3 text-sm"
          >
            <div className="mb-2 text-gray-700 dark:text-gray-300">
              <span className="font-semibold">
                {edit.adminName || edit.adminEmail || t(lang, "common.admin")}
              </span>{" "}
              <span className="text-gray-500 dark:text-gray-400">
                {t(lang, "card.adminChangedAt")} {formatDate(edit.changedAt, lang)}
              </span>
            </div>

            <div className="space-y-1 text-gray-600 dark:text-gray-400">
              {edit.changes.map((change) => (
                <div key={`${edit.changedAt}-${change.field}`}>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {getFieldLabel(change.field, lang)}:
                  </span>{" "}
                  <span>{formatValue(change.oldValue, lang)}</span>
                  <span className="mx-1">→</span>
                  <span>{formatValue(change.newValue, lang)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
