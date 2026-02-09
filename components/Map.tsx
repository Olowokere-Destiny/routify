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
        setPoints((prev) => [...prev, newPoint]);
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

  return (
    <div className="relative h-full w-full">
      {locationError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded shadow-lg text-sm max-w-md text-center">
          {locationError}
        </div>
      )}
      <button
        onClick={handleAddPoint}
        disabled={isAddingPoint}
        className="absolute top-4 right-4 z-[1000] bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors"
      >
        {isAddingPoint ? "Getting location..." : "Add Point"}
      </button>
      {points.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-w-xs">
          <div className="text-sm font-semibold mb-2">Points ({points.length})</div>
          <div className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
            {points.map((point, index) => (
              <div key={point.id}>
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

