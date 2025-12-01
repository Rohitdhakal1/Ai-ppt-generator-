import OutlineSection from "@/components/custom/OutlineSection";

import {
  firebaseDb,
  GeminiAiLiveModel,
} from "./../../../../config/FirebaseConfig";

import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { Project } from "../Outline";
import SliderFrame from "@/components/custom/SliderFrame";
import * as htmlToImage from "html-to-image";
import PptxGenJS from "pptxgenjs";
import { FileDown, InfoIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ✅ NEW: Helper function to calculate luminance and determine if background is dark
const isColorDark = (hexColor: string): boolean => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance (0 = black, 1 = white)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if dark (luminance < 0.5)
  return luminance < 0.5;
};

// ✅ ENHANCED: Function to ensure distinct heading colors
const getAccessibleColors = (colors: any) => {
  const bgColor = colors.background || '#FFFFFF';
  const isDarkBg = isColorDark(bgColor);
  
  console.log(`🎨 Background: ${bgColor}, Is Dark: ${isDarkBg}`);
  
  if (isDarkBg) {
    // Dark background → Keep vibrant heading colors or use light text
    // If primary is already light/vibrant, keep it; otherwise use white
    const primaryIsBright = !isColorDark(colors.primary || '#FFFFFF');
    
    return {
      primary: primaryIsBright ? colors.primary : '#FFFFFF', // Heading color
      secondary: '#E0E0E0',                                   // Body text (light grey)
      accent: colors.accent || '#FFD700',                     // Accent color
      background: bgColor,
      gradient: colors.gradient,
    };
  } else {
    // Light background → Keep bold/vibrant heading colors or use dark text
    // If primary is already dark/vibrant, keep it; otherwise use black
    const primaryIsDark = isColorDark(colors.primary || '#000000');
    
    return {
      primary: primaryIsDark || colors.primary !== '#FFFFFF' ? colors.primary : '#1C1C1C', // Heading (colored or black)
      secondary: '#4A4A4A',                                   // Body text (grey)
      accent: colors.accent || '#0A66C2',                     // Accent color
      background: bgColor,
      gradient: colors.gradient,
    };
  }
};

// ✅ ENHANCED SLIDER_PROMPT with automatic contrast handling
const SLIDER_PROMPT = `Generate HTML (TailwindCSS + Flowbite UI + Lucide Icons) 
code for a single 16:9 ppt slide.

**YOU MUST FOLLOW THESE STRICT RULES FOR CONSISTENCY:**

1.  **Overall Style:** The slide MUST embody a "{DESIGN_STYLE}" aesthetic.

2.  **Background Color:** The main slide background MUST use 'bg-background'.

3.  **Text Colors (CRITICAL FOR READABILITY):**
    * Background color is: {BACKGROUND_COLOR}
    * This is a {BACKGROUND_TYPE} background
    * **HEADINGS (h1, h2, h3):** MUST use 'text-primary' - This is a VIBRANT/BOLD color for impact
    * **BODY TEXT (p, span):** MUST use 'text-secondary' - This is a READABLE grey for paragraphs
    * **ACCENT TEXT (highlights, numbers):** MUST use 'text-accent'
    * NEVER EVER use hardcoded colors like 'text-white', 'text-black', 'text-gray-XXX', or ANY hex colors
    * text-primary is specifically chosen to make headings STAND OUT with color
    * text-secondary is chosen for optimal body text readability
    * {TEXT_ENHANCEMENT}

4.  **Layout & Aspect Ratio:**
    * The outermost container MUST be: \`<div class="w-[800px] h-[450px] relative overflow-hidden bg-background">\`.
    * MANDATORY: Use CSS Grid with \`grid grid-cols-2 gap-6\` for two-column layout
    * NEVER create single-column centered layouts
    * Use minimum gap-6 or p-8 for spacing between elements

5.  **Images:**
    * If an image is used, generate a valid URL: 'https://ik.imagekit.io/ikmedia/ik-genimg-prompt-{imagePrompt}/{altImageName}.jpg'.
    * Replace {imagePrompt} and {altImageName} with relevant, specific values.
    * Images MUST occupy ONLY ONE column (50% width maximum)
    * Image position for this slide: {IMAGE_POSITION}
    * ALWAYS place text content in the OTHER column opposite to the image

**CRITICAL LAYOUT RULES:**
- ALWAYS use grid-cols-2 (two columns side by side)
- BOTH columns must have content - NO EMPTY COLUMNS
- Heading: text-3xl or text-4xl with font-bold text-primary
- Body: text-base or text-lg with text-secondary
- Use leading-relaxed for body text readability
- Padding: p-8 for each column

{PREVIOUS_SLIDES_CONTEXT}

**Available Colors (These have been auto-adjusted for contrast):** {COLORS_CODE}

**Metadata for this slide:** {METADATA}

**EXAMPLE STRUCTURE:**
\`\`\`html
<div class="w-[800px] h-[450px] relative overflow-hidden bg-background">
  <div class="grid grid-cols-2 gap-6 h-full p-8">
    <div class="flex flex-col justify-center">
      <h1 class="text-4xl font-bold text-primary mb-4">Heading</h1>
      <p class="text-lg text-secondary leading-relaxed">Body text...</p>
    </div>
    <div class="flex items-center justify-center">
      <img src="..." class="w-full h-auto max-h-[400px] object-cover rounded-lg" />
    </div>
  </div>
</div>
\`\`\`

**CRITICAL: Use ONLY 'text-primary', 'text-secondary', 'text-accent'. NO other text colors!**

Output ONLY the HTML code. No explanations.
`;

