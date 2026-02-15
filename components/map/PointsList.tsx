import { MapPin } from "lucide-react";
import { Point } from "../../lib/types/map";

interface PointsListProps {
  points: Point[];
  hasUnsavedChanges: boolean;
}

export function PointsList({ points, hasUnsavedChanges }: PointsListProps) {
  if (points.length === 0) return null;

  return (
    <div className="absolute top-20 sm:bottom-4 sm:top-auto bottom-auto left-4 z-1000 max-w-[calc(100%-2rem)] sm:max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              Points ({points.length})
            </span>
          </div>
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-600 flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-amber-500 rounded-full" />
              Unsaved
            </span>
          )}
        </div>
        <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
          {points.map((point, index) => (
            <div
              key={point.id}
              className="text-xs bg-gray-50 rounded px-2.5 py-2 font-mono text-gray-700 border border-gray-100"
            >
              <span className="font-semibold text-gray-900">
                #{index + 1}
              </span>{" "}
              {point.coordinates[0].toFixed(6)},{" "}
              {point.coordinates[1].toFixed(6)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}