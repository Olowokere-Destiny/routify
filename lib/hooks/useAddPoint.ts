import { useCallback } from "react";
import { useMapStore } from "../../lib/store/mapStore";
import { Point } from "../../lib/types/map";

export function useAddPoint() {
  const { addPoint, setUserLocation, setLocationError, setIsAddingPoint } = useMapStore();

  const handleAddPoint = useCallback(() => {
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
        
        addPoint(newPoint);
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
  }, [addPoint, setUserLocation, setLocationError, setIsAddingPoint]);

  return handleAddPoint;
}