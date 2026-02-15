import { create } from 'zustand';
import { MapState, Point, SavedRoute } from '../../lib/types/map';

export const useMapStore = create<MapState>((set, get) => ({
  userLocation: null,
  locationError: null,
  isLoading: true,
  points: [],
  isAddingPoint: false,
  pastStack: [],
  futureStack: [],
  lastSavedPointsJson: '[]',
  areaName: '',
  loadedRouteName: null,

  setUserLocation: (location) => set({ userLocation: location }),
  
  setLocationError: (error) => set({ locationError: error }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  addPoint: (point) => set((state) => {
    const newPoints = [...state.points, point];
    return {
      points: newPoints,
      pastStack: [...state.pastStack, state.points],
      futureStack: [],
    };
  }),
  
  setPoints: (points) => set({ points }),
  
  setIsAddingPoint: (adding) => set({ isAddingPoint: adding }),
  
  undo: () => set((state) => {
    if (state.pastStack.length === 0) return state;
    
    const previousState = state.pastStack[state.pastStack.length - 1];
    const newPastStack = state.pastStack.slice(0, -1);
    const newFutureStack = [state.points, ...state.futureStack];
    
    return {
      points: previousState,
      pastStack: newPastStack,
      futureStack: newFutureStack,
    };
  }),
  
  redo: () => set((state) => {
    if (state.futureStack.length === 0) return state;
    
    const nextState = state.futureStack[0];
    const newFutureStack = state.futureStack.slice(1);
    const newPastStack = [...state.pastStack, state.points];
    
    return {
      points: nextState,
      pastStack: newPastStack,
      futureStack: newFutureStack,
    };
  }),
  
  clearAll: () => set({
    points: [],
    pastStack: [],
    futureStack: [],
    loadedRouteName: null,
  }),
  
  setAreaName: (name) => set({ areaName: name }),
  
  setLastSavedPointsJson: (json) => set({ lastSavedPointsJson: json }),
  
  setLoadedRouteName: (name) => set({ loadedRouteName: name }),
  
  loadRoute: (route) => set({
    points: route.points,
    areaName: route.name,
    loadedRouteName: route.name,
    lastSavedPointsJson: JSON.stringify({ points: route.points, areaName: route.name }),
    pastStack: [],
    futureStack: [],
  }),
}));