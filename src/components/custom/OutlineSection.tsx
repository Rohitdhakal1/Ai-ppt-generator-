import React, { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { ArrowRight, Edit, Sparkles } from "lucide-react";
import EditOutlineDialog from "./EditOutlineDialog";

export type Outline = {
  slideNo: string;
  slidePoint: string;
  outline: string;
};

type Props = {
  loading: boolean;
  outline: Outline[]; // incoming prop (initial)
};

function OutlineSection({ loading, outline: incomingOutline }: Props) {
  // keep local editable state so edits show immediately
  const [outlines, setOutlines] = useState<Outline[]>(incomingOutline || []);

  useEffect(() => {
    setOutlines(incomingOutline || []);
  }, [incomingOutline]);

  function handleSave(updated: Outline) {
    setOutlines((prev) =>
      prev.map((o) => (o.slideNo === updated.slideNo ? updated : o))
    );

    // TODO: call API / propagate change to parent if necessary
    console.log("Saved outline:", updated);
  }

  return (
    <div className="mt-3 mb-20 relative">
      <h2 className="font-bold text-xl mb-4">Slide Outline</h2>

      {/* Show skeleton while loading */}
      {loading ? (
        <div>
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-[60px] w-full rounded-2xl mb-4" />
          ))}
        </div>
      ) : (
        <div className="space-y-4 pb-6">
          {outlines?.map((item, index) => (
            <div
              key={item.slideNo || index}
              className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-lg">
                  {index + 1}. {item.slidePoint || "Untitled Slide"}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {item.outline || "No description available."}
                </p>
              </div>

              <EditOutlineDialog initial={item} onSave={handleSave}>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </EditOutlineDialog>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Floating centered button at the bottom */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"></div>
    </div>
  );
}

export default OutlineSection;
