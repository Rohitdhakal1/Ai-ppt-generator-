import SlidersStyle, {
  Design_Style,
  type DesignStyleType,
} from "@/components/custom/SlidersStyle";
import { firebaseDb, GeminiAiModel } from "../../../../config/FirebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  DocumentReference,
} from "firebase/firestore";
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OutlineSection, {
  type Outline as OutlineType,
} from "@/components/custom/OutlineSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import CreditLimitDialog from "../../../components/custom/CreditLimitDialog";

// Path to your context (adjust if different)
import { UserDetailContext } from "../../../../context/UserDetailContext";

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
  const OUTLINE_PROMPT = `Generate a PowerPoint slide outline for the topic {userInput}. Create {noOfSliders} in total. Each slide should include a topic name and a 2-line descriptive outline that clearly explains what content the slide will cover.
Include the following structure:
The first slide should be a Welcome screen.
The second slide should be an Agenda screen.
The final slide should be a Thank You screen.
Return the response only in JSON format, following this schema:
[
  {
    "slideNo": "",
    "slidePoint": "",
    "outline": ""
  }
]`;

  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [projectDetail, setProjectDetail] = useState<Project | undefined>();
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState<OutlineType[]>([]);
  const [selectedStyle, setSelectedStyle] =
    useState<DesignStyleType | null>(null);

  // Controlled dialog state
  const [showCreditAlert, setShowCreditAlert] = useState(false);

  // user context (defensive about shape)
  const userCtx: any = useContext<any>(UserDetailContext);
  const getUserFromCtx = () => {
    if (!userCtx) return null;
    if (Array.isArray(userCtx)) return userCtx[0];
    return userCtx.userDetail ?? null;
  };
  const getSetUserFromCtx = () => {
    if (!userCtx) return undefined;
    if (Array.isArray(userCtx)) return userCtx[1];
    return userCtx.setUserDetail;
  };

  const userDetail = getUserFromCtx();
  const setUserDetail = getSetUserFromCtx();

  // get credits (prefer user context then project fallback)
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
    if (!projectId) return;
    const docref = doc(firebaseDb, "projects", projectId ?? "");
    const docsnap: any = await getDoc(docref);

    if (!docsnap.exists()) return;

    const data = docsnap.data() as Project;
    setProjectDetail(data);

    if (data?.selectedStyle) {
      if (typeof data.selectedStyle === "string") {
        const found = Design_Style.find(
          (d) => d.styleName === data.selectedStyle
        );
        setSelectedStyle(found ?? null);
      } else {
        setSelectedStyle(data.selectedStyle as DesignStyleType);
      }
    }

    if (!data?.outline) {
      await GenerateSliderOutline(data);
    } else {
      setOutline(data.outline || []);
    }
  };

  const GenerateSliderOutline = async (projectData: Partial<Project>) => {
    setLoading(true);
    try {
      const prompt = OUTLINE_PROMPT.replace(
        "{userInput}",
        projectData?.userInputPrompt || ""
      ).replace("{noOfSliders}", projectData?.noOfSlider || "5");

      const result = await GeminiAiModel.generateContent(prompt);
      const text = await result.response.text();
      const rawjson = text.replace("```json", "").replace("```", "");
      const JSONData = JSON.parse(rawjson) as OutlineType[];
      setOutline(JSONData);
      return JSONData;
    } catch (error) {
      console.error("Error generating outline:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atomically decrement user credits by 1 using a transaction.
   * Uses collection "users" and doc id = userEmail.
   * Returns an object like { success: boolean, newCredits?: number, currentCredits?: number }
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
      setShowCreditAlert(true);
      return;
    }

    const userEmail = userDetail?.email;
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
      console.log("Saved project outline & style to Firestore", payload);

      // 3) Decrement the user's credits with a transaction against "users" collection
      const txResult = await decrementUserCreditsTransaction(userEmail);

      if (!txResult || txResult.success === false) {
        console.warn("Could not deduct credit:", txResult);
        setShowCreditAlert(true);
        return;
      }

      // 4) Update local context only if newCredits exists
      if (typeof txResult.newCredits === "number" && setUserDetail) {
        try {
          if (Array.isArray(userCtx)) {
            // tuple setter
            setUserDetail({
              ...userDetail,
              credits: txResult.newCredits,
            });
          } else {
            // object setter (assume setUserDetail function)
            setUserDetail((prev: any) => ({ ...(prev ?? {}), credits: txResult.newCredits }));
          }
        } catch (e) {
          console.warn("Failed to update userDetail in context:", e);
        }
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

  return (
    <div className="flex items-center justify-center mt-20">
      <div className="max-w-3xl w-full">
        <h2 className="font-bold text-2xl mb-4">Settings and Slider Outline</h2>

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
          <OutlineSection loading={loading} outline={outline} />
        </div>
      </div>

      {/* Floating Generate Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={onGenerateSlider}
          disabled={loading || getCredits() <= 0}
          className="px-6 py-3 font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg rounded-full flex items-center gap-2"
        >
          <Sparkles className="h-5 w-5" />
          {loading ? "Generating..." : "Generate Sliders (1 Credit)"}
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