const DUMMY_SLIDER = `<div class="w-[800px] h-[450px] relative bg-[#0D0D0D] text-white overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-[#0D0D0D] to-[#1F1F1F] opacity-70"></div>
        <div class="grid grid-cols-2 grid-rows-2 h-full relative z-10">
            <div class="col-span-1 row-span-1 p-8 flex flex-col justify-start items-start">
                <h1 class="text-4xl font-serif font-bold text-accent mb-4">
                    Welcome to Kravix Studio
                </h1>
                <p class="text-sm text-gray-300 leading-relaxed">
                    A warm greeting to attendees, introducing the intriguing topic of creating and recreating extinct animals.
                </p>
            </div>
            <div class="col-span-1 row-span-1 p-4 flex justify-end items-start">
                <img src="https://ik.imagekit.io/ikmedia/ik-genimg-prompt-futuristic%20film%20studio%20interior%20black%20gold%20accents/filmStudioAesthetic.jpg" alt="filmStudioAesthetic" class="rounded-lg shadow-lg w-full h-auto object-cover max-h-[200px]">
            </div>
            <div class="col-span-1 row-span-1 p-8 flex flex-col justify-end items-start">
                <div class="bg-[#1F1F1F] bg-opacity-60 backdrop-blur-md rounded-lg p-6">
                    <h2 class="text-2xl font-serif font-semibold mb-2">
                        Unleash Your Creative Vision
                    </h2>
                    <p class="text-gray-200 text-sm leading-relaxed">
                        Transform ideas into stunning short films with the power of AI.
                    </p>
                </div>
            </div>
            <div class="col-span-1 row-span-1 p-8 flex justify-end items-end">
                 <div class="flex items-center space-x-2">
                        <span class="text-gray-400 text-xs font-medium">Slide</span>
                        <span class="text-accent font-bold text-xl">1</span>
                    </div>
                
            </div>
        </div>
    </div>`;

const BLANK_LOADING_SLIDE = `<div class="w-[800px] h-[450px] relative overflow-hidden bg-gray-100 flex items-center justify-center">
  <svg class="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
</div>`;

const extractLayoutPattern = (
  slideCode: string,
  slideNumber: number
): string => {
  if (!slideCode || slideCode.includes("animate-spin")) {
    return "";
  }

  try {
    const hasGrid = slideCode.includes("grid");
    const hasImage = slideCode.includes("<img");

    let imagePosition = "unknown";
    if (hasImage) {
      const gridMatch = slideCode.match(/grid-cols-2/);
      if (gridMatch) {
        const firstColContent = slideCode.substring(
          slideCode.indexOf("grid-cols-2"),
          slideCode.indexOf("grid-cols-2") + 500
        );
        if (firstColContent.includes("<img")) {
          imagePosition = "left";
        } else {
          imagePosition = "right";
        }
      }
    }

    const textSizes =
      slideCode.match(/text-\d?xl|text-lg|text-base|text-sm|text-xs/g) || [];
    const uniqueTextSizes = [...new Set(textSizes)];

    const padding = slideCode.match(/p-\d+|px-\d+|py-\d+/g) || [];
    const uniquePadding = [...new Set(padding)];

    const nextImagePosition = slideNumber % 2 === 0 ? "left" : "right";

    return `
**CONSISTENCY FROM PREVIOUS SLIDE:**

Previous slide used:
- Layout: ${hasGrid ? "CSS Grid with grid-cols-2" : "Standard"}
- Image position: ${imagePosition}
- Text sizes: ${uniqueTextSizes.join(", ") || "text-3xl, text-lg"}
- Padding: ${uniquePadding.join(", ") || "p-8"}

**FOR THIS SLIDE:**
- Image position: Place image in ${nextImagePosition.toUpperCase()} column
- Text position: Place ALL text content in ${
      nextImagePosition === "left" ? "RIGHT" : "LEFT"
    } column
- Use SAME text sizes and padding as above
- Ensure both columns have content
`;
  } catch (error) {
    console.error("Error extracting layout pattern:", error);
    return "";
  }
};

