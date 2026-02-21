import { SortField } from "@/types";

export const SORT_FIELDS: { value: SortField; label: string }[] = [
  { value: "name", label: "За назвою" },
  { value: "price", label: "За ціною" },
  { value: "rating", label: "За рейтингом" },
];
