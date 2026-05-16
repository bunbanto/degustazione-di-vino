import { SortField } from "@/types";
import { t, type Lang } from "@/i18n/i18n";

export const SORT_FIELDS: { value: SortField; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "rating", label: "Rating" },
];

export function getSortFieldLabel(value: SortField, lang: Lang): string {
  return t(lang, `sort.${value}`);
}