const validateAndFixSlideCode = (slideCode: string, slideNumber: number): string => {
  if (!slideCode.includes("grid-cols-2")) {
    console.warn(`⚠️ Slide ${slideNumber + 1} missing grid-cols-2, attempting fix...`);
    
    const hasImage = slideCode.includes("<img");
    const imagePosition = slideNumber % 2 === 0 ? "left" : "right";
    
    if (hasImage) {
      const imgMatch = slideCode.match(/<img[^>]+>/);
      const textContent = slideCode.replace(/<img[^>]+>/, "");
      
      if (imgMatch) {
        if (imagePosition === "left") {
          return `<div class="w-[800px] h-[450px] relative overflow-hidden bg-background">
  <div class="grid grid-cols-2 gap-6 h-full p-8">
    <div class="flex items-center justify-center">
      ${imgMatch[0]}
    </div>
    <div class="flex flex-col justify-center">
      ${textContent}
    </div>
  </div>
</div>`;
        } else {
          return `<div class="w-[800px] h-[450px] relative overflow-hidden bg-background">
  <div class="grid grid-cols-2 gap-6 h-full p-8">
    <div class="flex flex-col justify-center">
      ${textContent}
    </div>
    <div class="flex items-center justify-center">
      ${imgMatch[0]}
    </div>
  </div>
</div>`;
        }
      }
    }
  }
  
  return slideCode;
};

