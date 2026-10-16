"use client";

import { useId, useMemo, useState } from "react";
import countries from "i18n-iso-countries";
import type { Lang } from "@/i18n/i18n";
import { getCountryFlagCode } from "@/utils/countryFlag";

interface CountrySelectProps {
  value: string;
  lang: Lang;
  onChange: (country: string) => void;
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}

export default function CountrySelect({ value, lang, onChange }: CountrySelectProps) {
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const options = useMemo(() => {
    const names = countries.getNames(lang, { select: "official" });
    return Object.entries(names)
      .map(([code, name]) => ({ code: code.toLowerCase(), name: String(name) }))
      .sort((a, b) => a.name.localeCompare(b.name, lang));
  }, [lang]);

  const selectedCode = getCountryFlagCode(value, lang);
  const selectedOption = options.find((option) => option.code === selectedCode);
  const visibleOptions = options.filter((option) =>
    normalizeSearch(option.name).includes(normalizeSearch(query.trim())),
  );

  const selectOption = (option: (typeof options)[number]) => {
    onChange(option.name);
    setQuery("");
    setIsOpen(false);
    setActiveIndex(0);
  };

  return (
    <div className="relative">
      <input
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={isOpen && visibleOptions[activeIndex] ? `${listboxId}-${visibleOptions[activeIndex].code}` : undefined}
        value={isOpen ? query : selectedOption?.name ?? value}
        onFocus={() => {
          setQuery("");
          setActiveIndex(0);
          setIsOpen(true);
        }}
        onChange={(event) => {
          const nextQuery = event.target.value;
          setQuery(nextQuery);
          setActiveIndex(0);
          setIsOpen(true);
          onChange("");
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, visibleOptions.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
          } else if (event.key === "Enter" && isOpen && visibleOptions[activeIndex]) {
            event.preventDefault();
            selectOption(visibleOptions[activeIndex]);
          } else if (event.key === "Escape") {
            setIsOpen(false);
            setQuery("");
          }
        }}
        onBlur={() => {
          setIsOpen(false);
          setQuery("");
        }}
        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
        aria-label={lang === "uk" ? "Країна" : lang === "it" ? "Paese" : "Country"}
        placeholder={lang === "uk" ? "Пошук країни..." : lang === "it" ? "Cerca un paese..." : "Search countries..."}
        autoComplete="off"
      />
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800"
        >
          {visibleOptions.length ? (
            visibleOptions.map((option, index) => (
              <li
                id={`${listboxId}-${option.code}`}
                key={option.code}
                role="option"
                aria-selected={option.code === selectedCode}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
                className={`flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-800 dark:text-gray-100 ${index === activeIndex ? "bg-rose-50 dark:bg-gray-700" : ""}`}
              >
                <span aria-hidden="true" className={`fi fi-${option.code}`} />
                {option.name}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              {lang === "uk" ? "Країн не знайдено" : lang === "it" ? "Nessun paese trovato" : "No countries found"}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
