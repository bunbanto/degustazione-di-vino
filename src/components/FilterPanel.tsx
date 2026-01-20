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
    value: string | number | undefined,
  ) => {
    const newFilters = {
      ...localFilters,
      [key]: value === "" ? undefined : value,
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
  const wineColors = ["bianco", "rosso", "rosato", "sparkling"];

  // Translation helpers
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      secco: "Сухе",
      abboccato: "Напівсухе",
      amabile: "Напівсолодке",
      dolce: "Солодке",
    };
    return labels[type] || type;
  };

  const getColorLabel = (color: string) => {
    const labels: Record<string, string> = {
      bianco: "Біле",
      rosso: "Червоне",
      rosato: "Рожеве",
      sparkling: "Ігристе",
    };
    return labels[color] || color;
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-lg sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-rose-900">Фільтри</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-rose-600 hover:text-rose-800 underline"
        >
          Очистити
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Пошук
        </label>
        <input
          type="text"
          placeholder="Назва вина..."
          value={localFilters.search || ""}
          onChange={(e) => handleChange("search", e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/50 backdrop-blur"
        />
      </div>

      {/* Wine Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Тип вина
        </label>
        <select
          value={localFilters.type || ""}
          onChange={(e) => handleChange("type", e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/50 backdrop-blur"
        >
          <option value="">Усі типи</option>
          {wineTypes.map((type) => (
            <option key={type} value={type}>
              {getTypeLabel(type)}
            </option>
          ))}
        </select>
      </div>

      {/* Wine Color */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Колір
        </label>
        <select
          value={localFilters.color || ""}
          onChange={(e) => handleChange("color", e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/50 backdrop-blur"
        >
          <option value="">Усі кольори</option>
          {wineColors.map((color) => (
            <option key={color} value={color}>
              {getColorLabel(color)}
            </option>
          ))}
        </select>
      </div>

      {/* Minimum Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Мінімальний рейтинг
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={localFilters.minRating || 0}
            onChange={(e) =>
              handleChange("minRating", parseFloat(e.target.value))
            }
            className="flex-1 accent-rose-600"
          />
          <span className="text-rose-700 font-semibold min-w-[3ch]">
            {localFilters.minRating || 0}
          </span>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={applyFilters}
        className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-lg font-semibold hover:from-rose-700 hover:to-rose-600 transition-all shadow-md"
      >
        Застосувати
      </button>
    </div>
  );
}
