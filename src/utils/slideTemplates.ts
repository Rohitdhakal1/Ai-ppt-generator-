import type { Outline } from "@/features/projects/components/OutlineSection";
import type { DesignStyleType } from "@/features/projects/components/SliderStyle";

// Slide ka content aur design style lekar valid HTML/CSS generate karne wala function
export const generateSlideHTML = (slide: Outline, style: DesignStyleType | any): string => {
  // Extract style properties with robust fallbacks
  const colors = typeof style === 'object' && style?.colors ? style.colors : {
    primary: "#1C1C1C",
    secondary: "#4A4A4A",
    accent: "#0A66C2",
    background: "#FFFFFF",
    bgImageUrl: ""
  };

  const { primary, secondary, accent, background, bgImageUrl } = colors;
  const { type, content, outline } = slide;
  
  // HTML characters ko escape karna safe rendering ke liye
  const esc = (str: string) => {
    if (!str) return "";
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  // Base Background Style
  const bgStyle = bgImageUrl 
    ? `background-image: url('${bgImageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`
    : `background-color: ${background};`;

  // Readability ke liye overlay set karna (agar background image ho)
  const overlay = bgImageUrl ? `<div class="absolute inset-0 bg-black/20 pointer-events-none"></div>` : '';

  // Bullet Point Generation
  const bulletPoints = content?.map((p: string) => `<li class="mb-2 leading-tight">${esc(p)}</li>`).join('') || '';

  let layoutContent = '';

  switch (type) {
    case 'intro':
      const subtitle = content?.join(' • ') || '';
      layoutContent = `
        <div class="flex flex-col items-center justify-center h-full text-center p-16 relative z-10 break-words w-full">
          <h1 class="text-4xl font-black mb-4 tracking-tight" style="color: ${primary}; line-height: 1.1; text-shadow: 0 4px 10px rgba(0,0,0,0.1);">${esc(outline)}</h1>
          <div class="w-16 h-1.5 mb-4 rounded-full" style="background-color: ${accent || primary};"></div>
          <p class="text-xl font-bold max-w-3xl mx-auto leading-relaxed" style="color: ${secondary}; opacity: 0.9;">${esc(subtitle)}</p>
        </div>
      `;
      break;

    case 'image_left':
    case 'image_right':
    case 'content':
      layoutContent = `
        <div class="flex flex-col w-full h-full justify-center relative z-10 break-words text-left p-16">
          <div class="max-w-full">
            <h2 class="text-3xl font-black mb-3 tracking-tight" style="color: ${primary}; line-height: 1.1;">${esc(outline)}</h2>
            <div class="w-16 h-1 mb-6 rounded-full" style="background-color: ${accent || primary};"></div>
            <ul class="list-disc pl-6 space-y-3 text-lg font-bold leading-snug overflow-hidden" style="color: ${secondary}; max-height: 250px;">
              ${bulletPoints}
            </ul>
          </div>
        </div>
      `;
      break;

    case 'timeline':
      const steps = content?.map((p: string, i: number) => `
        <div class="flex flex-col items-center flex-1 relative min-w-0">
          <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-md mb-3 z-10" 
               style="background: ${accent || primary}; border: 2px solid white;">${i + 1}</div>
          <p class="text-sm font-black text-center leading-tight px-1" style="color: ${secondary};">${esc(p)}</p>
          ${i < (content.length - 1) ? `<div class="absolute top-6 left-[60%] w-[80%] h-0.5" style="background: ${accent || primary}; opacity: 0.3;"></div>` : ''}
        </div>
      `).join('') || '';

      layoutContent = `
        <div class="flex flex-col w-full h-full justify-center relative z-10 break-words text-left p-12">
          <h2 class="text-2xl font-black mb-8 text-center" style="color: ${primary};">${esc(outline)}</h2>
          <div class="flex justify-between items-start gap-1">
            ${steps}
          </div>
        </div>
      `;
      break;

    case 'pros_cons':
      const half = Math.ceil((content?.length || 0) / 2);
      const pros = content?.slice(0, half).map(p => `<li class="flex items-start gap-2 mb-2"><span class="text-green-600 font-black">✓</span> <span class="leading-tight">${esc(p)}</span></li>`).join('') || '';
      const cons = content?.slice(half).map(p => `<li class="flex items-start gap-2 mb-2"><span class="text-red-600 font-black">✕</span> <span class="leading-tight">${esc(p)}</span></li>`).join('') || '';

      layoutContent = `
        <div class="flex flex-col w-full h-full justify-center relative z-10 break-words p-16">
          <h2 class="text-2xl font-black mb-6 text-center" style="color: ${primary};">${esc(outline)}</h2>
          <div class="grid grid-cols-2 gap-6">
            <div class="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] border border-green-200/50 shadow-sm overflow-hidden max-h-[220px]">
              <h3 class="text-lg font-black mb-3 text-green-700 uppercase tracking-wider text-center border-b border-green-100 pb-1">Benefits</h3>
              <ul class="text-sm font-bold text-slate-800 space-y-1">${pros}</ul>
            </div>
            <div class="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] border border-red-200/50 shadow-sm overflow-hidden max-h-[220px]">
              <h3 class="text-lg font-black mb-3 text-red-700 uppercase tracking-wider text-center border-b border-red-100 pb-1">Challenges</h3>
              <ul class="text-sm font-bold text-slate-800 space-y-1">${cons}</ul>
            </div>
          </div>
        </div>
      `;
      break;

    case 'columns':
      const colHalf = Math.ceil((content?.length || 0) / 2);
      const col1 = content?.slice(0, colHalf).map(p => `<li class="mb-3 leading-tight">${esc(p)}</li>`).join('') || '';
      const col2 = content?.slice(colHalf).map(p => `<li class="mb-3 leading-tight">${esc(p)}</li>`).join('') || '';

      layoutContent = `
        <div class="flex flex-col w-full h-full justify-center relative z-10 break-words p-16">
          <h2 class="text-2xl font-black mb-6 text-center" style="color: ${primary};">${esc(outline)}</h2>
          <div class="grid grid-cols-2 gap-10">
            <div class="bg-white/30 backdrop-blur-sm p-5 rounded-[1.5rem] border border-white/40 overflow-hidden max-h-[220px]">
              <ul class="list-disc pl-5 space-y-1 text-base font-bold" style="color: ${secondary};">${col1}</ul>
            </div>
            <div class="bg-white/30 backdrop-blur-sm p-5 rounded-[1.5rem] border border-white/40 overflow-hidden max-h-[220px]">
              <ul class="list-disc pl-5 space-y-1 text-base font-bold" style="color: ${secondary};">${col2}</ul>
            </div>
          </div>
        </div>
      `;
      break;

    case 'conclusion':
      const conclusionPoints = content?.map((p: string) => `<li class="mb-2 leading-relaxed opacity-80">${esc(p)}</li>`).join('') || '';
      layoutContent = `
        <div class="flex flex-col items-center justify-center h-full text-center relative z-10 break-words w-full p-16">
          <h2 class="text-5xl font-black mb-4" style="color: ${primary}; line-height: 1.1;">Thank You</h2>
          <div class="w-16 h-1.5 mb-6 rounded-full" style="background-color: ${accent || primary};"></div>
          <div class="mb-8 p-6 bg-white/20 backdrop-blur-3xl rounded-[3rem] border border-white/50 shadow-xl max-w-xl w-full">
             <h3 class="text-xl font-extrabold tracking-tight italic" style="color: ${secondary}; opacity: 0.9;">"${esc(outline)}"</h3>
          </div>
          ${conclusionPoints ? `
            <ul class="list-none space-y-2 text-base font-bold" style="color: ${secondary};">
              ${conclusionPoints}
            </ul>
          ` : ''}
        </div>
      `;
      break;

    default:
      layoutContent = `
        <div class="flex flex-col w-full h-full justify-center relative z-10 break-words text-center p-16">
           <h1 class="text-4xl font-black mb-6" style="color: ${primary};">${esc(outline)}</h1>
           <div class="w-16 h-1 mx-auto mb-6 rounded-full" style="background-color: ${accent || primary};"></div>
           <p class="text-xl font-bold leading-relaxed" style="color: ${secondary};">${esc(content?.[0] || "")}</p>
        </div>
      `;
      break;
  }

  // Iframe rendering ke liye standard 800x450 container me wrap karna
  return `
    <div class="w-[800px] h-[450px] relative overflow-hidden p-[50px] flex flex-col items-center justify-center font-sans box-border" style="${bgStyle}">
      ${overlay}
      ${layoutContent}
    </div>
  `.trim();
};
