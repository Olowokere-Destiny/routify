import { Button } from "../../components/ui/button";
import {
  Undo2,
  Redo2,
  Trash2,
  Save,
  Plus,
  Loader2,
} from "lucide-react";
import SavedRoutes from "./SavedRoutes";
import AuthDialog from "./AuthDialog";
import { SavedRoute, Point } from "../../lib/types/map";

interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  canClear: boolean;
  canSave: boolean;
  hasUnsavedChanges: boolean;
  isAddingPoint: boolean;
  points: Point[]; // Change from pointsCount to points array
  isMobile: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearAll: () => void;
  onAddPoint: () => void;
  onLoadRoute: (route: SavedRoute) => void;
  saveRefreshTrigger: number;
  onSaveDialogOpen: () => void;
}

export function ToolBar({
  canUndo,
  canRedo,
  canClear,
  canSave,
  hasUnsavedChanges,
  isAddingPoint,
  points,
  isMobile,
  onUndo,
  onRedo,
  onClearAll,
  onAddPoint,
  onLoadRoute,
  saveRefreshTrigger,
  onSaveDialogOpen,
}: ToolbarProps) {
  return (
    <div className="absolute bottom-4 sm:top-4 sm:bottom-auto top-auto left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-1000">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1.5 flex gap-1.5 relative max-w-[calc(100vw-2rem)]">
        <Button
          onClick={onUndo}
          disabled={!canUndo}
          size="icon"
          variant="ghost"
          className="h-9 w-9 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          onClick={onRedo}
          disabled={!canRedo}
          size="icon"
          variant="ghost"
          className="h-9 w-9 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        <div className="w-px bg-gray-200 shrink-0" />

        <Button
          onClick={onClearAll}
          disabled={!canClear}
          size="icon"
          variant="ghost"
          className="h-9 w-9 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          title="Clear all"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <Button
          disabled={points.length === 0}
          size="icon"
          variant="ghost"
          onClick={onSaveDialogOpen}
          className={`h-9 w-9 ${
            isMobile ? "hover:bg-blue-50 hover:text-blue-600" : "hover:bg-green-50 hover:text-green-600"
          } disabled:opacity-40 disabled:cursor-not-allowed relative shrink-0`}
          title="Save area"
        >
          <Save className="h-4 w-4" />
          {hasUnsavedChanges && points.length > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full" />
          )}
        </Button>

        <div className="w-px bg-gray-200 shrink-0" />

        <SavedRoutes
          onLoadRoute={onLoadRoute}
          refreshTrigger={saveRefreshTrigger}
        />

        <div className="w-px bg-gray-200 shrink-0" />

        <AuthDialog points={points} />

        <div className="w-px bg-gray-200 shrink-0" />

        <Button
          onClick={onAddPoint}
          disabled={isAddingPoint}
          size="icon"
          variant="ghost"
          className="h-9 w-auto px-2 hover:bg-blue-50 hover:text-blue-600 shrink-0"
          title="Add point"
        >
          {isAddingPoint ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Add point</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}