function Editor() {
  const { projectId } = useParams<{ projectId: string }>();
  const [projectDetail, setProjectDetail] = useState<Project>();
  const [loading, setLoading] = useState(false);
  const [sliders, setSliders] = useState<any[]>([]);
  const [isSlidesGenerated, setIsSlidesGenerated] = useState<number | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      GetProjectDetail();
    }
  }, [projectId]);

  const GetProjectDetail = async () => {
    setLoading(true);
    try {
      if (!projectId) {
        setLoading(false);
        return;
      }
      const docRef = doc(firebaseDb, "projects", projectId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setLoading(false);
        return;
      }
      const data = docSnap.data() as Project;
      console.log("project doc:", data);
      setProjectDetail(data);

      if (data.slides && data.slides.length > 0) {
        setSliders(data.slides);
        setIsSlidesGenerated(Date.now());
      }
    } catch (err) {
      console.error("Failed to fetch project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      projectDetail &&
      (!projectDetail.slides || projectDetail.slides.length === 0)
    ) {
      GenerateSlides();
    }
  }, [projectDetail]);

  // ✅ ENHANCED: GenerateSlides with automatic contrast fixing
  const GenerateSlides = async () => {
    if (!projectDetail?.outline || projectDetail.outline.length === 0) {
      console.error("Missing outline. Cannot generate slides.");
      return;
    }
    if (
      !projectDetail.selectedStyle ||
      typeof projectDetail.selectedStyle === "string"
    ) {
      console.error(
        "selectedStyle is missing or is not the correct object type."
      );
      return;
    }

    console.log("🚀 Starting slide generation with automatic contrast fixing...");

    // ✅ AUTOMATICALLY FIX TEXT COLORS FOR CONTRAST
    const originalColors = projectDetail.selectedStyle.colors;
    const fixedColors = getAccessibleColors(originalColors);
    
    console.log("📊 Original colors:", originalColors);
    console.log("✅ Fixed colors for accessibility:", fixedColors);

    setSliders(
      Array(projectDetail.outline.length).fill({ code: BLANK_LOADING_SLIDE })
    );

    const generatedSlides: string[] = [];
    const isDarkBg = isColorDark(fixedColors.background);

    for (let index = 0; index < projectDetail.outline.length; index++) {
      const metaData = projectDetail.outline[index];

      let previousSlidesContext = "";
      const imagePosition = index % 2 === 0 ? "left" : "right";
      
      if (generatedSlides.length > 0) {
        const lastSlide = generatedSlides[generatedSlides.length - 1];
        previousSlidesContext = extractLayoutPattern(lastSlide, index);
      } else {
        previousSlidesContext = `
**THIS IS THE FIRST SLIDE - ESTABLISH A CONSISTENT PATTERN:**
- Use CSS Grid with grid-cols-2 (two equal columns)
- Place image in LEFT column, text content in RIGHT column
- Ensure BOTH columns have content
- Text: heading (text-4xl font-bold text-primary) and description (text-lg text-secondary)
- Use p-8 padding, leading-relaxed for readability
- Remember: text-primary, text-secondary, text-accent are already optimized for this background
`;
      }

      // ✅ Add text enhancement tips based on background type
      const textEnhancement = isDarkBg
        ? "For better readability on dark background: Use font-bold for headings, add subtle text-shadow if needed"
        : "For better readability on light background: Use font-semibold or font-bold for headings";

      const prompt = SLIDER_PROMPT
        .replace(
          "{DESIGN_STYLE}",
          projectDetail.selectedStyle.styleName ?? "Modern Minimalist"
        )
        .replace("{BACKGROUND_COLOR}", fixedColors.background)
        .replace("{BACKGROUND_TYPE}", isDarkBg ? "DARK" : "LIGHT")
        .replace("{TEXT_ENHANCEMENT}", textEnhancement)
        .replace("{COLORS_CODE}", JSON.stringify(fixedColors))
        .replace("{PREVIOUS_SLIDES_CONTEXT}", previousSlidesContext)
        .replace("{IMAGE_POSITION}", imagePosition)
        .replace("{METADATA}", JSON.stringify(metaData));

      console.log(
        `🧠 Generating slide ${index + 1}/${projectDetail.outline.length} (Image: ${imagePosition}, BG: ${isDarkBg ? 'Dark' : 'Light'})`
      );

      const slideCode = await GeminiSlideCall(prompt, index);
      if (slideCode && slideCode.trim()) {
        const validatedCode = validateAndFixSlideCode(slideCode, index);
        generatedSlides.push(validatedCode);
        
        setSliders((prev) => {
          const updated = [...prev];
          updated[index] = { code: validatedCode };
          return updated;
        });
        
        console.log(
          `✅ Slide ${index + 1} generated with accessible text colors`
        );
      } else {
        console.warn(`⚠️ Slide ${index + 1} generated but code was empty`);
      }

      if (index < projectDetail.outline.length - 1) {
        console.log(
          "⏳ Pausing for 5 seconds..."
        );
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    console.log("🎉 All slides generated with perfect contrast!");
    setIsSlidesGenerated(Date.now());
  };

  const GeminiSlideCall = async (
    prompt: string,
    index: number
  ): Promise<string> => {
    try {
      const session = await GeminiAiLiveModel.connect();
      await session.send(prompt);

      let text = "";

      for await (const message of session.receive()) {
        if (message.type === "serverContent") {
          const parts = message.modelTurn?.parts;
          if (parts && parts.length > 0) {
            text += parts?.map((p) => p.text).join("");
          }

          if (message.turnComplete) {
            console.log(`✅ Slide ${index + 1} stream complete`);
            break;
          }
        }
      }

      session.close();

      const finalText = text.replace(/```(?:html)?\s*|\s*```/g, "").trim();

      setSliders((prev) => {
        const updated = [...prev];
        updated[index] = { code: finalText };
        return updated;
      });

      return finalText;
    } catch (err) {
      console.error(`❌ Error generating slide ${index + 1}:`, err);
      return "";
    }
  };

  useEffect(() => {
    if (isSlidesGenerated && projectDetail?.slides?.length === 0) {
      SaveAllSlides();
    }
  }, [isSlidesGenerated]);

  const SaveAllSlides = async () => {
    if (!projectId || !projectDetail?.outline) {
      console.error("Missing projectID or outline, cannot save.");
      return;
    }

    console.log("💾 Saving all slides to Firestore...");

    const slidesToSave = sliders;

    try {
      await setDoc(
        doc(firebaseDb, "projects", projectId),
        {
          slides: slidesToSave,
        },
        {
          merge: true,
        }
      );
      console.log("💾 Save complete!");
    } catch (err) {
      console.error("❌ Error saving slides:", err);
    }
  };

  const updateSliderCode = (updateSlideCode: string, index: number) => {
    setSliders((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        code: updateSlideCode,
      };
      return updated;
    });
    setIsSlidesGenerated(Date.now());
  };

  const exportAllIframesToPPT = async () => {
    if (!containerRef.current) {
      console.error("❌ Container ref not found");
      return;
    }
    
    try {
      setDownloadLoading(true);
      console.log("🚀 Starting PPT export...");
      
      const pptx = new PptxGenJS();
      
      // Set presentation properties
      pptx.layout = "LAYOUT_16x9";
      pptx.author = "AI Slide Generator";
      pptx.subject = projectDetail?.topic || "Presentation";
      pptx.title = projectDetail?.projectId || "My Slides";
      
      const iframes = containerRef.current.querySelectorAll("iframe");
      console.log(`📊 Found ${iframes.length} slides to export`);

      if (iframes.length === 0) {
        console.error("❌ No iframes found!");
        setDownloadLoading(false);
        alert("No slides found to export. Please wait for slides to load.");
        return;
      }

      for (let i = 0; i < iframes.length; i++) {
        const iframe = iframes[i] as HTMLIFrameElement;
        
        console.log(`🔍 Processing slide ${i + 1}...`);
        
        // Wait for iframe to be fully loaded
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (!iframeDoc) {
          console.warn(`⚠️ Slide ${i + 1}: Could not access iframe document`);
          continue;
        }

        // Grab the main slide element inside the iframe
        const slideNode = iframeDoc.querySelector("body > div");
        
        if (!slideNode) {
          console.warn(`⚠️ Slide ${i + 1}: No slide content found, trying body...`);
          const bodyNode = iframeDoc.body;
          if (!bodyNode) {
            console.error(`❌ Slide ${i + 1}: No content at all!`);
            continue;
          }
        }

        const elementToCapture = iframeDoc.querySelector("body > div") || iframeDoc.body;
        console.log(`📸 Capturing slide ${i + 1}/${iframes.length}...`);

        try {
          // Convert HTML to image with high quality
          const dataUrl = await htmlToImage.toPng(elementToCapture as HTMLElement, {
            quality: 1,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            cacheBust: true, // Prevent caching issues
          });

          console.log(`✅ Slide ${i + 1} captured, adding to PPT...`);

          // Add slide to presentation
          const slide = pptx.addSlide();
          slide.addImage({
            data: dataUrl,
            x: 0,
            y: 0,
            w: 10,
            h: 5.625,
          });
          
          console.log(`✅ Slide ${i + 1} added to presentation`);
        } catch (error) {
          console.error(`❌ Failed to export slide ${i + 1}:`, error);
          // Continue with next slide instead of stopping
        }
        
        // Small delay to prevent browser hanging
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      console.log("💾 Generating PPT file...");
      
      // Generate filename with project name and timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${projectDetail?.projectId || "MyProject"}_${timestamp}.pptx`;
      
      console.log(`💾 Saving as: ${fileName}`);
      
      // Download the file
      await pptx.writeFile({
        fileName: fileName,
      });
      
      console.log("🎉 PPT export completed successfully!");
      
    } catch (error) {
      console.error("❌ Export failed with error:", error);
      alert("Export failed. Please check console for details.");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center mt-4">
        <Alert variant="default" className="max-w-lg">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Editor Mode</AlertTitle>
          <AlertDescription>
            {isSlidesGenerated
              ? "All slides are loaded. Click any element to edit."
              : "Generating slides with optimized contrast, please wait..."}
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-5 p-10 gap-10 ">
        <div className="col-span-2 h-[90vh] overflow-auto ">
          <OutlineSection
            outline={projectDetail?.outline ?? []}
            handleUpdateOutline={() => console.log()}
            loading={loading}
            editable={false}
          />
        </div>

        <div className="col-span-3 h-screen overflow-auto" ref={containerRef}>
          {sliders?.map((slide: any, index: number) => (
            <SliderFrame
              slide={slide}
              key={index}
              colors={
                typeof projectDetail?.selectedStyle === "object"
                  ? getAccessibleColors(projectDetail.selectedStyle.colors)
                  : {}
              }
              setUpdateSlider={(updateSlideCode: string) =>
                updateSliderCode(updateSlideCode, index)
              }
              projectId={projectDetail?.projectId ?? ""}
              isEditable={!!isSlidesGenerated}
            />
          ))}
        </div>

        {isSlidesGenerated && (
          <Button
            onClick={exportAllIframesToPPT}
            size={"lg"}
            className="fixed bottom-6 transform left-1/2 -translate-x-1/2 z-50 flex gap-2"
            disabled={downloadLoading}
          >
            {downloadLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            Export PPT
          </Button>
        )}
      </div>
    </div>
  );
}

export default Editor;