"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const getPageNumbers = () => {
    const visiblePages = 5;
    const halfVisible = Math.floor(visiblePages / 2);

    if (totalPages <= visiblePages) {
      return pages;
    }

    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, start + visiblePages - 1);

    if (end - start < visiblePages - 1) {
      start = Math.max(1, end - visiblePages + 1);
    }

    const result: (number | string)[] = [];

    if (start > 1) {
      result.push(1);
      if (start > 2) result.push("...");
    }

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) result.push("...");
      result.push(totalPages);
    }

    return result;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg bg-white/80 text-rose-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-100 transition-colors shadow-md"
      >
        Попередня
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={typeof page !== "number"}
            className={`min-w-[40px] h-10 rounded-lg font-medium transition-all shadow-md ${
              page === currentPage
                ? "bg-gradient-to-r from-rose-600 to-rose-500 text-white"
                : typeof page === "number"
                  ? "bg-white/80 text-rose-700 hover:bg-rose-100"
                  : "bg-transparent text-gray-400 cursor-default"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg bg-white/80 text-rose-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-100 transition-colors shadow-md"
      >
        Наступна
      </button>
    </div>
  );
}
