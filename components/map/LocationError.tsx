import { X } from "lucide-react";

interface LocationErrorProps {
  error: string;
  onDismiss: () => void;
}

export function LocationError({ error, onDismiss }: LocationErrorProps) {
  return (
    <div className="absolute top-20 sm:top-4 left-1/2 -translate-x-1/2 z-1000 max-w-md w-[calc(100%-2rem)]">
      <div className="bg-white rounded-lg shadow-lg px-4 py-3 flex items-start gap-3 border border-amber-200">
        <div className="flex-1 text-sm text-gray-800">{error}</div>
        <button
          onClick={onDismiss}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}