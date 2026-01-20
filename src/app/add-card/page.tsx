"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { cardsAPI } from "@/services/api";
import { WineCard } from "@/types";

export default function AddCardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "secco",
    color: "bianco",
    winery: "",
    country: "",
    region: "",
    anno: new Date().getFullYear(),
    alcohol: 12,
    price: 0,
    rating: 0,
    description: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  // Drag & Drop handlers
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      dropZone.classList.add("border-rose-400", "bg-rose-50");
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dropZone.classList.remove("border-rose-400", "bg-rose-50");
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dropZone.classList.remove("border-rose-400", "bg-rose-50");

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

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
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await cardsAPI.create(formData, imageFile || undefined);
      router.push("/cards");
    } catch (err: any) {
      setError(err.response?.data?.message || "Помилка створення картки");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
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
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const wineTypes = [
    { value: "secco", label: "Сухе" },
    { value: "abboccato", label: "Напівсухе" },
    { value: "amabile", label: "Напівсолодке" },
    { value: "dolce", label: "Солодке" },
  ];

  const wineColors = [
    { value: "bianco", label: "Біле" },
    { value: "rosso", label: "Червоне" },
    { value: "rosato", label: "Рожеве" },
    { value: "sparkling", label: "Ігристе" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-rose-900 mb-2">
              Додати вино
            </h1>
            <p className="text-rose-700">
              Поділіться своїм улюбленим вином із спільнотою
            </p>
          </div>

          {/* Form Card */}
          <div className="glass-card rounded-2xl p-8 shadow-xl">
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Назва вина *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/50"
                  placeholder="Наприклад: Chateau Margaux 2015"
                />
              </div>

              {/* Type and Color Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип вина *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/50"
                  >
                    {wineTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Колір *
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) => handleChange("color", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/50"
                  >
                    {wineColors.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Country and Region Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Країна
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/50"
                    placeholder="Наприклад: Франція"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Регіон
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => handleChange("region", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/50"
                    placeholder="Наприклад: Бордо"
                  />
                </div>
              </div>

              {/* Winery - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Виноробня *
                </label>
                <input
                  type="text"
                  required
                  value={formData.winery}
                  onChange={(e) => handleChange("winery", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/50"
                  placeholder="Наприклад: Masso Antico"
                />
              </div>

              {/* Year, Alcohol, Price and Rating Row */}
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/50"
                    placeholder="Наприклад: 25.50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Рейтинг (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) =>
                      handleChange("rating", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/50"
                    placeholder="Наприклад: 8.5"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Зображення
                </label>
                {!imagePreview ? (
                  <div
                    ref={dropZoneRef}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-rose-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                    <div className="text-gray-500">
                      <svg
                        className="w-12 h-12 mx-auto mb-2 text-gray-400"
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
                      <p className="text-xs text-gray-400 mt-1">
                        JPG, PNG, WebP (до 5MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Опис
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/50 resize-none"
                  placeholder="Розкажіть про це вино..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-lg font-semibold hover:from-rose-700 hover:to-rose-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Створення..." : "Додати вино"}
              </button>
            </form>
          </div>

          {/* Back Link */}
          <div className="text-center mt-6">
            <button
              onClick={() => router.back()}
              className="text-rose-600 hover:text-rose-800 underline text-sm"
            >
              ← Повернутися назад
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
