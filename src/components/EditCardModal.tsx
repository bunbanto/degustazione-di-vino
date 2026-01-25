"use client";

import { useState, useEffect, useRef } from "react";
import { cardsAPI } from "@/services/api";
import { WineCard } from "@/types";

interface EditCardModalProps {
  card: WineCard;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditCardModal({
  card,
  isOpen,
  onClose,
  onSaved,
}: EditCardModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined,
  );
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "secco",
    color: "bianco",
    frizzante: false,
    winery: "",
    country: "",
    region: "",
    anno: new Date().getFullYear(),
    alcohol: 12,
    price: 0,
    description: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImageFlag, setRemoveImageFlag] = useState(false);

  // Initialize form data when card changes
  useEffect(() => {
    if (card && isOpen) {
      setFormData({
        name: card.name || "",
        type: card.type || "secco",
        color: card.color || "bianco",
        frizzante: card.frizzante || false,
        winery: card.winery || "",
        country: card.country || "",
        region: card.region || "",
        anno: card.anno || card.year || new Date().getFullYear(),
        alcohol: card.alcohol || 12,
        price: typeof card.price === "number" ? card.price : 0,
        description: card.description || "",
      });
      setImagePreview(card.img || card.image || undefined);
      setImageFile(null);
      setRemoveImageFlag(false);
    }
  }, [card, isOpen]);

  // Drag & Drop handlers
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      dropZone.classList.add(
        "border-rose-400",
        "bg-rose-50",
        "dark:bg-rose-900/20",
      );
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dropZone.classList.remove(
        "border-rose-400",
        "bg-rose-50",
        "dark:bg-rose-900/20",
      );
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dropZone.classList.remove(
        "border-rose-400",
        "bg-rose-50",
        "dark:bg-rose-900/20",
      );

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    };

    dropZone.addEventListener("dragover", handleDragOver);
    dropZone.addEventListener("dragleave", handleDragLeave);
    dropZone.addEventListener("drop", handleDrop);

    return () => {
      dropZone.removeEventListener("dragover", handleDragOver);
      dropZone.removeEventListener("dragleave", handleDragLeave);
      dropZone.removeEventListener("drop", handleDrop);
    };
  }, []);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setUploadError("Дозволені формати: JPG, PNG, WebP");
      return false;
    }

    if (file.size > maxSize) {
      setUploadError("Максимальний розмір файлу: 5MB");
      return false;
    }

    setUploadError("");
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setImageFile(file);
      setRemoveImageFlag(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await cardsAPI.update(
        card._id,
        formData,
        imageFile || undefined,
        removeImageFlag,
      );
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Помилка збереження картки");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Ви впевнені, що хочете видалити цю картку?")) return;

    setSaving(true);
    setError("");

    try {
      await cardsAPI.delete(card._id);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Помилка видалення картки");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(undefined);
    setRemoveImageFlag(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  const wineTypes = [
    { value: "secco", label: "Secco" },
    { value: "abboccato", label: "Abboccato" },
    { value: "amabile", label: "Amabile" },
    { value: "dolce", label: "Dolce" },
  ];

  const wineColors = [
    { value: "bianco", label: "Bianco" },
    { value: "rosso", label: "Rosso" },
    { value: "rosato", label: "Rosato" },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-dark-700">
          <h2 className="text-2xl font-serif font-bold text-rose-900 dark:text-rose-300">
            Редагувати вино
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            onClick={onClose}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Назва вина *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                placeholder="Наприклад: Chateau Margaux 2015"
              />
            </div>

            {/* Type and Color Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Тип вина *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                >
                  {wineTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Колір *
                </label>
                <select
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                >
                  {wineColors.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Frizzante Checkbox */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.frizzante}
                    onChange={(e) =>
                      handleChange("frizzante", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 dark:peer-focus:ring-rose-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors">
                  Frizzante
                </span>
              </label>
            </div>

            {/* Winery */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Виноробня *
              </label>
              <input
                type="text"
                required
                value={formData.winery}
                onChange={(e) => handleChange("winery", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                placeholder="Наприклад: Masso Antico"
              />
            </div>

            {/* Country and Region Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Країна
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                  placeholder="Наприклад: Італія"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Регіон
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => handleChange("region", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                  placeholder="Наприклад: Південна Італія"
                />
              </div>
            </div>

            {/* Year, Alcohol and Price Row */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Рік вина
                </label>
                <input
                  type="number"
                  min="1900"
                  max="2030"
                  value={formData.anno}
                  onChange={(e) =>
                    handleChange("anno", parseInt(e.target.value))
                  }
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Алкоголь (%) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="20"
                  step="0.5"
                  value={formData.alcohol}
                  onChange={(e) =>
                    handleChange("alcohol", parseFloat(e.target.value))
                  }
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ціна (€) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    handleChange("price", parseFloat(e.target.value))
                  }
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                  placeholder="Наприклад: 25.50"
                />
              </div>
            </div>

            {/* Average Rating Display */}
            <div className="bg-amber-50 dark:bg-dark-700 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-500">
                  {card.rating?.toFixed(1) || "0.0"}
                </div>
                <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>Середній рейтинг</div>
                  <div className="text-gray-500">
                    ({card.ratings?.length || 0} оцінок)
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Зображення
              </label>
              {!imagePreview ? (
                <div
                  ref={dropZoneRef}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-rose-400 dark:hover:border-rose-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                  <div className="text-gray-500 dark:text-gray-400">
                    <svg
                      className="w-12 h-12 mx-auto mb-2 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm">Натисніть або перетягніть фото</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      JPG, PNG, WebP (до 5MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
              {uploadError && (
                <p className="text-red-500 text-sm mt-2">{uploadError}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Опис
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50 resize-none"
                placeholder="Розкажіть про це вино..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-4 bg-gradient-to-r from-rose-600 to-rose-500 dark:from-rose-700 dark:to-rose-600 text-white rounded-lg font-semibold hover:from-rose-700 hover:to-rose-600 dark:hover:from-rose-600 dark:hover:to-rose-500 transition-all shadow-md disabled:opacity-50"
              >
                {saving ? "Збереження..." : "Зберегти зміни"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-6 py-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-800/50 transition-all disabled:opacity-50"
              >
                Видалити
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
