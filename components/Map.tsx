"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
//@ts-expect-error file is present
import "leaflet/dist/leaflet.css";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Undo2,
  Redo2,
  Trash2,
  Save,
  Plus,
  MapPin,
  X,
  Loader2,
} from "lucide-react";
import SavedRoutes from "./SavedRoutes";

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

// Component to update map center when location changes
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface Point {
  id: number;
  coordinates: [number, number];
  timestamp: number;
}

interface SavedRoute {
  name: string;
  points: Point[];
  savedAt: number;
}

export default function Map() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [points, setPoints] = useState<Point[]>([]);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [pastStack, setPastStack] = useState<Point[][]>([]);
  const [futureStack, setFutureStack] = useState<Point[][]>([]);
  const [lastSavedPointsJson, setLastSavedPointsJson] = useState<string>(
    () => "[]"
  );
  const [areaName, setAreaName] = useState("");
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loadedRouteName, setLoadedRouteName] = useState<string | null>(null);
  const [saveRefreshTrigger, setSaveRefreshTrigger] = useState(0);

  // Default center (London) - used as fallback
  const defaultCenter: [number, number] = [51.505, -0.09];
  const center = userLocation || defaultCenter;

  const currentSnapshotJson = useMemo(
    () => JSON.stringify({ points, areaName }),
    [points, areaName]
  );
  const hasUnsavedChanges = currentSnapshotJson !== lastSavedPointsJson;

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setLocationError(null);
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Using default location.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError(
              "Location information unavailable. Using default location."
            );
            break;
          case error.TIMEOUT:
            setLocationError(
              "Location request timed out. Using default location."
            );
            break;
          default:
            setLocationError(
              "An unknown error occurred. Using default location."
            );
            break;
        }
      },
      options
    );
  }, []);

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

  const handleAddPoint = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsAddingPoint(true);
    
    // Use watchPosition briefly to force a fresh location update
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        // Clear the watch immediately after getting position
        navigator.geolocation.clearWatch(watchId);
        
        const { latitude, longitude } = position.coords;
        const newPoint: Point = {
          id: Date.now(),
          coordinates: [latitude, longitude],
          timestamp: Date.now(),
        };
        setPoints((prev) => {
          const updated = [...prev, newPoint];
          // Save current state to past stack and clear future stack
          setPastStack((past) => [...past, prev]);
          setFutureStack([]);
          return updated;
        });
        setUserLocation([latitude, longitude]);
        setIsAddingPoint(false);
        setLocationError(null);
      },
      (error) => {
        navigator.geolocation.clearWatch(watchId);
        setIsAddingPoint(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Cannot add point.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError(
              "Location information unavailable. Cannot add point."
            );
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Cannot add point.");
            break;
          default:
            setLocationError("An unknown error occurred. Cannot add point.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleUndo = () => {
    if (pastStack.length === 0) return;

    const previousState = pastStack[pastStack.length - 1];
    setPastStack((past) => past.slice(0, -1));
    setFutureStack((future) => [points, ...future]);
    setPoints(previousState);
  };

  const handleRedo = () => {
    if (futureStack.length === 0) return;

    const nextState = futureStack[0];
    setPastStack((past) => [...past, points]);
    setFutureStack((future) => future.slice(1));
    setPoints(nextState);
  };

  const handleClearAll = () => {
    setPoints([]);
    setPastStack([]);
    setFutureStack([]);
    setLoadedRouteName(null);
  };

  const canUndo = pastStack.length > 0;
  const canRedo = futureStack.length > 0;
  const canClear = points.length > 0;
  const canSave =
    points.length > 0 && areaName.trim().length > 0 && hasUnsavedChanges;

  const handleSaveArea = () => {
    if (typeof window === "undefined") return;
    try {
      const snapshot = {
        name: areaName.trim(),
        points,
        savedAt: Date.now(),
      };
      const json = JSON.stringify(snapshot);
      localStorage.setItem("geomap-saved-area", json);
      setLastSavedPointsJson(JSON.stringify({ points, areaName: areaName.trim() }));
      setSaveRefreshTrigger(prev => prev + 1);
      setIsSaveOpen(false);
    } catch (error) {
      console.error("Failed to save points to localStorage:", error);
    }
  };

  const handleLoadRoute = (route: SavedRoute) => {
    // Clear existing data
    setPoints([]);
    setPastStack([]);
    setFutureStack([]);

    // Load the route
    setPoints(route.points);
    setAreaName(route.name);
    setLoadedRouteName(route.name);
    setLastSavedPointsJson(
      JSON.stringify({ points: route.points, areaName: route.name })
    );

    // Center map on first point if available
    if (route.points.length > 0) {
      setUserLocation(route.points[0].coordinates);
    }
  };

  return (
    <div className="relative h-full w-full">
      {locationError && (
        <div className="absolute top-20 sm:top-4 left-1/2 -translate-x-1/2 z-1000 max-w-md w-[calc(100%-2rem)]">
          <div className="bg-white rounded-lg shadow-lg px-4 py-3 flex items-start gap-3 border border-amber-200">
            <div className="flex-1 text-xs sm:text-sm text-gray-800">{locationError}</div>
            <button
              onClick={() => setLocationError(null)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating control panel - ICON ONLY */}
      <div className="absolute bottom-4 sm:top-4 sm:bottom-auto top-auto right-4 z-1000">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1.5 flex gap-1.5 relative">
          <Button
            onClick={handleUndo}
            disabled={!canUndo}
            size="icon"
            variant="ghost"
            className="h-9 w-9 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleRedo}
            disabled={!canRedo}
            size="icon"
            variant="ghost"
            className="h-9 w-9 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          <div className="w-px bg-gray-200" />

          <Button
            onClick={handleClearAll}
            disabled={!canClear}
            size="icon"
            variant="ghost"
            className="h-9 w-9 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Clear all"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          {isMobile ? (
            <Drawer open={isSaveOpen} onOpenChange={setIsSaveOpen}>
              <DrawerTrigger asChild>
                <Button
                  disabled={points.length === 0}
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed relative"
                  title="Save area"
                >
                  <Save className="h-4 w-4" />
                  {hasUnsavedChanges && points.length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full" />
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="bg-white">
                <div className="mx-auto w-full max-w-md px-4 pb-8">
                  <DrawerHeader className="text-left px-0 pb-6">
                    <div className="mx-auto w-12 h-1 bg-gray-300 rounded-full mb-8" />
                    <DrawerTitle className="text-xl font-semibold text-gray-900">
                      Save Mapped Area
                    </DrawerTitle>
                    <DrawerDescription className="text-gray-600 mt-1">
                      Name your route to save it locally.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="area-name-mobile"
                        className="text-sm font-medium text-gray-700"
                      >
                        Area Name
                      </Label>
                      <Input
                        id="area-name-mobile"
                        value={areaName}
                        onChange={(e) => setAreaName(e.target.value)}
                        placeholder="e.g. Morning run route"
                        className="h-11"
                      />
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">{points.length}</span>{" "}
                        {points.length === 1 ? "point" : "points"} added
                      </div>
                    </div>
                  </div>
                  <DrawerFooter className="px-0 pt-4 gap-3">
                    <Button
                      disabled={!canSave}
                      onClick={handleSaveArea}
                      className="h-11 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Area
                    </Button>
                    <DrawerClose asChild>
                      <Button variant="outline" className="h-11">
                        Cancel
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={points.length === 0}
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 hover:bg-green-50 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed relative"
                  title="Save area"
                >
                  <Save className="h-4 w-4" />
                  {hasUnsavedChanges && points.length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full" />
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Save Mapped Area
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Name your route to save it locally.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="area-name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Area Name
                    </Label>
                    <Input
                      id="area-name"
                      value={areaName}
                      onChange={(e) => setAreaName(e.target.value)}
                      placeholder="e.g. Morning run route"
                      className="h-10"
                    />
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">{points.length}</span>{" "}
                      {points.length === 1 ? "point" : "points"} added
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsSaveOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={!canSave}
                    onClick={handleSaveArea}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <div className="w-px bg-gray-200" />

          <SavedRoutes onLoadRoute={handleLoadRoute} refreshTrigger={saveRefreshTrigger} />

          <div className="w-px bg-gray-200" />

          <Button
            onClick={handleAddPoint}
            disabled={isAddingPoint}
            size="icon"
            variant="ghost"
            className="h-9 w-auto hover:bg-blue-50 hover:text-blue-600 cursor-pointer px-1 flex items-center gap-x-1"
            title="Add point"
          >
            {isAddingPoint ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Add point</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Loaded route indicator */}
      {loadedRouteName && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000">
          <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg">
            <MapPin className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              {loadedRouteName}
            </span>
          </div>
        </div>
      )}

      {/* Points list panel */}
      {points.length > 0 && (
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
      )}

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