import { useState } from "react";
import { Button } from "@/components/ui/button"; // Using shadcn Button
import { Loader2, Sparkles, X } from "lucide-react";

type Props = {
  position: { x: number; y: number } | null;
  onClose: () => void;
  loading: boolean;
  // CHANGE THIS LINE:
  handleAiChange: (value: string) => Promise<void>; // Was 'void'
};

function FloatingActionTool({
  position,
  onClose,
  loading,
  handleAiChange,
}: Props) {
  const [prompt, setPrompt] = useState("");

  if (!position) {
    return null; // Don't render if no element is selected
  }

 const handleSubmit = async () => { // <-- Make this async
  if (!prompt || loading) return;

  await handleAiChange(prompt); // <-- Wait for the AI to finish

  setPrompt(""); // Clear input *after*
  onClose(); // Close the box *after*
};

  return (
    <div
      className="absolute z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translateX(-50%)", // Center horizontally
        marginTop: "10px", // Add a small gap below the element
      }}
    >
      <div className="w-80 shadow-2xl bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Edit with AI</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <input
              placeholder="e.g., 'Make this text bold'..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              autoFocus
            />

            <Button 
              onClick={handleSubmit} 
              disabled={loading || !prompt}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FloatingActionTool;