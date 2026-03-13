import { useEffect, useRef, useState } from "react";
import FloatingActionTool from "../../../components/shared/FloatingActionTool";
import { extractHTML, generateWithOllama } from "../../../config/ollama";

const HTML_DEFAULT = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Slide Renderer</title>

<script src="https://cdn.tailwindcss.com"></script>

<script>
 tailwind.config = {
  theme: {
   extend: {
    colors: {colorCodes},
   },
  },
 };
</script>
    
<link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet" crossorigin="anonymous">
<script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js" crossorigin="anonymous"></script>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" crossorigin="anonymous" />
    
<script src="https://cdn.jsdelivr.net/npm/chart.js" crossorigin="anonymous"></script>

<link href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" rel="stylesheet" crossorigin="anonymous">
<script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js" crossorigin="anonymous"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" crossorigin="anonymous"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js" crossorigin="anonymous"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" crossorigin="anonymous" />
<script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js" crossorigin="anonymous"></script>

<link rel="stylesheet" href="https://unpkg.com/tippy.js@6/dist/tippy.css" crossorigin="anonymous" />
<script src="https://unpkg.com/@popperjs/core@2" crossorigin="anonymous"></script>
<script src="https://unpkg.com/tippy.js@6" crossorigin="anonymous"></script>
</head>

