"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { cardsAPI } from "@/services/api";
import { WineCard } from "@/types";

export default function EditCardPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    frizzante: false,
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
  const [existingImage, setExistingImage] = useState<string>("");

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
      fetchCard();
    }
  }, [router, id]);

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

  const fetchCard = async () => {
    try {
      const card = await cardsAPI.getById(id);
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
        rating: card.rating || 0,
        description: card.description || "",
      });
      setExistingImage(card.img || "");
      setImagePreview(card.img || null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Помилка завантаження картки");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await cardsAPI.update(id, formData, imageFile || undefined);
      router.push("/cards");
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
      await cardsAPI.delete(id);
      router.push("/cards");
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
    setImagePreview(existingImage);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-64 pt-24">
          <div className="text-rose-600 text-lg">Завантаження...</div>
        </div>
      </div>
    );
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
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-rose-900 mb-2">
              Редагувати вино
            </h1>
            <p className="text-rose-700">Змініть інформацію про вино</p>
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
                    <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700 transition-colors">
                    Frizzante
                  </span>
                </label>
              </div>

              {/* Winery */}
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
                    placeholder="Наприклад: Італія"
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
                    placeholder="Наприклад: Південна Італія"
                  />
                </div>
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
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-rose-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
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
                      <p className="text-sm">Натисніть для завантаження фото</p>
                      <p className="text-xs text-gray-400 mt-1">
                        JPG, PNG, WebP
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-48 object-cover rounded-lg"
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

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-lg font-semibold hover:from-rose-700 hover:to-rose-600 transition-all shadow-md disabled:opacity-50"
                >
                  {saving ? "Збереження..." : "Зберегти зміни"}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-6 py-4 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all disabled:opacity-50"
                >
                  Видалити
                </button>
              </div>
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
