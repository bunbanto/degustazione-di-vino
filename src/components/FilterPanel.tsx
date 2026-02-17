"use client";

import { FilterParams } from "@/types";
import { useState, useEffect } from "react";

interface FilterPanelProps {
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
}

export default function FilterPanel({
  filters,
  onFilterChange,
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterParams>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (
    key: keyof FilterParams,
    value: string | number | boolean | undefined,
  ) => {
    const newFilters = {
      ...localFilters,
      [key]: value === "" || value === false ? undefined : value,
    };

    // Remove undefined values
    Object.keys(newFilters).forEach((k) => {
      if (newFilters[k as keyof FilterParams] === undefined) {
        delete newFilters[k as keyof FilterParams];
      }
    });

    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterParams = {};
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const wineTypes = ["secco", "abboccato", "amabile", "dolce"];
  const wineColors = ["bianco", "rosso", "rosato"];

  // Translation helpers
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      secco: "Secco",
      abboccato: "Abboccato",
      amabile: "Amabile",
      dolce: "Dolce",
    };
    return labels[type] || type;
  };

  const getColorLabel = (color: string) => {
    const labels: Record<string, string> = {
      bianco: "Bianco",
      rosso: "Rosso",
      rosato: "Rosato",
    };
    return labels[color] || color;
  };

  return (
    <div className="liquid-glass-heavy fluid-rounded-2xl p-6 sticky top-24">
      {/* Header with glass effect */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2">
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Фільтри
        </h2>
        <button
          onClick={clearFilters}
          className="text-sm text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 underline transition-colors"
        >
          Очистити
        </button>
      </div>

      {/* Search with liquid input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Пошук
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Назва вина..."
            value={localFilters.search || ""}
            onChange={(e) => handleChange("search", e.target.value)}
            className="liquid-input pl-24"
          />
        </div>
      </div>

      {/* Wine Type with liquid select */}
      <div className="mb-6">
        <label
          htmlFor="wine-type-filter"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Тип вина
        </label>
        <select
          id="wine-type-filter"
          value={localFilters.type || ""}
          onChange={(e) => handleChange("type", e.target.value)}
          className="liquid-select"
        >
          <option value="">Усі типи</option>
          {wineTypes.map((type) => (
            <option key={type} value={type}>
              {getTypeLabel(type)}
            </option>
          ))}
        </select>
      </div>

      {/* Wine Color with liquid select */}
      <div className="mb-6">
        <label
          htmlFor="wine-color-filter"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Колір
        </label>
        <select
          id="wine-color-filter"
          value={localFilters.color || ""}
          onChange={(e) => handleChange("color", e.target.value)}
          className="liquid-select"
        >
          <option value="">Усі кольори</option>
          {wineColors.map((color) => (
            <option key={color} value={color}>
              {getColorLabel(color)}
            </option>
          ))}
        </select>
      </div>

      {/* Frizzante Checkbox with liquid toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={localFilters.frizzante === true}
              onChange={(e) =>
                handleChange("frizzante", e.target.checked ? true : undefined)
              }
              className="sr-only peer"
            />
            <div className="w-10 h-6 liquid-glass rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 dark:peer-focus:ring-rose-900 cursor-pointer transition-all"></div>
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-gray-200 rounded-full shadow-md transition-all peer-checked:translate-x-4 peer-checked:bg-rose-500"></div>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors">
            Frizzante
          </span>
        </label>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ціна
        </label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="number"
              min="0"
              placeholder="Від"
              value={localFilters.minPrice || ""}
              onChange={(e) =>
                handleChange(
                  "minPrice",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="liquid-input w-full"
            />
          </div>
          <span className="text-gray-400">—</span>
          <div className="flex-1">
            <input
              type="number"
              min="0"
              placeholder="До"
              value={localFilters.maxPrice || ""}
              onChange={(e) =>
                handleChange(
                  "maxPrice",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="liquid-input w-full"
            />
          </div>
        </div>
      </div>

      {/* Minimum Rating with liquid slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Мінімальний рейтинг
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={localFilters.minRating || 0}
            onChange={(e) =>
              handleChange("minRating", parseFloat(e.target.value))
            }
            className="flex-1 accent-rose-600 dark:accent-rose-500 h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #df4b51 0%, #df4b51 ${(localFilters.minRating || 0) * 10}%, rgba(148, 163, 184, 0.3) ${(localFilters.minRating || 0) * 10}%, rgba(148, 163, 184, 0.3) 100%)`,
            }}
          />
          <span className="liquid-glass px-3 py-1.5 rounded-xl text-rose-700 dark:text-rose-400 font-bold min-w-[3ch] text-center">
            {localFilters.minRating || 0}
          </span>
        </div>
      </div>

      {/* Apply Button with liquid wine gradient */}
      <button
        onClick={applyFilters}
        className="w-full py-3.5 liquid-btn-wine rounded-2xl font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
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
            d="M5 13l4 4L19 7"
          />
        </svg>
        Застосувати
      </button>
    </div>
  );
}
