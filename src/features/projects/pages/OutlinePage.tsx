import SlidersStyle, {
  Design_Style,
  type DesignStyleType,
} from "@/features/projects/components/SliderStyle";
import { firebaseDb } from "../../../config/firebase";
import { extractJSON, streamWithOllama } from "../../../config/ollama";
import {
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  DocumentReference,
} from "firebase/firestore";
import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OutlineSection, {
  type Outline as OutlineType,
} from "@/features/projects/components/OutlineSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import CreditLimitDialog from "../../../components/shared/CreditLimitDialog";

// Context se user detail nikalne ke liye
import { UserDetailContext } from "../../../contexts/UserDetailContext";

export type Project = {
  userInputPrompt: string;
  projectId: string;
  createdAt: string;
  noOfSlider: string;
  outline?: OutlineType[];
  selectedStyle?: DesignStyleType | string;
  slides: any[];
  designStyle?: designStyle;
  projectName?: string;
  credits?: number;
};

export type designStyle = {
  colors: any;
  designGuide: string;
  styleName: string;
};

function Outline() {
  const OUTLINE_PROMPT = `Generate a comprehensive and professional presentation outline about: "{userInput}".
Total Slides: {noOfSliders}.

**OUTPUT REQUIREMENTS (STRICT):**
1. **Response Format**: You MUST output ONLY the JSON array. Do not include any preamble, introduction, or concluding remarks.
2. **Schema**: An array of slide objects. Each object MUST have wait properties:
   - "slideNo": (number)
   - "outline": (string) - A clear, descriptive heading.
   - "content": (string array) - 4-5 detailed bullet points (full sentences).
   - "type": (enum) - One of: "intro", "content", "timeline", "pros_cons", "columns", "table", "image_left", "image_right", "conclusion".
   - "imagePrompt": (string) - Leave this as an empty string "". Images are no longer used.

**SLIDE TYPE RULES:**
- "timeline": For sequential steps or history.
- "pros_cons": For comparisons or advantage lists.
- "columns": For side-by-side content or comparisons.
- "image_left": Image on the left side (45%), content on the right (55%).
- "image_right": Image on the right side (45%), content on the left (55%).
- "content": Standard informative slide.
- "intro" / "conclusion": First and last slides.

**JSON FORMATTING RULES:**
- NO markdown code blocks (no \`\`\`json).
- NO nested objects within properties.
- Ensure all quotes are double-quotes.
- Ensure there are no trailing commas.
- Start directly with [ and end with ].

**EXAMPLE OBJECT:**
{
  "slideNo": 1,
  "outline": "The Future of Artificial Intelligence",
  "content": ["AI will transform healthcare...", "Education will become personalized..."],
  "type": "content",
  "imagePrompt": ""
}

Slide 1 MUST be 'intro'. Final Slide MUST be 'conclusion'. The penultimate slide MUST be 'content' for a clear summary takeaway.
**CONCLUSION RULE**: The final 'conclusion' slide MUST include a summary of the main points or next steps in the "content" array (4-5 bullet points).
**CONTENT DIVERSITY**: Use a healthy mix of 'timeline', 'pros_cons', 'columns', and 'content'. Focus on making the text informative and well-structured. Each slide type should be used where appropriate to convey information clearly without visual aids.`;

  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [projectDetail, setProjectDetail] = useState<Project | undefined>();
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState<OutlineType[]>([]);
  const [selectedStyle, setSelectedStyle] =
    useState<DesignStyleType | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);


  // Controlled dialog state
  const [showCreditAlert, setShowCreditAlert] = useState(false);

  // StrictMode ya Dev me double execution rokne ke liye
  const hasGenerated = useRef(false);

  // user context (defensive about shape)
  const { userDetail, setUserDetail } = useContext(UserDetailContext);

  // Credits check karna (pehle context se, fir project fallback)
  const getCredits = () => {
    return userDetail?.credits ?? projectDetail?.credits ?? 0;
  };

  useEffect(() => {
    if (projectId) {
      GetProjectDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // --- NEW: auto-open credit dialog when credits are 0 or less ---
  useEffect(() => {
    const current = getCredits();
    if (current <= 0) {
      setShowCreditAlert(true);
    } else {
      setShowCreditAlert(false);
    }
    // re-run when user/project credits change
  }, [userDetail?.credits, projectDetail?.credits]);

  const GetProjectDetail = async () => {
    if (!projectId || hasGenerated.current) return;
    hasGenerated.current = true;

    setLoading(true);
    try {
      const docRef = doc(firebaseDb, "projects", projectId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Project;
        setProjectDetail(data);

        // if we already have an outline, use it instead of generating
        if (data.outline && data.outline.length > 0) {
          setOutline(data.outline);
          setLoading(false);
          return;
        }

        // Outline generate karke Firestore me save karna
        const generatedOutline = await GenerateSliderOutline(data);
        
        if (generatedOutline && generatedOutline.length > 0) {
          try {
            await updateDoc(doc(firebaseDb, "projects", projectId), {
              outline: generatedOutline
            });
          } catch (saveErr) {
            console.error("Failed to save outline:", saveErr);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch project:", err);
    } finally {
      setLoading(false);
    }
  };

  const GenerateSliderOutline = async (projectData: Partial<Project>) => {
    setLoading(true);
    try {
      const prompt = OUTLINE_PROMPT.replace(
        /{userInput}/g,
        projectData?.userInputPrompt || ""
      ).replace("{noOfSliders}", projectData?.noOfSlider || "5");

      let accumulatedResponse = "";
      const response = await streamWithOllama(prompt, (chunk) => {
        accumulatedResponse += chunk;

        // Live Outline Update: Partial JSON parse karke turant dikhana
        const rawjson = extractJSON(accumulatedResponse);
        if (rawjson) {
          try {
            let workJson = rawjson.trim();
            
            // 1. Extract all VALID completed objects first
            const completedObjects: OutlineType[] = [];
            let lastValidPos = 0;
            
            // Regex use karke valid completed objects dhundna
            const objectRegex = /\{[\s\S]*?\}/g;
            let match;
            while ((match = objectRegex.exec(workJson)) !== null) {
              try {
                // Verify it's a valid JSON slide object (basic check)
                if (match[0].includes('"outline"') || match[0].includes('"slideNo"')) {
                  const obj = JSON.parse(match[0]) as OutlineType;
                  completedObjects.push(obj);
                  lastValidPos = match.index + match[0].length;
                }
              } catch (e) {}
            }

            // 2. Extract partial text from whatever is left AFTER the last valid object
            const remaining = workJson.substring(lastValidPos).trim();
            
            // Robust regex for outline (heading)
            const outlineMatch = remaining.match(/"outline"\s*:\s*"([^"]*)/);
            // Robust regex for content (bullets)
            const contentMatch = remaining.match(/"content"\s*:\s*\[\s*([\s\S]*?)(?=\s*\]|,\s*"type"|$)/);

            let partialOutline = outlineMatch ? outlineMatch[1] : "";
            let partialContent: string[] = [];
            
            if (contentMatch) {
              const rawBullets = contentMatch[1];
              // Split by separator and clean up
              const bullets = rawBullets.split(/",\s*"/).map(b => 
                b.replace(/[\[\]"'\r\n]/g, "").trim()
              ).filter(b => b.length > 0);
              partialContent = bullets;
            }

            // 3. Assemble and Update
            const combined: OutlineType[] = [...completedObjects];
            
            // Naya partial slide tabhi add karna jab kuch content start ho jaye
            if (remaining.includes('{') || partialOutline || partialContent.length > 0) {
              combined.push({
                slideNo: completedObjects.length + 1,
                outline: partialOutline,
                content: partialContent,
                type: 'content',
                imagePrompt: ''
              });
            }

            if (combined.length > 1 || (combined.length === 1 && (combined[0].outline || combined[0].content.length > 0))) {
              setOutline(combined);
            }
          } catch (e) {
            // Silently fail and wait for more data
          }
        }
      });

      const finalJson = extractJSON(response);

      try {
        // AI might have outputted empty content or syntax errors
        // We attempt a best-effort parse
        let cleanedJson = finalJson.trim();
        // If the final JSON doesn't end with ']', try to find the last valid closing bracket
        if (!cleanedJson.endsWith("]")) {
          const lastBracket = cleanedJson.lastIndexOf("]");
          if (lastBracket !== -1) {
            cleanedJson = cleanedJson.substring(0, lastBracket + 1);
          } else {
            // Malformed JSON cases handle karna
            if (cleanedJson.startsWith("{") && !cleanedJson.endsWith("}")) {
              const lastBrace = cleanedJson.lastIndexOf("}");
              if (lastBrace !== -1) {
                cleanedJson = cleanedJson.substring(0, lastBrace + 1);
              }
            }
          }
        }

        const JSONData = JSON.parse(cleanedJson) as OutlineType[];
        setOutline(JSONData);
        setApiError(null);
        return JSONData;
      } catch (parseError) {
        console.error("❌ Failed to parse Ollama JSON:", parseError);
        // If we have some outline data already from streaming, don't show error
        if (outline.length === 0) {
          setApiError("AI returned invalid data format. Please try again.");
        }
        return outline;
      }
    } catch (error: any) {
      console.error("Error generating outline with Ollama:", error);
      setApiError("Failed to connect to local Ollama. Please ensure it is running.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Credits deduct karna function - Transaction use karke race condition se bachna
   */
  const decrementUserCreditsTransaction = async (userEmail: string): Promise<{ success: boolean; newCredits?: number; currentCredits?: number }> => {
    try {
      const userRef = doc(firebaseDb, "users", userEmail) as DocumentReference;
      const result = await runTransaction(firebaseDb, async (t) => {
        const snapshot = await t.get(userRef);
        if (!snapshot.exists()) {
          throw new Error("User doc not found.");
        }
        const data: any = snapshot.data();
        const currentCredits = data?.credits ?? 0;
        if (currentCredits <= 0) {
          return { success: false, currentCredits };
        }
        const newCredits = currentCredits - 1;
        t.update(userRef, { credits: newCredits });
        return { success: true, newCredits };
      });
      return result as any;
    } catch (err) {
      console.error("Transaction error:", err);
      return { success: false };
    }
  };

  const onGenerateSlider = async () => {
    if (!projectId) {
      console.warn("No projectId");
      return;
    }

    const currentCredits = getCredits();
    if (currentCredits <= 0) {
      navigate('/workspace/pricing');
      return;
    }

    const userEmail = userDetail?.email?.toLowerCase();
    if (!userEmail) {
      console.error("No user email in context; cannot deduct credits.");
      setShowCreditAlert(true);
      return;
    }

    setLoading(true);
    try {
      // 1) Generate outline if needed
      let finalOutline = outline;
      if (!finalOutline || finalOutline.length === 0) {
        finalOutline = (await GenerateSliderOutline(projectDetail || {})) || [];
      }

      // 1.5) GUARD: If outline is still empty (probably due to AI error), STOP HERE
      if (!finalOutline || finalOutline.length === 0) {
        setApiError("Cannot proceed: Outline is missing or generation failed.");
        return;
      }

      // 1.7) GUARD: Ensure a theme is selected
      if (!selectedStyle && (!projectDetail?.selectedStyle || projectDetail.selectedStyle === "")) {
        setApiError("Please select a presentation style (theme) before proceeding to the editor.");
        // Scroll to top to see error if needed
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 2) Save project outline first
      let styleToSave: DesignStyleType | null = selectedStyle;
      if (!styleToSave && projectDetail?.selectedStyle) {
        if (typeof projectDetail.selectedStyle === "string") {
          styleToSave =
            Design_Style.find(
              (d) => d.styleName === projectDetail.selectedStyle
            ) ?? null;
        } else {
          styleToSave = projectDetail.selectedStyle as DesignStyleType;
        }
      }

      const payload: Partial<Project> = {
        outline: finalOutline,
        selectedStyle: styleToSave ?? "",
      };

      await updateDoc(doc(firebaseDb, "projects", projectId), payload);

      // 3) Conditional Credit Deduction: 
      // ONLY deduct if this project didn't have an outline before
      const isNewProject = !projectDetail?.outline || projectDetail.outline.length === 0;
      
      if (isNewProject) {
        const txResult = await decrementUserCreditsTransaction(userEmail);
        if (!txResult || txResult.success === false) {
          console.warn("Could not deduct credit:", txResult);
          setShowCreditAlert(true);
          return;
        }

        // Local context ko naye credits ke saath update karna
        if (typeof txResult.newCredits === "number" && setUserDetail) {
          setUserDetail((prev: any) => ({
            ...(prev ?? {}),
            credits: txResult.newCredits,
          }));
        }
      } else {
        // Skip credit deduction
      }

      // 5) Success — navigate to editor page (absolute route)
      navigate(`/workspace/project/${projectId}/editor`);
    } catch (err) {
      console.error("Failed to generate/deduct credits:", err);
      alert("Failed to generate slides. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isExistingProject = projectDetail?.outline && projectDetail.outline.length > 0;

  return (
    <div className="flex items-center justify-center mt-12 px-6">
      <div className="max-w-2xl w-full pb-20">

        {/* API Error Alert */}
        {apiError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium animate-pulse">
            ⚠️ {apiError}
          </div>
        )}



        {/* Display current credits */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💳 Available Credits:{" "}
            <span className="font-bold">{getCredits() ?? 0}</span>
          </p>
        </div>

        {/* pass the name to highlight, and receive the full style object onSelect */}
        <SlidersStyle
          selectedStyleName={selectedStyle?.styleName ?? ""}
          onSelect={(s) => {
            setSelectedStyle(s);
          }}
        />

        <div className="mt-6">
          <OutlineSection
            loading={loading}
            outline={outline}
            onUpdate={(updated) => setOutline(updated)}
          />
        </div>
      </div>

      {/* Floating Generate Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={onGenerateSlider}
          disabled={loading}
          className="px-6 py-3 font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg rounded-full flex items-center gap-2"
        >
          <Sparkles className="h-5 w-5" />
          {loading ? "Generating..." : isExistingProject ? "Save & Open Editor" : "Generate Sliders (1 Credit)"}
          <ArrowRight />
        </Button>
      </div>

      {/* Controlled Credit dialog */}
      <CreditLimitDialog
        openAlert={showCreditAlert}
        onOpenChange={(open) => setShowCreditAlert(open)}
      />
    </div>
  );
}

export default Outline;
