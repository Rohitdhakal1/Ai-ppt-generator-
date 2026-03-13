import PptxGenJS from "pptxgenjs";
import type { Outline } from "@/features/projects/components/OutlineSection";
import type { DesignStyleType } from "@/features/projects/components/SliderStyle";

// Custom slide types ko native PptxGenJS objects me map karna (Taki PPT editable rahe)
export const addSlideToPptx = (
  pptx: PptxGenJS,
  slide: Outline,
  style: DesignStyleType | any
) => {
  const newSlide = pptx.addSlide();

  // Extract colors with fallbacks
  const colors = typeof style === 'object' && style?.colors ? style.colors : {
    primary: "#1C1C1C",
    secondary: "#4A4A4A",
    accent: "#0A66C2",
    background: "#FFFFFF",
  };

  const { primary, secondary, accent, background } = colors;
  const { type, content, outline } = slide;

  // Set background color
  newSlide.background = { color: background.startsWith('#') ? background.replace('#', '') : "FFFFFF" };

  // Hex code se '#' hatane ke liye helper
  const cleanHex = (hex: string) => (hex || "").replace("#", "");

  switch (type) {
    case "intro":
      newSlide.addText(outline, {
        x: 0.8,
        y: 1.5,
        w: 8.4,
        h: 1.2,
        fontSize: 28,
        bold: true,
        color: cleanHex(primary),
        align: "center",
      });
      newSlide.addShape("rect" as any, {
        x: 4.25,
        y: 2.8,
        w: 1.5,
        h: 0.08,
        fill: { color: cleanHex(accent || primary) },
      });
      newSlide.addText(content?.join(" • ") || "", {
        x: 0.8,
        y: 3.2,
        w: 8.4,
        h: 0.8,
        fontSize: 16,
        color: cleanHex(secondary),
        align: "center",
      });
      break;

    case "image_right":
    case "image_left":
    case "content":
      newSlide.addText(outline, {
        x: 0.8,
        y: 0.8,
        w: 8.4,
        h: 0.6,
        fontSize: 22,
        bold: true,
        color: cleanHex(primary),
      });
      newSlide.addShape("rect" as any, {
        x: 0.8,
        y: 1.5,
        w: 1.0,
        h: 0.06,
        fill: { color: cleanHex(accent || primary) },
      });
      newSlide.addText(content?.map(c => `• ${c}`).join("\n") || "", {
        x: 0.9,
        y: 1.8,
        w: 8.2,
        h: 3.2,
        fontSize: 14,
        color: cleanHex(secondary),
        valign: "top",
        lineSpacing: 18
      });
      break;

    case "timeline":
      newSlide.addText(outline, {
        x: 0.5,
        y: 0.6,
        w: 9,
        h: 1,
        fontSize: 36,
        bold: true,
        color: cleanHex(primary),
        align: "center",
      });
      // Timeline divider line draw karna
      newSlide.addShape("line" as any, {
        x: 1,
        y: 2.5,
        w: 8,
        h: 0,
        line: { color: cleanHex(accent || primary), width: 3 }
      });
      // Timeline ke individual steps add karna
      (content || []).forEach((step, idx) => {
        const xPos = 1 + (idx * (8 / (content.length || 1)));
        newSlide.addShape("ellipse" as any, {
          x: xPos - 0.3,
          y: 2.2,
          w: 0.6,
          h: 0.6,
          fill: { color: cleanHex(accent || primary) },
          line: { color: "FFFFFF", width: 3 },
        });
        newSlide.addText((idx + 1).toString(), {
          x: xPos - 0.3,
          y: 2.2,
          w: 0.6,
          h: 0.6,
          fontSize: 16,
          bold: true,
          color: "FFFFFF",
          align: "center",
        });
        newSlide.addText(step, {
          x: xPos - 0.8,
          y: 3.0,
          w: 1.6,
          h: 2,
          fontSize: 14,
          bold: true,
          color: cleanHex(secondary),
          align: "center",
          valign: "top",
        });
      });
      break;

    case "pros_cons":
      newSlide.addText(outline, {
        x: 0.8,
        y: 0.7,
        w: 8.4,
        h: 0.6,
        fontSize: 22,
        bold: true,
        color: cleanHex(primary),
        align: "center",
      });
      const half = Math.ceil((content?.length || 0) / 2);
      // Pros box
      newSlide.addShape("roundRect" as any, {
        x: 0.8,
        y: 1.5,
        w: 4.1,
        h: 2.8,
        fill: { color: "F0F9F1" }, // light green
        line: { color: "A7F3D0", width: 1 }
      });
      newSlide.addText("Benefits", {
        x: 1.0,
        y: 1.6,
        w: 3.7,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: "065F46",
        align: "center"
      });
      newSlide.addText(content?.slice(0, half).map(c => `✓ ${c}`).join("\n") || "", {
        x: 1.0,
        y: 2.0,
        w: 3.7,
        h: 2.1,
        fontSize: 11,
        color: "1F2937",
        valign: "top",
      });
      // Cons box
      newSlide.addShape("roundRect" as any, {
        x: 5.1,
        y: 1.5,
        w: 4.1,
        h: 2.8,
        fill: { color: "FEF2F2" }, // light red
        line: { color: "FECACA", width: 1 }
      });
      newSlide.addText("Challenges", {
        x: 5.3,
        y: 1.6,
        w: 3.7,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: "991B1B",
        align: "center"
      });
      newSlide.addText(content?.slice(half).map(c => `✕ ${c}`).join("\n") || "", {
        x: 5.3,
        y: 2.0,
        w: 3.7,
        h: 2.1,
        fontSize: 11,
        color: "1F2937",
        valign: "top",
      });
      break;

    case "conclusion":
      newSlide.addText("Thank You", {
        x: 0.8,
        y: 1.2,
        w: 8.4,
        h: 1.0,
        fontSize: 48,
        bold: true,
        color: cleanHex(primary),
        align: "center",
      });
      newSlide.addShape("rect" as any, {
        x: 4.25,
        y: 2.3,
        w: 1.5,
        h: 0.1,
        fill: { color: cleanHex(accent || primary) },
      });
      newSlide.addText(outline, {
        x: 0.8,
        y: 2.6,
        w: 8.4,
        h: 0.6,
        fontSize: 18,
        bold: true,
        italic: true,
        color: cleanHex(secondary),
        align: "center",
      });
      newSlide.addText(content?.map(c => `• ${c}`).join("\n") || "", {
        x: 1.5,
        y: 3.4,
        w: 7,
        h: 1.8,
        fontSize: 11,
        color: cleanHex(secondary),
        align: "center",
        valign: "top"
      });
      break;

    case "columns":
      newSlide.addText(outline, {
        x: 0.8,
        y: 0.7,
        w: 8.4,
        h: 0.6,
        fontSize: 24,
        bold: true,
        color: cleanHex(primary),
        align: "center",
      });
      const colHalf = Math.ceil((content?.length || 0) / 2);
      newSlide.addText(content?.slice(0, colHalf).map(c => `• ${c}`).join("\n") || "", {
        x: 0.8,
        y: 1.8,
        w: 3.8,
        h: 3.2,
        fontSize: 13,
        color: cleanHex(secondary),
      });
      newSlide.addShape("line" as any, {
        x: 5,
        y: 1.8,
        w: 0,
        h: 3.2,
        line: { color: cleanHex(accent || primary), width: 1 }
      });
      newSlide.addText(content?.slice(colHalf).map(c => `• ${c}`).join("\n") || "", {
        x: 5.4,
        y: 1.8,
        w: 3.8,
        h: 3.2,
        fontSize: 13,
        color: cleanHex(secondary),
      });
      break;

    default: // Standard 'content' slide
      newSlide.addText(outline, {
        x: 0.8,
        y: 0.8,
        w: 8.4,
        h: 0.8,
        fontSize: 24,
        bold: true,
        color: cleanHex(primary),
        align: "center"
      });
      newSlide.addShape("rect" as any, {
        x: 4.25,
        y: 1.7,
        w: 1.5,
        h: 0.08,
        fill: { color: cleanHex(accent || primary) },
      });
      newSlide.addText(content?.map(c => `• ${c}`).join("\n") || "", {
        x: 1,
        y: 2.1,
        w: 8,
        h: 3,
        fontSize: 14,
        color: cleanHex(secondary),
        valign: "top",
        align: "center"
      });
      break;
  }
};