{code}
<style>
  body { 
    margin: 0; 
    padding: 0; 
    overflow: hidden; 
    background: transparent;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
  body::-webkit-scrollbar { display: none; } /* Chrome, Safari and Opera */
  
  * { 
    box-sizing: border-box; 
  }

  .break-words {
    word-break: break-word;
    overflow-wrap: break-word;
  }
</style>
</html>
`;

type prop = {
  slide: { code: string };
  colors: any;
  setUpdateSlider: (updateSlideCode: string) => void;
  isEditable: boolean;
};

function SliderFrame({
  slide,
  colors,
  setUpdateSlider,
  isEditable,
}: prop) {
  const FINAL_CODE = HTML_DEFAULT.replace(
    "{colorCodes}",
    JSON.stringify(colors)
  ).replace("{code}", slide?.code).replace(
    "</head>",
    colors.bgImageUrl 
      ? `<style>
          .bg-background {
            background-image: url('${colors.bgImageUrl}') !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            background-color: transparent !important;
          }
        </style>
        </head>`
      : "</head>"
  );

  const iframeRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const selectedElRef = useRef<HTMLElement | null>(null);
  const [cardPosition, setCardPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Slide width is fixed at 800px in prompt
        const newScale = Math.min(1, containerWidth / 800);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(FINAL_CODE);
    doc.close();

    let hoverEl: HTMLElement | null = null;
    let selectedEl: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      if (selectedEl) return;
      const target = e.target as HTMLElement;
      if (hoverEl && hoverEl !== target) hoverEl.style.outline = "";
      hoverEl = target;
      hoverEl.style.outline = "2px dotted blue";
    };

    const handleMouseOut = () => {
      if (selectedEl) return;
      if (hoverEl) {
        hoverEl.style.outline = "";
        hoverEl = null;
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;

      if (!isEditable) {
        setCardPosition(null);
        return;
      }

      if (selectedEl && selectedEl !== target) {
        selectedEl.style.outline = "";
        selectedEl.removeAttribute("contenteditable");
      }

      selectedEl = target;
      selectedElRef.current = target;

      if (selectedEl && selectedEl !== target) {
        selectedEl.style.outline = "";
        selectedEl.removeAttribute("contenteditable");
      }

      selectedEl = target;
      selectedEl.style.outline = "2px solid blue";
      selectedEl.setAttribute("contenteditable", "true");
      selectedEl.focus();

      const rect = target.getBoundingClientRect();
      const iframeRect = iframe.getBoundingClientRect();

      setCardPosition({
        x: iframeRect.left + rect.left + rect.width / 2,
        y: iframeRect.top + rect.bottom,
      });
    };

    const handleBlur = () => {
      if (selectedEl) {
        const updatedSliderCode = iframe.contentDocument?.body?.innerHTML;
        if (updatedSliderCode) {
          setUpdateSlider(updatedSliderCode);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedEl) {
        selectedEl.style.outline = "";
        selectedEl.removeAttribute("contenteditable");
        selectedEl.removeEventListener("blur", handleBlur);
        selectedEl = null;
      }
    };

    const onDOMLoaded = () => {
      doc.body?.addEventListener("mouseover", handleMouseOver);
      doc.body?.addEventListener("mouseout", handleMouseOut);
      doc.body?.addEventListener("click", handleClick);
      doc.body?.addEventListener("keydown", handleKeyDown);
    };

    doc.addEventListener("DOMContentLoaded", onDOMLoaded);

    return () => {
      doc.body?.removeEventListener("mouseover", handleMouseOver);
      doc.body?.removeEventListener("mouseout", handleMouseOut);
      doc.body?.removeEventListener("click", handleClick);
      doc.body?.removeEventListener("keydown", handleKeyDown);
      doc.removeEventListener("DOMContentLoaded", onDOMLoaded);
    };
  }, [slide?.code, FINAL_CODE, setUpdateSlider]);

  // ✅ ENHANCED: AI Section Change with Advanced Image Editing
  const handleAiSectionChange = async (userAiPrompt: string) => {
    setLoading(true);
    const selectedEl = selectedElRef.current;
    const iframe = iframeRef.current;

    if (!selectedEl || !iframe) {
      setLoading(false);
      return;
    }

    const oldHTML = selectedEl.outerHTML;

    // ✅ ENHANCED PROMPT with comprehensive ImageKit transformations
    const prompt = `
Regenerate or rewrite the following HTML code based on this user instruction.

**POLLINATIONS.AI USAGE RULES:**

1. **Generate New Image:**
   - Use: 'https://image.pollinations.ai/prompt/{imagePrompt}%20{uniqueId}'
   - Replace {imagePrompt} with a clean, descriptive string (no special symbols).
   - Replace {uniqueId} with a unique string (e.g., project ID + slide number).
   - **CRITICAL**: Do NOT use query parameters (?, &, =) as the service backend is currently unstable when they are present.

**IMPORTANT RULES:**
- Keep the same HTML structure (div, img classes, etc.)
- Only modify what the user asked to change
- For text changes, update the content directly
- For style changes, modify Tailwind classes
- For image changes, update the src attribute with proper Pollinations.ai URL
- Ensure images maintain proper aspect ratio and fit within container
- Use 'object-cover' class for images to prevent distortion

**User Instruction:** "${userAiPrompt}"

**Current HTML Code:**
${oldHTML}

**Output ONLY the modified HTML code. No explanations or markdown.**
`;

    try {
      const response = await generateWithOllama(prompt);
      
      const cleanedResponse = extractHTML(response);
      const newHTML = cleanedResponse
        .trim()
        .replace(/```(?:html)?\s*|\s*```/g, ""); // Clean markdown

      const tempDiv = iframe.contentDocument?.createElement("div");
      if (tempDiv) {
        tempDiv.innerHTML = newHTML;
        const newNode = tempDiv.firstElementChild;

        if (newNode && selectedEl.parentNode) {
          selectedEl.parentNode.replaceChild(newNode, selectedEl);
          selectedElRef.current = newNode as HTMLElement;

          const updatedSliderCode =
            iframe.contentDocument?.body?.innerHTML || newHTML;
          setUpdateSlider(updatedSliderCode);
        }
      }
    } catch (err) {
      console.error("❌ AI generation failed:", err);
    }

    setLoading(false);
  };


  return (
    <div className="mb-10 w-full flex justify-center" ref={containerRef}>
      <div 
        style={{ 
          width: '800px', 
          height: `${450 * scale}px`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <iframe
          ref={iframeRef}
          style={{
            width: '800px',
            height: '450px',
            border: 'none',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            borderRadius: '16px',
          }}
          sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
        />
        
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      <FloatingActionTool
        position={cardPosition}
        onClose={() => setCardPosition(null)}
        loading={loading}
        handleAiChange={handleAiSectionChange}
      />
    </div>
  );
}

export default SliderFrame;