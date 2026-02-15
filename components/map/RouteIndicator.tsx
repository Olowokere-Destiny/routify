import { MapPin } from "lucide-react";

interface RouteIndicatorProps {
  routeName: string;
}

export function RouteIndicator({ routeName }: RouteIndicatorProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000">
      <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg">
        <MapPin className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-medium text-purple-900">
          {routeName}
        </span>
      </div>
    </div>
  );
}