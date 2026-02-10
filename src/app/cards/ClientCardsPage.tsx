"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import CardsContent from "@/components/CardsContent";
import { FilterParams } from "@/types";

interface ClientCardsPageProps {
  initialFilters?: FilterParams;
  initialPage?: number;
}

function CardsPageContent({
  initialFilters,
  initialPage,
}: ClientCardsPageProps) {
  const searchParams = useSearchParams();

  const filters: FilterParams = initialFilters || {
    type: searchParams.get("type") || undefined,
    color: searchParams.get("color") || undefined,
    frizzante: searchParams.get("frizzante") === "true" ? true : undefined,
    minRating: searchParams.get("minRating")
      ? parseFloat(searchParams.get("minRating")!)
      : undefined,
    search: searchParams.get("search") || undefined,
    sort: searchParams.get("sortField")
      ? {
          field: searchParams.get("sortField") as "name" | "price" | "rating",
          direction:
            (searchParams.get("sortDirection") as "asc" | "desc") || "asc",
        }
      : undefined,
  };

  const page =
    initialPage ||
    (searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1);

  return <CardsContent initialFilters={filters} initialPage={page} />;
}

export default function ClientCardsPage(props: ClientCardsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50">
          <div className="flex items-center justify-center h-screen">
            <div className="text-rose-600 text-lg">Завантаження...</div>
          </div>
        </div>
      }
    >
      <CardsPageContent {...props} />
    </Suspense>
  );
}
