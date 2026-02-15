"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
    MapPin,
    Clock,
    Trash2,
    Eye,
    Folder,
    FolderOpen
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";

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

interface SavedRoutesProps {
  onLoadRoute: (route: SavedRoute) => void;
  refreshTrigger?: number;
}

export default function SavedRoutes({ onLoadRoute, refreshTrigger }: SavedRoutesProps) {
  const [savedRoute, setSavedRoute] = useState<SavedRoute | null>(() => {
    // Initialize state directly from localStorage
    try {
      const saved = localStorage.getItem("geomap-saved-area");
      if (saved) {
        return JSON.parse(saved) as SavedRoute;
      }
    } catch (error) {
      console.error("Failed to load saved route:", error);
    }
    return null;
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // Refresh saved route when refreshTrigger changes
    if (refreshTrigger === 0) return; // Skip initial render
    
    try {
      const saved = localStorage.getItem("geomap-saved-area");
      if (saved) {
        setSavedRoute(JSON.parse(saved) as SavedRoute);
      }
    } catch (error) {
      console.error("Failed to load saved route:", error);
    }
  }, [refreshTrigger]);

  const handleViewRoute = () => {
    if (savedRoute) {
      onLoadRoute(savedRoute);
      setIsOpen(false);
    }
  };

  const handleDeleteRoute = () => {
    try {
      localStorage.removeItem("geomap-saved-area");
      setSavedRoute(null);
      setDeleteDialogOpen(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to delete route:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        variant="ghost"
        className="h-9 w-9 hover:bg-purple-50 hover:text-purple-600 relative"
        title="Saved routes"
      >
        {isOpen ? (
          <FolderOpen className="h-4 w-4" />
        ) : (
          <Folder className="h-4 w-4" />
        )}
        {savedRoute && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-purple-500 rounded-full border-2 border-white" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute bottom-14 sm:top-14 sm:bottom-auto right-0 w-[calc(100vw-2rem)] sm:w-80 max-w-md bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="bg-linear-to-r from-purple-50 to-blue-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Folder className="h-4 w-4 text-purple-600" />
              Saved Routes
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              {savedRoute ? "1 route saved" : "No routes saved yet"}
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {savedRoute ? (
              <div className="p-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {savedRoute.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {savedRoute.points.length} points
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(savedRoute.savedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={handleViewRoute}
                      size="sm"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1.5" />
                      Load Route
                    </Button>
                    <Button
                      onClick={() => setDeleteDialogOpen(true)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                  <Folder className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-1">No saved routes</p>
                <p className="text-xs text-gray-500">
                  Create and save a route to see it here
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Delete Route?
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete &quot;{savedRoute?.name}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteRoute}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes slide-in-from-top-2 {
          from {
            transform: translateY(-8px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .slide-in-from-top-2 {
          animation-name: slide-in-from-top-2;
        }
        .duration-200 {
          animation-duration: 200ms;
        }
      `}</style>
    </>
  );
}