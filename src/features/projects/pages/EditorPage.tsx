import OutlineSection from "@/features/projects/components/OutlineSection";
import { firebaseDb } from "../../../config/firebase";

import { generateSlideHTML } from "../../../utils/slideTemplates";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { Project } from "./OutlinePage";
import type { Outline } from "@/features/projects/components/OutlineSection";
import SliderFrame from "@/features/projects/components/SliderFrame";
import PptxGenJS from "pptxgenjs";
import { addSlideToPptx } from "../../../utils/pptxGenerator";
import { FileDown, InfoIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Background color ke basis par text dark ya light hona chahiye ye check karne wala function
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

// Heading colors ko background ke according adjust karne wala function
const getAccessibleColors = (colors: any) => {
  const bgColor = colors.background || '#FFFFFF';
  const isDarkBg = isColorDark(bgColor);
  
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
      bgImageUrl: colors.bgImageUrl,                          // Pass background image if exists
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
      bgImageUrl: colors.bgImageUrl,                          // Pass background image if exists
    };
  }
};

// ✅ PREMIUM SLIDER_PROMPT: Balanced typography, spacious layout, and professional design







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
  const [apiError, setApiError] = useState<string | null>(null);

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

  // Client-side templates se near-instant slides generate karna
  const GenerateSlides = async () => {
    if (!projectDetail?.outline || projectDetail.outline.length === 0) {
      console.error("Missing outline. Cannot generate slides.");
      setApiError("Project outline is missing. Please go back and generate the outline first.");
      return;
    }

    if (!projectDetail.selectedStyle || typeof projectDetail.selectedStyle !== "object") {
      return;
    }

    // Outline data ko rich templates se map karna
    const generatedSlides = projectDetail.outline.map((slide: Outline) => {
      return {
        code: generateSlideHTML(slide, projectDetail.selectedStyle)
      };
    });

    setSliders(generatedSlides);

    setIsSlidesGenerated(Date.now());
  };



  useEffect(() => {
    if (isSlidesGenerated && projectDetail?.slides?.length === 0) {
      SaveAllSlides();
    }
  }, [isSlidesGenerated]);

  // Naya project save karne ka logic
  const SaveAllSlides = async () => {
    if (!projectId || !projectDetail?.outline) {
      return;
    }

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

  // Sidebar (OutlineSection) se outline update handle karna
  const onOutlineUpdate = async (updatedOutline: Outline[]) => {
    // 1. Update project detail state
    setProjectDetail(prev => prev ? ({ ...prev, outline: updatedOutline }) : prev);

    // 2. Regenerate ALL slides based on the new outline
    if (projectDetail?.selectedStyle) {
      const refreshedSlides = updatedOutline.map((slide: Outline) => ({
        code: generateSlideHTML(slide, projectDetail.selectedStyle)
      }));
      setSliders(refreshedSlides);
      setIsSlidesGenerated(Date.now());

      // 3. Save to Firestore
      try {
        await setDoc(
          doc(firebaseDb, "projects", projectId!),
          {
            outline: updatedOutline,
            slides: refreshedSlides,
          },
          { merge: true }
        );
      } catch (err) {
        console.error("❌ Failed to save outline update:", err);
      }
    }
  };



  const exportAllIframesToPPT = async () => {
    if (!projectDetail?.outline || projectDetail.outline.length === 0) {
      alert("No slides found to export.");
      return;
    }
    
    try {
      setDownloadLoading(true);
      
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_16x9";
      
      // Native Export: Outline data se native PptxGenJS objects banana (Editable PPT ke liye)
      projectDetail.outline.forEach((slide) => {
        addSlideToPptx(pptx, slide, projectDetail.selectedStyle);
      });
      
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${projectDetail?.projectId || "MyProject"}_${timestamp}.pptx`;
      
      await pptx.writeFile({ fileName });
      
    } catch (error) {
      console.error("❌ Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center mt-4">
        <Alert variant={apiError ? "destructive" : "default"} className="max-w-lg">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>{apiError ? "Generation Error" : "Editor Mode"}</AlertTitle>
          <AlertDescription>
            {apiError 
              ? apiError
              : isSlidesGenerated
                ? "All slides are loaded. Click any element to edit."
                : "Initializing slide generation..."}
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-5 p-10 gap-10 ">
        <div className="col-span-2 h-[90vh] overflow-auto ">
          <OutlineSection
            outline={projectDetail?.outline ?? []}
            loading={loading}
            onUpdate={onOutlineUpdate}
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