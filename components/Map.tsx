"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

  // Default center (London) - used as fallback
  const defaultCenter: [number, number] = [51.505, -0.09];
  const center = userLocation || defaultCenter;

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

  return (
    <div className="relative h-full w-full">
      {locationError && (
        <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[1000] bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded shadow-lg text-xs sm:text-sm max-w-[90%] sm:max-w-md text-center">
          {locationError}
        </div>
      )}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-[1000] flex flex-col sm:flex-row gap-2">
        <div className="flex gap-2">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm sm:text-base font-semibold py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg shadow-lg transition-colors"
            title="Undo"
          >
            Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm sm:text-base font-semibold py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg shadow-lg transition-colors"
            title="Redo"
          >
            Redo
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClearAll}
            disabled={!canClear}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white text-sm sm:text-base font-semibold py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg shadow-lg transition-colors"
            title="Clear All Points"
          >
            Clear
          </button>
          <button
            onClick={handleAddPoint}
            disabled={isAddingPoint}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm sm:text-base font-semibold py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg shadow-lg transition-colors"
          >
            {isAddingPoint ? "Getting location..." : "Add Point"}
          </button>
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

