export interface Point {
  id: number;
  coordinates: [number, number];
  timestamp: number;
}

export interface SavedRoute {
  name: string;
  points: Point[];
  savedAt?: number; // Optional for cloud routes
  id?: string; // Cloud routes have an id
  createdAt?: string | number; // Cloud routes have createdAt
  updatedAt?: string | number; // Cloud routes have updatedAt
}

export interface MapState {
  userLocation: [number, number] | null;
  locationError: string | null;
  isLoading: boolean;
  points: Point[];
  isAddingPoint: boolean;
  pastStack: Point[][];
  futureStack: Point[][];
  lastSavedPointsJson: string;
  areaName: string;
  loadedRouteName: string | null;
  
  // Actions
  setUserLocation: (location: [number, number] | null) => void;
  setLocationError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  addPoint: (point: Point) => void;
  setPoints: (points: Point[]) => void;
  setIsAddingPoint: (adding: boolean) => void;
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  setAreaName: (name: string) => void;
  setLastSavedPointsJson: (json: string) => void;
  setLoadedRouteName: (name: string | null) => void;
  loadRoute: (route: SavedRoute) => void;
}