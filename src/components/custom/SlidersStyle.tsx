import React from "react";

import professionalSlider from "./../../assets/professional.jpg";
import ModernGradientSlider from "./../../assets/modern-gradient.jpg";
import DarkSlider from "./../../assets/dark.jpg";
import PastelSlider from "./../../assets/pastel-ppt.jpg";
import MinWhitesSlider from "./../../assets/Minimalist-White.jpg";
import TechSlider from "./../../assets/tech.jpg";

export const Design_Style = [
  {
    styleName: "Professional Blue 💼",
    colors: {
      primary: "#0A66C2",      // Blue - good contrast on white
      secondary: "#1C1C1C",    // Dark grey - good contrast on white
      accent: "#0052A3",       // ✅ FIXED: Darker blue instead of light blue
      background: "#FFFFFF",   // White
      gradient: "linear-gradient(135deg, #0A66C2, #E8F0FE)",
    },
    bannerImage: professionalSlider,
    icon: "briefcase",
  },
  {
    styleName: "Minimal White ⚪",
    colors: {
      primary: "#1C1C1C",      // Dark - good contrast on white
      secondary: "#666666",    // ✅ FIXED: Darker grey for better readability
      accent: "#0A66C2",       // ✅ FIXED: Blue accent for visibility
      background: "#FFFFFF",   // White
      gradient: "linear-gradient(135deg, #FFFFFF, #EDEDED)",
    },
    bannerImage: MinWhitesSlider,
    icon: "square",
  },
  {
    styleName: "Modern Gradient 🌈",
    colors: {
      primary: "#1C1C1C",      // ✅ FIXED: Dark text for white background
      secondary: "#4A4A4A",    // ✅ FIXED: Grey for body text
      accent: "#8A2BE2",       // Purple accent - kept for brand
      background: "#FFFFFF",   // White
      gradient: "linear-gradient(135deg, #8A2BE2, #00C9FF, #92FE9D)",
    },
    bannerImage: ModernGradientSlider,
    icon: "sparkles",
  },
  {
    styleName: "Elegant Dark 🖤",
    colors: {
      primary: "#FFFFFF",      // ✅ FIXED: White text for dark background
      secondary: "#E0E0E0",    // ✅ FIXED: Light grey for body text
      accent: "#FFD700",       // Gold - kept, good contrast on dark
      background: "#0D0D0D",   // Dark black
      gradient: "linear-gradient(135deg, #0D0D0D, #1F1F1F)",
    },
    bannerImage: DarkSlider,
    icon: "moon",
  },
  {
    styleName: "Creative Pastel 🎨",
    colors: {
      primary: "#2C3E50",      // ✅ FIXED: Dark blue-grey for readability
      secondary: "#34495E",    // ✅ FIXED: Medium grey for body
      accent: "#8E44AD",       // ✅ FIXED: Purple for highlights
      background: "#FFFFFF",   // White
      gradient: "linear-gradient(135deg, #F6D6FF, #A0E7E5, #B4F8C8)",
    },
    bannerImage: PastelSlider,
    icon: "palette",
  },
  {
    styleName: "Startup Pitch 🚀",
    colors: {
      primary: "#0052CC",      // Blue - good contrast on white
      secondary: "#172B4D",    // Dark blue-grey - good contrast
      accent: "#36B37E",       // Green - kept for brand
      background: "#FFFFFF",   // White
      gradient: "linear-gradient(135deg, #0052CC, #36B37E)",
    },
    bannerImage: TechSlider,
    icon: "rocket",
  },
] as const;

export type DesignStyleType = (typeof Design_Style)[number];

type Props = {
  /** optional current selection (by styleName) to highlight in UI */
  selectedStyleName?: string;
  /** callback receives the full style object */
  onSelect?: (style: DesignStyleType) => void;
};

export default function SlidersStyle({
  selectedStyleName = "",
  onSelect,
}: Props) {
  return (
    <div className="mt-5 px-4 py-5 bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl">
      <h2 className="font-bold text-2xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
        Select Slide Style
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Design_Style.map((design, index) => {
          const isSelected = selectedStyleName === design.styleName;
          return (
            <div
              key={index}
              onClick={() => onSelect && onSelect(design)}
              className={`cursor-pointer rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl border-4 ${
                isSelected
                  ? "border-blue-500 shadow-blue-200"
                  : "border-transparent"
              } bg-white`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={design.bannerImage}
                  alt={design.styleName}
                  className={`w-full h-[120px] object-cover transition-transform duration-300 ${
                    isSelected ? "scale-110" : "hover:scale-110"
                  }`}
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg">
                    ✓
                  </div>
                )}
              </div>

              <div
                className={`text-center py-2 font-semibold transition-colors ${
                  isSelected ? "text-blue-600 bg-blue-50" : "text-gray-800"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {/* You can replace this with a real icon renderer */}
                  <span className="text-sm opacity-80">{design.icon}</span>
                  <span>{design.styleName}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* confirmation */}
      {/* selectedStyleName may be string or blank */}
      {selectedStyleName && (
        <div className="mt-4 text-center">
          <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2 rounded-full shadow-lg">
            <span className="text-base">
              ✅ You selected:{" "}
              <span className="font-bold">{selectedStyleName}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
