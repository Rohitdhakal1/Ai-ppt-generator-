import { doc, setDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import FloatingActionTool from "./FloatingActionTool";
import { GeminiAiModel, firebaseDb } from "./../../../config/FirebaseConfig";

const HTML_DEFAULT = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="AI Website Builder - Modern TailwindCSS + Flowbite Template">
<title>AI Website Builder</title>

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
    
<link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
    
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<link href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.11.2/lottie.min.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
<script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>

<link rel="stylesheet" href="https://unpkg.com/tippy.js@6/dist/tippy.css" />
<script src="https://unpkg.com/@popperjs/core@2"></script>
<script src="https://unpkg.com/tippy.js@6"></script>
</head>

{code}
</html>
`;

type prop = {
  slide: { code: string };
  colors: any;
  setUpdateSlider: (updateSlideCode: string) => void;
  projectId: string;
  isEditable: boolean;
};

function SliderFrame({
  slide,
  colors,
  setUpdateSlider,
  projectId,
  isEditable,
}: prop) {
  const FINAL_CODE = HTML_DEFAULT.replace(
    "{colorCodes}",
    JSON.stringify(colors)
  ).replace("{code}", slide?.code);

  const iframeRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const selectedElRef = useRef<HTMLElement | null>(null);
  const [cardPosition, setCardPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

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

      console.log("Selected element:", selectedEl);

      const rect = target.getBoundingClientRect();
      const iframeRect = iframe.getBoundingClientRect();

      setCardPosition({
        x: iframeRect.left + rect.left + rect.width / 2,
        y: iframeRect.top + rect.bottom,
      });
    };

    const handleBlur = () => {
      if (selectedEl) {
        console.log("Final edited element:", selectedEl.outerHTML);
        const updatedSliderCode = iframe.contentDocument?.body?.innerHTML;
        console.log(updatedSliderCode);
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

**IMAGEKIT USAGE RULES:**

1. **Generate New Image:**
   - Use: 'https://ik.imagekit.io/ikmedia/ik-genimg-prompt-{imagePrompt}/{altImageName}.jpg'
   - Replace {imagePrompt} with a detailed, URL-encoded image description (e.g., "modern%20office%20space%20minimalist")
   - Replace {altImageName} with a descriptive filename (e.g., "officeInterior" or "teamMeeting")

2. **Image Transformations (use ?tr= parameter):**
   
   **Cropping & Resizing:**
   - Crop: ?tr=c-at_max (maintain aspect ratio)
   - Specific size: ?tr=w-800,h-450 (width and height)
   - Smart crop: ?tr=fo-auto (focus on important parts)
   
   **Background Operations:**
   - Remove background: ?tr=bg-remove (transparent background)
   - Change background color: ?tr=bg-HEXCODE (e.g., bg-FFFFFF for white)
   - Blur background: ?tr=e-blur-20
   
   **Quality & Format:**
   - Optimize: ?tr=q-80,f-auto (80% quality, auto format)
   - High quality: ?tr=q-95
   - WebP format: ?tr=f-webp
   
   **Effects & Filters:**
   - Grayscale: ?tr=e-grayscale
   - Sharpen: ?tr=e-sharpen-10
   - Contrast: ?tr=e-contrast-20
   - Brightness: ?tr=e-brightness-20
   - Saturation: ?tr=e-saturation-20
   
   **Advanced:**
   - Round corners: ?tr=r-20
   - Rotation: ?tr=rt-90 (rotate 90 degrees)
   - Multiple transformations: ?tr=w-800,h-450,fo-auto,q-80,f-auto

3. **Common User Requests & Solutions:**
   - "crop the image" → ?tr=c-at_max,fo-auto
   - "remove background" → ?tr=bg-remove
   - "make it smaller" → ?tr=w-400,h-300
   - "optimize the image" → ?tr=q-80,f-auto
   - "make it square" → ?tr=w-500,h-500,c-at_max
   - "blur background" → ?tr=e-blur-30
   - "change to grayscale" → ?tr=e-grayscale
   - "rounded corners" → ?tr=r-15
   - "regenerate image" → Create new URL with different {imagePrompt}

**IMPORTANT RULES:**
- Keep the same HTML structure (div, img classes, etc.)
- Only modify what the user asked to change
- For text changes, update the content directly
- For style changes, modify Tailwind classes
- For image changes, update the src attribute with proper ImageKit URL and transformations
- Ensure images maintain proper aspect ratio and fit within container
- Use 'object-cover' class for images to prevent distortion

**User Instruction:** "${userAiPrompt}"

**Current HTML Code:**
${oldHTML}

**Output ONLY the modified HTML code. No explanations or markdown.**
`;

    try {
      console.log("🤖 Sending prompt to AI for element transformation...");
      const result = await GeminiAiModel.generateContent(prompt);
      const newHTML = (await result.response.text())
        .trim()
        .replace(/```(?:html)?\s*|\s*```/g, ""); // Clean markdown

      console.log("✨ AI Response received:", newHTML);

      const tempDiv = iframe.contentDocument?.createElement("div");
      if (tempDiv) {
        tempDiv.innerHTML = newHTML;
        const newNode = tempDiv.firstElementChild;

        if (newNode && selectedEl.parentNode) {
          selectedEl.parentNode.replaceChild(newNode, selectedEl);
          selectedElRef.current = newNode as HTMLElement;
          console.log("✅ Element replaced successfully");

          const updatedSliderCode =
            iframe.contentDocument?.body?.innerHTML || newHTML;
          console.log("💾 Updating slide code...");
          setUpdateSlider(updatedSliderCode);
        }
      }
    } catch (err) {
      console.error("❌ AI generation failed:", err);
    }

    setLoading(false);
  };

  const SaveAllSlides = async (updatedSlides: any[]) => {
    if (!projectId) return;
    await setDoc(
      doc(firebaseDb, "projects", projectId),
      { slides: updatedSlides },
      { merge: true }
    );
    console.log("✅ Slides updated to Firestore");
  };

  return (
    <div className="mb-5">
      <iframe
        ref={iframeRef}
        className="w-[800px] h-[450px] border-0 rounded-2xl"
        sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
      />

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