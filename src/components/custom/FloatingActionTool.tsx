import React, { useState } from "react";
import { Input } from "@/components/ui/input"; // Using shadcn Input
import { Button } from "@/components/ui/button"; // Using shadcn Button
import { Card, CardContent } from "@/components/ui/card"; // Using shadcn Card
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
      <Card className="w-80 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Edit with AI</span>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Input
              placeholder="e.g., 'Make this text bold' or 'Change image to a cat'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />

            <Button onClick={handleSubmit} disabled={loading || !prompt}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FloatingActionTool;