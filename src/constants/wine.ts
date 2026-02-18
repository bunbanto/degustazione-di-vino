export const WINE_TYPES = ["secco", "abboccato", "amabile", "dolce"] as const;
export const WINE_COLORS = ["bianco", "rosso", "rosato"] as const;

type WineTypeValue = (typeof WINE_TYPES)[number];
type WineColorValue = (typeof WINE_COLORS)[number];

const WINE_TYPE_LABELS: Record<WineTypeValue, string> = {
  secco: "Secco",
  abboccato: "Abboccato",
  amabile: "Amabile",
  dolce: "Dolce",
};

const WINE_COLOR_LABELS: Record<WineColorValue, string> = {
  bianco: "Bianco",
  rosso: "Rosso",
  rosato: "Rosato",
};

export function getWineTypeLabel(value: string): string {
  return WINE_TYPE_LABELS[value as WineTypeValue] || value;
}

export function getWineColorLabel(value: string): string {
  return WINE_COLOR_LABELS[value as WineColorValue] || value;
}

