"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
//@ts-expect-error file is present
import "leaflet/dist/leaflet.css";
import { useMapStore } from "../../lib/store/mapStore";
import { SavedRoute } from "../../lib/types/map";
import { useGeolocation } from "../../lib/hooks/useGeolocation";
import { useAddPoint } from "../../lib/hooks/useAddPoint";
import { useSaveRoute } from "../../lib/hooks/useSaveRoute";
import { MapController } from "./MapController";
import { LocationError } from "./LocationError";
import { PointsList } from "./PointsList";
import { RouteIndicator } from "./RouteIndicator";
import { SaveDialog } from "./SaveDialog";
import { Toolbar } from "./ToolBar";

// Fix for default marker icon in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function Map() {
  const {
    userLocation,
    locationError,
    points,
    isAddingPoint,
    areaName,
    loadedRouteName,
    setLocationError,
    setAreaName,
    undo,
    redo,
    clearAll,
    loadRoute,
  } = useMapStore();

  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [saveRefreshTrigger, setSaveRefreshTrigger] = useState(0);

  // Custom hooks
  useGeolocation();
  const handleAddPoint = useAddPoint();
  const { handleSaveArea, canSave, hasUnsavedChanges } = useSaveRoute(
    setSaveRefreshTrigger,
  );

  // Default center (London) - used as fallback
  const defaultCenter: [number, number] = [51.505, -0.09];
  const center = userLocation || defaultCenter;

  const pastStack = useMapStore((state) => state.pastStack);
  const futureStack = useMapStore((state) => state.futureStack);

  const canUndo = pastStack.length > 0;
  const canRedo = futureStack.length > 0;
  const canClear = points.length > 0;

  // Determine if we're on mobile (for drawer vs dialog)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Warn user if they try to close/reload with unsaved changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleLoadRoute = (route: SavedRoute) => {
    loadRoute(route);
    // Center map on first point if available
    if (route.points.length > 0) {
      const { setUserLocation } = useMapStore.getState();
      setUserLocation(route.points[0].coordinates);
    }
  };

  const handleSave = () => {
    handleSaveArea();
    setIsSaveOpen(false);
  };

  return (
    <div className="relative h-full w-full">
      {locationError && (
        <LocationError
          error={locationError}
          onDismiss={() => setLocationError(null)}
        />
      )}

      <Toolbar
        canUndo={canUndo}
        canRedo={canRedo}
        canClear={canClear}
        canSave={canSave}
        hasUnsavedChanges={hasUnsavedChanges}
        isAddingPoint={isAddingPoint}
        points={points}
        isMobile={isMobile}
        onUndo={undo}
        onRedo={redo}
        onClearAll={clearAll}
        onAddPoint={handleAddPoint}
        onLoadRoute={handleLoadRoute}
        saveRefreshTrigger={saveRefreshTrigger}
        onSaveDialogOpen={() => setIsSaveOpen(true)}
      />

      <SaveDialog
        isOpen={isSaveOpen}
        onOpenChange={setIsSaveOpen}
        isMobile={isMobile}
        areaName={areaName}
        onAreaNameChange={setAreaName}
        pointsCount={points.length}
        canSave={canSave}
        onSave={handleSave}
      />

      {loadedRouteName && <RouteIndicator routeName={loadedRouteName} />}

      <PointsList points={points} hasUnsavedChanges={hasUnsavedChanges} />

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        key={userLocation ? `${userLocation[0]}-${userLocation[1]}` : "default"}
      >
        <MapController center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <Marker position={userLocation} icon={icon}>
            <Popup>Your current location</Popup>
          </Marker>
        )}
        {points.map((point, index) => (
          <Marker key={point.id} position={point.coordinates} icon={icon}>
            <Popup>Point {index + 1}</Popup>
          </Marker>
        ))}
        {points.length > 1 && (
          <Polyline
            positions={points.map((point) => point.coordinates)}
            pathOptions={{
              color: "#3b82f6",
              weight: 4,
              opacity: 0.7,
            }}
          />
        )}
      </MapContainer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
