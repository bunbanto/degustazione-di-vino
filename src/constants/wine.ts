import { t, type Lang } from "@/i18n/i18n";

export const WINE_TYPES = [
  "wine",
  "beer",
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
export const BEER_COLORS = ["light", "dark"] as const;
const WINE_DRINK_TYPES = ["wine", "secco", "abboccato", "amabile", "dolce"];

type WineTypeValue = (typeof WINE_TYPES)[number];
type WineColorValue = (typeof WINE_COLORS)[number] | (typeof BEER_COLORS)[number];

const WINE_TYPE_LABELS: Record<WineTypeValue, string> = {
  wine: "Wine",
  beer: "Beer",
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
  light: "Light",
  dark: "Dark",
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

export function isBeerDrinkType(value?: string): boolean {
  return value === "beer";
}

export function hasDrinkColorOptions(value?: string): boolean {
  return isWineDrinkType(value) || isBeerDrinkType(value);
}

export function getDrinkColorOptions(value?: string): readonly string[] {
  if (isBeerDrinkType(value)) return BEER_COLORS;
  if (isWineDrinkType(value)) return WINE_COLORS;
  return [];
}

export function getDefaultColorForType(value?: string): string {
  return isBeerDrinkType(value) ? BEER_COLORS[0] : WINE_COLORS[0];
}
