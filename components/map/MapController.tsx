import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface MapControllerProps {
  center: [number, number];
}

export function MapController({ center }: MapControllerProps) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}