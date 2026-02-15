import { useEffect } from "react";
import { useMapStore } from "../../lib/store/mapStore";

export function useGeolocation() {
  const { setUserLocation, setLocationError, setIsLoading } = useMapStore();

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
  }, [setUserLocation, setLocationError, setIsLoading]);
}