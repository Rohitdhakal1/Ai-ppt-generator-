import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import EditOutlineDialog from "../../../components/shared/EditOutlineDialog";

export type Outline = {
  slideNo: number;
  outline: string; // Informative & Descriptive Slide Heading (1-sentence summary)
  content: string[]; // Detailed bullet points for the slide
  type: 'intro' | 'content' | 'image_right' | 'image_left' | 'conclusion' | 'timeline' | 'pros_cons' | 'columns' | 'table';
  imagePrompt: string; // Specific AI image generation prompt for this slide
};

type Props = {
  loading: boolean;
  outline: Outline[]; // incoming prop (initial)
  onUpdate?: (updatedOutline: Outline[]) => void;
};

function OutlineSection({ loading, outline: incomingOutline, onUpdate }: Props) {
  // keep local editable state so edits show immediately
  const [outlines, setOutlines] = useState<Outline[]>(incomingOutline || []);

  useEffect(() => {
    setOutlines(incomingOutline || []);
  }, [incomingOutline]);

  function handleSave(updated: Outline) {
    const updatedOutlines = outlines.map((o) => (o.slideNo === updated.slideNo ? updated : o));
    setOutlines(updatedOutlines);
    if (onUpdate) onUpdate(updatedOutlines);
  }

  return (
    <div className="mt-3 mb-20 relative">
      <h2 className="font-bold text-xl mb-4">Slide Outline</h2>

      {/* Unified view for both loading (streaming) and finished states */}
      <div className="space-y-3 pb-6">
        {outlines.map((item, index) => (
          <div
            key={item.slideNo ?? index}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-1 duration-300"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-lg leading-tight text-slate-800">
                  <span className="text-blue-500 mr-2">{index + 1}.</span>
                  {item.outline || (loading && index === outlines.length - 1 ? "Typing..." : "Generating Heading...")}
                </h3>
              </div>

              <EditOutlineDialog initial={item} onSave={handleSave}>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </EditOutlineDialog>
            </div>

            {/* Slide Content (Bullet Points) */}
            {item.content && item.content.length > 0 ? (
              <ul className="list-disc pl-6 space-y-1 text-slate-600 font-medium text-sm">
                {item.content.map((bullet, i) => (
                  <li key={i} className="leading-relaxed">
                    {bullet}
                    {loading && index === outlines.length - 1 && i === item.content.length - 1 && (
                      <span className="inline-block w-1.5 h-4 ml-1 bg-blue-500 animate-pulse align-middle" />
                    )}
                  </li>
                ))}
              </ul>
            ) : loading && index === outlines.length - 1 ? (
              <div className="flex items-center gap-2 ml-6 text-blue-500 font-semibold animate-pulse">
                <span>AI is writing content...</span>
              </div>
            ) : null}
          </div>
        ))}

      </div>

      {/* ✅ Floating centered button at the bottom */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"></div>
    </div>
  );
}

export default OutlineSection;
