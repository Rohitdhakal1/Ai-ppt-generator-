

import NeutralBeigeSlider from "../../../assets/neutral-beige-bg.jpg";
import BlueWaveSlider from "../../../assets/blue-wave-bg.jpg";
import GrungeSlider from "../../../assets/grunge-bg.jpg";
import TextileSlider from "../../../assets/textile-bg.jpg";
import LavenderSlider from "../../../assets/lavender-paper-bg.jpg";
import PinkSlider from "../../../assets/soft-pink-bg.jpg";

export const Design_Style = [
  {
    styleName: "Neutral Beige 🍂",
    colors: {
      primary: "#1A0B05",      
      secondary: "#2D1810",    
      accent: "#C19A6B",       
      background: "#F5EFEB",   
      gradient: "linear-gradient(135deg, #F5EFEB, #E6D5C3)",
      bgImageUrl: NeutralBeigeSlider,
    },
    bannerImage: NeutralBeigeSlider,
    icon: "coffee",
  },
  {
    styleName: "Blue Wave 🌊",
    colors: {
      primary: "#040E1B",      
      secondary: "#0F1A2A",    
      accent: "#3387A8",       
      background: "#7BA197",   
      gradient: "linear-gradient(135deg, #668B81, #687A79)",
      bgImageUrl: BlueWaveSlider,
    },
    bannerImage: BlueWaveSlider,
    icon: "droplet",
  },
  {
    styleName: "Dirty Grunge 🎸",
    colors: {
      primary: "#1A1A1A",      
      secondary: "#262626",    
      accent: "#781010",       
      background: "#E49F26",   
      gradient: "linear-gradient(135deg, #3A3636, #614141)",
      bgImageUrl: GrungeSlider,
    },
    bannerImage: GrungeSlider,
    icon: "drum",
  },
  {
    styleName: "Minimal Textile 🧵",
    colors: {
      primary: "#0F172A",      
      secondary: "#1E293B",    
      accent: "#7F8C8D",       
      background: "#FFFFFF",   
      gradient: "linear-gradient(135deg, #FFFFFF, #F1F1F1)",
      bgImageUrl: TextileSlider,
    },
    bannerImage: TextileSlider,
    icon: "shirt",
  },
  {
    styleName: "Soft Pink 🎨",
    colors: {
      primary: "#2D0131",      
      secondary: "#3D103D",    
      accent: "#E91E63",       
      background: "#FFF0F1",   
      gradient: "linear-gradient(135deg, #FFF0F1, #FFDDE1)",
      bgImageUrl: PinkSlider,
    },
    bannerImage: PinkSlider,
    icon: "palette",
  },
  {
    styleName: "Lavender Paper 💜",
    colors: {
      primary: "#0F0522",      
      secondary: "#1A103D",    
      accent: "#7B1FA2",       
      background: "#E1BEE7",   
      gradient: "linear-gradient(135deg, #E1BEE7, #CE93D8)",
      bgImageUrl: LavenderSlider,
    },
    bannerImage: LavenderSlider,
    icon: "stamp",
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
    <div className="mt-5 px-3 py-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl">
      <h2 className="font-bold text-xl mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
        Select Slide Style
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Design_Style.map((design, index) => {
          const isSelected = selectedStyleName === design.styleName;
          return (
            <div
              key={index}
              onClick={() => onSelect && onSelect(design)}
              className={`cursor-pointer rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md border-4 ${isSelected
                ? "border-black"
                : "border-transparent"
                } bg-white`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={design.bannerImage}
                  alt={design.styleName}
                  className={`w-full h-[90px] object-cover transition-transform duration-300 ${isSelected ? "scale-110" : "hover:scale-110"
                    }`}
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg">
                    ✓
                  </div>
                )}
              </div>

              <div
                className={`text-center py-2 font-semibold transition-colors ${isSelected ? "text-black" : "text-gray-800"
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

    </div>
  );
}
