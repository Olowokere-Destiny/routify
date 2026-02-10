"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
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

// Fix for default marker icon in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
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

export default function Map() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [points, setPoints] = useState<Point[]>([]);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [pastStack, setPastStack] = useState<Point[][]>([]);
  const [futureStack, setFutureStack] = useState<Point[][]>([]);
  const [lastSavedPointsJson, setLastSavedPointsJson] = useState<string>(() => "[]");
  const [areaName, setAreaName] = useState("");
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
            setLocationError("Location information unavailable. Using default location.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Using default location.");
            break;
          default:
            setLocationError("An unknown error occurred. Using default location.");
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
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
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
        setIsAddingPoint(false);
        setLocationError(null);
      },
      (error) => {
        setIsAddingPoint(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Cannot add point.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable. Cannot add point.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Cannot add point.");
            break;
          default:
            setLocationError("An unknown error occurred. Cannot add point.");
            break;
        }
      },
      options
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
  };

  const canUndo = pastStack.length > 0;
  const canRedo = futureStack.length > 0;
  const canClear = points.length > 0;
  const canSave = points.length > 0 && areaName.trim().length > 0 && hasUnsavedChanges;

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
      setLastSavedPointsJson(json);
      setIsSaveOpen(false);
    } catch (error) {
      console.error("Failed to save points to localStorage:", error);
    }
  };

  return (
    <div className="relative h-full w-full">
      {locationError && (
        <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[1000] bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded shadow-lg text-xs sm:text-sm max-w-[90%] sm:max-w-md text-center">
          {locationError}
        </div>
      )}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-[1000] flex flex-col sm:flex-row gap-2">
        <div className="flex gap-2">
          <Button
            onClick={handleUndo}
            disabled={!canUndo}
            className="text-sm sm:text-base py-1.5 px-3 sm:py-2 sm:px-4"
            title="Undo"
            variant="secondary"
          >
            Undo
          </Button>
          <Button
            onClick={handleRedo}
            disabled={!canRedo}
            className="text-sm sm:text-base py-1.5 px-3 sm:py-2 sm:px-4"
            title="Redo"
            variant="secondary"
          >
            Redo
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleClearAll}
            disabled={!canClear}
            className="text-sm sm:text-base py-1.5 px-3 sm:py-2 sm:px-4"
            title="Clear All Points"
            variant="destructive"
          >
            Clear
          </Button>
          {isMobile ? (
            <Drawer open={isSaveOpen} onOpenChange={setIsSaveOpen}>
              <DrawerTrigger asChild>
                <Button
                  disabled={points.length === 0}
                  className="text-sm sm:text-base py-1.5 px-3 sm:py-2 sm:px-4"
                  variant="outline"
                >
                  Save Area
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Save this mapped area</DrawerTitle>
                  <DrawerDescription>
                    Give this mapped area a name and save it to this browser.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-2 space-y-2">
                  <label className="flex flex-col gap-1 text-sm">
                    <span>Area name</span>
                    <Input
                      value={areaName}
                      onChange={(e) => setAreaName(e.target.value)}
                      placeholder="e.g. Morning run route"
                    />
                  </label>
                </div>
                <DrawerFooter>
                  <Button
                    variant="default"
                    disabled={!canSave}
                    onClick={handleSaveArea}
                  >
                    Save
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={points.length === 0}
                  className="text-sm sm:text-base py-1.5 px-3 sm:py-2 sm:px-4"
                  variant="outline"
                >
                  Save Area
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save this mapped area</DialogTitle>
                  <DialogDescription>
                    Give this mapped area a name and save it to this browser.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <label className="flex flex-col gap-1 text-sm">
                    <span>Area name</span>
                    <Input
                      value={areaName}
                      onChange={(e) => setAreaName(e.target.value)}
                      placeholder="e.g. Morning run route"
                    />
                  </label>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsSaveOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    disabled={!canSave}
                    onClick={handleSaveArea}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Button
            onClick={handleAddPoint}
            disabled={isAddingPoint}
            className="text-sm sm:text-base py-1.5 px-3 sm:py-2 sm:px-4"
          >
            {isAddingPoint ? "Getting location..." : "Add Point"}
          </Button>
        </div>
      </div>
      {points.length > 0 && (
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-[1000] bg-white border border-gray-300 rounded-lg shadow-lg p-2 sm:p-3 max-w-[calc(100%-1rem)] sm:max-w-xs">
          <div className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Points ({points.length})</div>
          <div className="text-[10px] sm:text-xs text-gray-600 space-y-0.5 sm:space-y-1 max-h-24 sm:max-h-32 overflow-y-auto">
            {points.map((point, index) => (
              <div key={point.id} className="break-words">
                Point {index + 1}: {point.coordinates[0].toFixed(6)}, {point.coordinates[1].toFixed(6)}
              </div>
            ))}
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
    </div>
  );
}

