import { Save, MapPin } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../../components/ui/drawer";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

interface SaveDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isMobile: boolean;
  areaName: string;
  onAreaNameChange: (name: string) => void;
  pointsCount: number;
  canSave: boolean;
  onSave: () => void;
}

export function SaveDialog({
  isOpen,
  onOpenChange,
  isMobile,
  areaName,
  onAreaNameChange,
  pointsCount,
  canSave,
  onSave,
}: SaveDialogProps) {
  const content = (
    <>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label
            htmlFor={isMobile ? "area-name-mobile" : "area-name"}
            className="text-sm font-medium text-gray-700"
          >
            Area Name
          </Label>
          <Input
            id={isMobile ? "area-name-mobile" : "area-name"}
            value={areaName}
            onChange={(e) => onAreaNameChange(e.target.value)}
            placeholder="e.g. Morning run route"
            className={isMobile ? "h-11" : "h-10"}
          />
        </div>
        <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
          <MapPin className="h-5 w-5 text-blue-600" />
          <div className="text-sm text-gray-700">
            <span className="font-semibold">{pointsCount}</span>{" "}
            {pointsCount === 1 ? "point" : "points"} added
          </div>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-white">
          <div className="mx-auto w-full max-w-md px-4 pb-8">
            <DrawerHeader className="text-left px-0 pb-6">
              <div className="mx-auto w-12 h-1 bg-gray-300 rounded-full mb-8" />
              <DrawerTitle className="text-xl font-semibold text-gray-900">
                Save Mapped Area
              </DrawerTitle>
              <DrawerDescription className="text-gray-600 mt-1">
                Name your route to save it locally.
              </DrawerDescription>
            </DrawerHeader>
            {content}
            <DrawerFooter className="px-0 pt-4 gap-3">
              <Button
                disabled={!canSave}
                onClick={onSave}
                className="h-11 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Area
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="h-11">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Save Mapped Area
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Name your route to save it locally.
          </DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSave}
            onClick={onSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}