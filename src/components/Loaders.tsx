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
