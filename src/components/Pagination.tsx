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
      {/* Previous Button with liquid glass */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-5 py-2.5 rounded-2xl liquid-glass text-rose-700 dark:text-rose-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Попередня
      </button>

      {/* Page Numbers with liquid glass */}
      <div className="flex items-center gap-1.5">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={typeof page !== "number"}
            className={`min-w-[40px] h-10 rounded-xl font-medium transition-all liquid-glass ${
              page === currentPage
                ? "bg-rose-500/20 text-rose-700 dark:text-rose-400"
                : typeof page === "number"
                  ? "text-rose-700 dark:text-rose-400 hover:bg-rose-100/50 dark:hover:bg-rose-900/30"
                  : "bg-transparent text-gray-400 cursor-default"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button with liquid glass */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-5 py-2.5 rounded-2xl liquid-glass text-rose-700 dark:text-rose-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
      >
        Наступна
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
