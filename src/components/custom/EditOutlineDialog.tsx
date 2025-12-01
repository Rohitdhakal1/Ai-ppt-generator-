import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

import type { Outline } from "./OutlineSection";

type Props = {
  children: React.ReactNode;
  initial: Outline;
  onSave: (updated: Outline) => void;
};

function EditOutlineDialog({ children, initial, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [slidePoint, setSlidePoint] = useState(initial.slidePoint || "");
  const [outlineText, setOutlineText] = useState(initial.outline || "");

  // when dialog opens for a new initial prop, sync values
  useEffect(() => {
    setSlidePoint(initial.slidePoint || "");
    setOutlineText(initial.outline || "");
  }, [initial]);

  function handleSave() {
    const updated: Outline = {
      ...initial,
      slidePoint: slidePoint.trim(),
      outline: outlineText.trim(),
    };
    onSave(updated);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Slide</DialogTitle>
          <DialogDescription>
            Update the slide title and outline below. Changes are saved locally.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <label className="block">
            <span className="text-sm font-medium">Slide Title</span>
            <input
              value={slidePoint}
              onChange={(e) => setSlidePoint(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2"
              placeholder="Enter slide title"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Outline / Notes</span>
            <textarea
              value={outlineText}
              onChange={(e) => setOutlineText(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2"
              placeholder="Write the slide outline or notes"
              rows={4}
            />
          </label>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditOutlineDialog;
