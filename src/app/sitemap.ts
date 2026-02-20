import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://wine-server-b5gr.onrender.com";

interface ApiCard {
  _id: string;
  updatedAt?: string;
  createdAt?: string;
}

const SITEMAP_FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SITEMAP_FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      next: { revalidate: 3600 },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getCardUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/cards?page=1&limit=200`);

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as { results?: ApiCard[] };
    const cards = Array.isArray(data.results) ? data.results : [];

    return cards
      .filter((card) => Boolean(card?._id))
      .map((card) => ({
        url: `${SITE_URL}/cards/${card._id}`,
        lastModified: card.updatedAt || card.createdAt || new Date().toISOString(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/cards`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const cardRoutes = await getCardUrls();
  return [...staticRoutes, ...cardRoutes];
}
