import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import type { Outline } from "../../features/projects/components/OutlineSection";

type Props = {
  children: React.ReactNode;
  initial: Outline;
  onSave: (updated: Outline) => void;
};

function EditOutlineDialog({ children, initial, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [outlineText, setOutlineText] = useState(initial.outline || "");
  const [contentText, setContentText] = useState(initial.content?.join("\n") || "");

  // when dialog opens for a new initial prop, sync values
  useEffect(() => {
    setOutlineText(initial.outline || "");
    setContentText(initial.content?.join("\n") || "");
  }, [initial]);

  function handleSave() {
    const updated: Outline = {
      ...initial,
      outline: outlineText.trim(),
      content: contentText.split("\n").map(line => line.trim()).filter(line => line !== ""),
    };
    onSave(updated);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Slide Content</DialogTitle>
          <DialogDescription>
            Update the slide title and bullet points. Each line in the content field will become a new bullet point.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Slide Heading</label>
            <textarea
              value={outlineText}
              onChange={(e) => setOutlineText(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter slide heading..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Bullet Points (One per line)</label>
            <textarea
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter each bullet point on a new line..."
              rows={8}
            />
          </div>
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
