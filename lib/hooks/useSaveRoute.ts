import { useCallback, useMemo } from "react";
import { useMapStore } from "../store/mapStore";

export function useSaveRoute(setSaveRefreshTrigger: (fn: (prev: number) => number) => void) {
  const { points, areaName, setLastSavedPointsJson } = useMapStore();

  const currentSnapshotJson = useMemo(
    () => JSON.stringify({ points, areaName }),
    [points, areaName]
  );

  const lastSavedPointsJson = useMapStore((state) => state.lastSavedPointsJson);
  const hasUnsavedChanges = currentSnapshotJson !== lastSavedPointsJson;

  const handleSaveArea = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const snapshot = {
        name: areaName.trim(),
        points,
        savedAt: Date.now(),
      };
      const json = JSON.stringify(snapshot);
      localStorage.setItem("geomap-saved-area", json);
      setLastSavedPointsJson(
        JSON.stringify({ points, areaName: areaName.trim() })
      );
      setSaveRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to save points to localStorage:", error);
    }
  }, [points, areaName, setLastSavedPointsJson, setSaveRefreshTrigger]);

  const canSave =
    points.length > 0 && areaName.trim().length > 0 && hasUnsavedChanges;

  return { handleSaveArea, canSave, hasUnsavedChanges };
}