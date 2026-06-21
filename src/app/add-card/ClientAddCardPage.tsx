"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { cardsAPI, getApiErrorMessage } from "@/services/api";
import { WineCard } from "@/types";
import { withAuth } from "@/components/withAuth";
import {
  WINE_TYPES,
  getDrinkColorOptions,
  getDefaultColorForType,
  getWineTypeLabel,
  getWineColorLabel,
  isBeerDrinkType,
  isWineDrinkType,
  hasDrinkColorOptions,
} from "@/constants/wine";
import { t } from "@/i18n/i18n";
import { getLangFromPath, withLang } from "@/i18n/routeUtils";

function ClientAddCardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const lang = getLangFromPath(pathname);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "wine",
    color: "bianco",
    frizzante: false,
    unfiltered: false,
    winery: "",
    country: "",
    region: "",
    anno: "" as number | "",
    alcohol: 12,
    price: 0,
    description: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const showWineFields = isWineDrinkType(formData.type);
  const showBeerFields = isBeerDrinkType(formData.type);
  const showColorFields = hasDrinkColorOptions(formData.type);
  const colorOptions = getDrinkColorOptions(formData.type);

  const getDefaultAlcoholForType = (type: string) => {
    if (type === "beer") return 5;
    if (type === "liqueur") return 20;
    if (isWineDrinkType(type)) return 12;
    if (type === "other") return formData.alcohol;
    return 40;
  };

  const validateFile = useCallback((file: File): boolean => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setUploadError(t(lang, "form.image.allowed"));
      return false;
    }

    if (file.size > maxSize) {
      setUploadError(t(lang, "form.image.maxSize"));
      return false;
    }

    setUploadError("");
    return true;
  }, [lang]);

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [validateFile]);

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
  }, [handleFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await cardsAPI.create(
        {
          ...formData,
          anno: formData.anno === "" ? undefined : formData.anno,
          color: showColorFields ? formData.color : "bianco",
          frizzante: showWineFields ? formData.frizzante : false,
          unfiltered: showBeerFields ? formData.unfiltered : false,
          region: showWineFields ? formData.region : undefined,
        },
        imageFile || undefined,
      );
      router.push(withLang("/cards", lang));
    } catch (err) {
      setError(getApiErrorMessage(err, t(lang, "status.createCardError")));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    if (field === "type" && typeof value === "string") {
      const currentDefaultAlcohol = getDefaultAlcoholForType(formData.type);
      const nextDefaultAlcohol = getDefaultAlcoholForType(value);

      setFormData({
        ...formData,
        type: value,
        color: hasDrinkColorOptions(value)
          ? getDrinkColorOptions(value).includes(formData.color)
            ? formData.color
            : getDefaultColorForType(value)
          : "bianco",
        frizzante: isWineDrinkType(value) ? formData.frizzante : false,
        unfiltered: isBeerDrinkType(value) ? formData.unfiltered : false,
        alcohol:
          formData.alcohol === currentDefaultAlcohol
            ? nextDefaultAlcohol
            : formData.alcohol,
      });
      return;
    }

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

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-rose-900 dark:text-rose-300 mb-2">
              {t(lang, "addcard.page.title")}
            </h1>
            <p className="text-rose-700 dark:text-rose-400">
              {t(lang, "addcard.subtitle")}
            </p>
          </div>

          {/* Form Card */}
          <div className="glass-card rounded-2xl p-8 shadow-xl">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t(lang, "form.name")}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                  placeholder={t(lang, "form.example.wine")}
                />
              </div>

              {/* Type and Color Row */}
              <div
                className={`grid gap-6 ${
                  showColorFields ? "md:grid-cols-2" : "md:grid-cols-1"
                }`}
              >
                <div>
                  <label
                    htmlFor="add-card-type"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {t(lang, "filter.type")} *
                  </label>
                  <select
                    id="add-card-type"
                    value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                  >
                    {WINE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {getWineTypeLabel(type, lang)}
                      </option>
                    ))}
                  </select>
                </div>

                {showColorFields && (
                  <div>
                    <label
                      htmlFor="add-card-color"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {t(lang, "filter.color")} *
                    </label>
                    <select
                      id="add-card-color"
                      value={formData.color}
                      onChange={(e) => handleChange("color", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                    >
                      {colorOptions.map((color) => (
                        <option key={color} value={color}>
                          {getWineColorLabel(color, lang)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Frizzante Checkbox */}
              {showWineFields && <div>
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
              </div>}

              {showBeerFields && <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.unfiltered}
                      onChange={(e) =>
                        handleChange("unfiltered", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 dark:peer-focus:ring-rose-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors">
                    {t(lang, "filter.unfiltered")}
                  </span>
                </label>
              </div>}

              {/* Country and Region Row */}
              <div
                className={`grid gap-6 ${
                  showWineFields ? "md:grid-cols-2" : "md:grid-cols-1"
                }`}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t(lang, "form.country")}
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                    placeholder={t(lang, "form.example.country")}
                  />
                </div>

                {showWineFields && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t(lang, "form.region")}
                    </label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => handleChange("region", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                      placeholder={t(lang, "form.example.region")}
                    />
                  </div>
                )}
              </div>

              {/* Winery - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {showWineFields ? t(lang, "form.winery") : t(lang, "form.producer")}
                </label>
                <input
                  type="text"
                  required
                  value={formData.winery}
                  onChange={(e) => handleChange("winery", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                  placeholder={
                    showWineFields
                      ? t(lang, "form.example.winery")
                      : t(lang, "form.example.producer")
                  }
                />
              </div>

              {/* Year, Alcohol and Price Row */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t(lang, "form.year")}
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2030"
                    value={formData.anno}
                    onChange={(e) =>
                      handleChange(
                        "anno",
                        e.target.value === "" ? "" : parseInt(e.target.value),
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t(lang, "form.alcohol")}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
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
                    {t(lang, "form.price")}
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
                    placeholder={t(lang, "form.example.price")}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t(lang, "form.image")}
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
                      <p className="text-sm">{t(lang, "form.image.help")}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {t(lang, "form.image.limit")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={800}
                      height={384}
                      unoptimized
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t(lang, "form.description")}
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600 focus:border-transparent bg-white/50 dark:bg-dark-700/50 resize-none"
                  placeholder={t(lang, "form.description.placeholder")}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-500 dark:from-rose-700 dark:to-rose-600 text-white rounded-lg font-semibold hover:from-rose-700 hover:to-rose-600 dark:hover:from-rose-600 dark:hover:to-rose-500 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t(lang, "login.loading") : t(lang, "addcard.page.title")}
              </button>
            </form>
          </div>

          {/* Back Link */}
          <div className="text-center mt-6">
            <button
              onClick={() => router.back()}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 underline text-sm"
            >
              {t(lang, "form.back")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(ClientAddCardPage);
