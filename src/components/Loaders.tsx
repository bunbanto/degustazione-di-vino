interface SpinnerProps {
  sizeClassName?: string;
  className?: string;
}

export function Spinner({
  sizeClassName = "h-10 w-10",
  className = "border-rose-600",
}: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-t-2 border-b-2 ${sizeClassName} ${className}`}
    />
  );
}

export function CardsPageSuspenseLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50">
      <div className="flex items-center justify-center h-screen">
        <div className="text-rose-600 text-lg">Завантаження...</div>
      </div>
    </div>
  );
}

export function CardsContentLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="liquid-glass rounded-full p-6">
        <Spinner />
      </div>
    </div>
  );
}

export function RatingLoader() {
  return (
    <div className="flex items-center gap-2 ml-2">
      <Spinner
        sizeClassName="w-4 h-4"
        className="border-rose-500 border-t-transparent"
      />
    </div>
  );
}

export function RandomWineButtonLoader() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative flex h-4 w-4 items-center justify-center">
        <span className="absolute inline-flex h-full w-full rounded-full bg-rose-300/70 dark:bg-rose-700/50 animate-ping" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-br from-rose-600 to-amber-400 animate-spin" />
      </span>
      <span className="text-sm">Обираю...</span>
      <span className="flex items-end gap-1" aria-hidden="true">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-bounce" />
      </span>
    </span>
  );
}
