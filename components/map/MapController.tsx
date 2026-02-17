import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

interface MapControllerProps {
  center: [number, number];
}

export function MapController({ center }: MapControllerProps) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      // On first render, set view with zoom
      map.setView(center, map.getZoom(), { animate: false });
      isFirstRender.current = false;
    } else {
      // After that, only pan (preserves zoom on mobile)
      map.panTo(center, { animate: true });
    }
  }, [center, map]);

  return null;
}