"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  MapPin,
  Clock,
  Trash2,
  Eye,
  Folder,
  FolderOpen,
  Cloud,
  HardDrive,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { SavedRoute, Point } from "../../lib/types/map";

interface SavedRoutesProps {
  onLoadRoute: (route: SavedRoute) => void;
  refreshTrigger?: number;
}

export default function SavedRoutes({
  onLoadRoute,
  refreshTrigger,
}: SavedRoutesProps) {
  const [localRoute, setLocalRoute] = useState<SavedRoute | null>(null);
  const [cloudRoutes, setCloudRoutes] = useState<SavedRoute[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<SavedRoute | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Only load on mount and when refreshTrigger changes (NOT when dialog opens)
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Load local route
    loadLocalRoute();

    // Load cloud routes if logged in
    if (token) {
      loadCloudRoutes();
    }
  }, [refreshTrigger]);

  const loadLocalRoute = () => {
    try {
      const saved = localStorage.getItem("geomap-saved-area");
      if (saved) {
        setLocalRoute(JSON.parse(saved) as SavedRoute);
      } else {
        setLocalRoute(null);
      }
    } catch (error) {
      console.error("Failed to load saved route:", error);
      setLocalRoute(null);
    }
  };

  const loadCloudRoutes = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/routes/my-routes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setCloudRoutes(data.routes || []);
      } else {
        if (response.status === 401) {
          // Token expired
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsLoggedIn(false);
          setCloudRoutes([]);
        } else {
          setError("Failed to load cloud routes");
        }
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadLocalRoute();
    if (isLoggedIn) {
      loadCloudRoutes();
    }
  };

  const handleViewRoute = (route: SavedRoute) => {
    onLoadRoute(route);
    setIsOpen(false);
  };

  const handleDeleteLocal = () => {
    try {
      localStorage.removeItem("geomap-saved-area");
      setLocalRoute(null);
      setDeleteDialogOpen(false);
      setRouteToDelete(null);
    } catch (error) {
      console.error("Failed to delete route:", error);
    }
  };

  const handleDeleteCloud = async (routeId: string) => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const response = await fetch(`/api/routes/delete/${routeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCloudRoutes(cloudRoutes.filter((r) => r.id !== routeId));
        setDeleteDialogOpen(false);
        setRouteToDelete(null);
      } else {
        setError("Failed to delete route");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (route: SavedRoute) => {
    setRouteToDelete(route);
    setDeleteDialogOpen(true);
  };

  const formatDate = (timestamp?: number | string) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalRoutes = (localRoute ? 1 : 0) + cloudRoutes.length;

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
        {totalRoutes > 0 && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-purple-500 rounded-full border-2 border-white" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute bottom-14 sm:top-14 -translate-x-1/2 left-1/2 sm:left-auto sm:translate-x-0 sm:bottom-auto right-0 w-[calc(100vw-2rem)] sm:w-80 max-w-md bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="bg-linear-to-r from-purple-50 to-blue-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Folder className="h-4 w-4 text-purple-600" />
                  Saved Routes
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {totalRoutes > 0
                    ? `${totalRoutes} route${totalRoutes === 1 ? "" : "s"} saved`
                    : "No routes saved yet"}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleRefresh}
                disabled={loading}
                className="h-8 w-8 hover:bg-purple-100"
                title="Refresh routes"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {error && (
            <div className="px-3 pt-3">
              <div className=" mt-2 py-2 px-2 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-start justify-between gap-2">
                <span className="flex-1">{error}</span>
                <button
                  onClick={() => setError("")}
                  className="shrink-0 hover:bg-red-100 rounded p-0.5 transition-colors"
                  aria-label="Dismiss error"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {loading && cloudRoutes.length === 0 ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading routes...</p>
              </div>
            ) : totalRoutes > 0 ? (
              <div className="p-3 space-y-2">
                {/* Cloud Routes */}
                {cloudRoutes.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 px-2 py-1">
                      <Cloud className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-semibold text-gray-700">
                        Cloud Storage
                      </span>
                    </div>
                    {cloudRoutes.map((route) => (
                      <div
                        key={route.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {route.name}
                            </h4>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {route.points.length} points
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(route.savedAt || route.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => handleViewRoute(route)}
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1.5" />
                            Load Route
                          </Button>
                          <Button
                            onClick={() => openDeleteDialog(route)}
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Local Route */}
                {localRoute && (
                  <>
                    <div className="flex items-center gap-2 px-2 py-1 mt-3">
                      <HardDrive className="h-3 w-3 text-gray-600" />
                      <span className="text-xs font-semibold text-gray-700">
                        Local Storage
                      </span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {localRoute.name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {localRoute.points.length} points
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(localRoute.savedAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          onClick={() => handleViewRoute(localRoute)}
                          size="sm"
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1.5" />
                          Load Route
                        </Button>
                        <Button
                          onClick={() => openDeleteDialog(localRoute)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                  <Folder className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-1">No saved routes</p>
                <p className="text-xs text-gray-500">
                  {isLoggedIn
                    ? "Create and save a route to see it here"
                    : "Log in to save routes to the cloud"}
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
              Are you sure you want to delete &quot;{routeToDelete?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setRouteToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (routeToDelete?.id) {
                  handleDeleteCloud(routeToDelete.id);
                } else {
                  handleDeleteLocal();
                }
              }}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
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