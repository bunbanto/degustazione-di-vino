import { t, type Lang } from "@/i18n/i18n";

export const WINE_TYPES = [
  "wine",
  "whiskey",
  "brandy",
  "gin",
  "rum",
  "liqueur",
  "grappa",
  "vodka",
  "other",
] as const;
export const WINE_COLORS = ["bianco", "rosso", "rosato"] as const;
const WINE_DRINK_TYPES = ["wine", "secco", "abboccato", "amabile", "dolce"];

type WineTypeValue = (typeof WINE_TYPES)[number];
type WineColorValue = (typeof WINE_COLORS)[number];

const WINE_TYPE_LABELS: Record<WineTypeValue, string> = {
  wine: "Wine",
  whiskey: "Whiskey",
  brandy: "Brandy",
  gin: "Gin",
  rum: "Rum",
  liqueur: "Liqueur",
  grappa: "Grappa",
  vodka: "Vodka",
  other: "Other",
};

const WINE_COLOR_LABELS: Record<WineColorValue, string> = {
  bianco: "Bianco",
  rosso: "Rosso",
  rosato: "Rosato",
};

export function getWineTypeLabel(value: string, lang?: Lang): string {
  if (lang) return t(lang, `wine.type.${value}`);
  return WINE_TYPE_LABELS[value as WineTypeValue] || value;
}

export function getWineColorLabel(value: string, lang?: Lang): string {
  if (lang) return t(lang, `wine.color.${value}`);
  return WINE_COLOR_LABELS[value as WineColorValue] || value;
}

export function isWineDrinkType(value?: string): boolean {
  return !value || WINE_DRINK_TYPES.includes(value);
}
