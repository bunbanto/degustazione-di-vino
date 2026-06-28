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
export const WINE_SWEETNESS = [
  "secco",
  "abboccato",
  "amabile",
  "dolce",
] as const;

type WineTypeValue = (typeof WINE_TYPES)[number];
type WineColorValue = (typeof WINE_COLORS)[number] | (typeof BEER_COLORS)[number];
type WineSweetnessValue = (typeof WINE_SWEETNESS)[number];

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

const LEGACY_WINE_STYLE_LABELS: Record<
  Lang,
  Record<WineSweetnessValue, string>
> = {
  uk: {
    secco: "Сухе",
    abboccato: "Напівсухе",
    amabile: "Напівсолодке",
    dolce: "Солодке",
  },
  en: {
    secco: "Dry",
    abboccato: "Off-dry",
    amabile: "Medium-sweet",
    dolce: "Sweet",
  },
  it: {
    secco: "Secco",
    abboccato: "Abboccato",
    amabile: "Amabile",
    dolce: "Dolce",
  },
};

const WINE_TYPE_ALIASES: Record<string, WineTypeValue> = {
  "wine.type.wine": "wine",
  "wine.type.beer": "beer",
  "wine.type.whiskey": "whiskey",
  "wine.type.brandy": "brandy",
  "wine.type.gin": "gin",
  "wine.type.rum": "rum",
  "wine.type.liqueur": "liqueur",
  "wine.type.grappa": "grappa",
  "wine.type.vodka": "vodka",
  "wine.type.other": "other",
  vino: "wine",
  вино: "wine",
  birra: "beer",
  пиво: "beer",
};

const LEGACY_WINE_STYLE_ALIASES: Record<string, WineSweetnessValue> = {
  "wine.type.secco": "secco",
  "wine.type.abboccato": "abboccato",
  "wine.type.amabile": "amabile",
  "wine.type.dolce": "dolce",
  secco: "secco",
  dry: "secco",
  abboccato: "abboccato",
  "off-dry": "abboccato",
  amabile: "amabile",
  "medium-sweet": "amabile",
  dolce: "dolce",
  sweet: "dolce",
};

const WINE_COLOR_ALIASES: Record<string, WineColorValue> = {
  "wine.color.bianco": "bianco",
  "wine.color.rosso": "rosso",
  "wine.color.rosato": "rosato",
  "wine.color.light": "light",
  "wine.color.dark": "dark",
  light: "light",
  dark: "dark",
  white: "bianco",
  red: "rosso",
  rose: "rosato",
  rosé: "rosato",
  біле: "bianco",
  червоне: "rosso",
  рожеве: "rosato",
  світле: "light",
  темне: "dark",
};

export function normalizeWineType(value?: string): WineTypeValue | undefined {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return undefined;

  if ((WINE_TYPES as readonly string[]).includes(normalized)) {
    return normalized as WineTypeValue;
  }

  return WINE_TYPE_ALIASES[normalized];
}

export function normalizeWineStyle(
  value?: string,
): WineSweetnessValue | undefined {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return undefined;

  return LEGACY_WINE_STYLE_ALIASES[normalized];
}

export function normalizeDrinkColor(value?: string): WineColorValue | undefined {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return undefined;

  if (
    (WINE_COLORS as readonly string[]).includes(normalized) ||
    (BEER_COLORS as readonly string[]).includes(normalized)
  ) {
    return normalized as WineColorValue;
  }

  return WINE_COLOR_ALIASES[normalized];
}

export function getWineTypeLabel(value: string, lang?: Lang): string {
  const normalized = normalizeWineType(value);
  if (normalized && lang) return t(lang, `wine.type.${normalized}`);
  if (normalized) return WINE_TYPE_LABELS[normalized];

  const legacyStyle = normalizeWineStyle(value);
  if (legacyStyle && lang) return t(lang, "wine.type.wine");
  if (legacyStyle) return WINE_TYPE_LABELS.wine;

  return value;
}

export function getWineStyleLabel(
  value: string | undefined,
  lang?: Lang,
  fallbackValue?: string,
): string | null {
  const legacyStyle =
    normalizeWineStyle(value) || normalizeWineStyle(fallbackValue);
  if (!legacyStyle) return null;

  if (lang) return LEGACY_WINE_STYLE_LABELS[lang][legacyStyle];
  return LEGACY_WINE_STYLE_LABELS.en[legacyStyle];
}

export function getWineColorLabel(value: string, lang?: Lang): string {
  const normalized = normalizeDrinkColor(value);
  if (normalized && lang) return t(lang, `wine.color.${normalized}`);
  if (normalized) return WINE_COLOR_LABELS[normalized];
  return value;
}

export function isWineDrinkType(value?: string): boolean {
  const normalized = normalizeWineType(value);
  return !value || normalized === "wine" || !!normalizeWineStyle(value);
}

export function isBeerDrinkType(value?: string): boolean {
  return normalizeWineType(value) === "beer";
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
