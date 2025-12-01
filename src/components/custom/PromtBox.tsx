import React, { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ArrowUp, Loader2Icon, PlusIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";
import { firebaseDb } from "../../../config/FirebaseConfig";
import { useUser } from "@clerk/clerk-react";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Value } from "@radix-ui/react-select";

function PromtBox() {
  const [userInput, setUserInput] = useState<string>();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [NoofSlides, setNoofSlides] = useState<string>("4 to 6");
  const navigate = useNavigate();

  const CreateAndSaveInput = async () => {
    const projectId = uuidv4();

    setLoading(true);
    try {
      await setDoc(doc(firebaseDb, "projects", projectId), {
        projectId: projectId,
        userInputPrompt: userInput,
        createdBy: user?.primaryEmailAddress?.emailAddress ?? "unknown",
        createdAt: Date.now(),
        noOfSlider: NoofSlides,
      });
      console.log("✅ Project saved!");
    } catch (err) {
      console.error("🔥 Firestore error:", err);
    } finally {
      setLoading(false);
      navigate(`/workspace/Project/${projectId}/outline`);
    }
  };

  return (
    <div className="w-full flex items-center justify-center mt-25">
      <div className="flex flex-col items-center justify-center space-y-4">
        <h2 className="font-bold text-4xl">
          Describe your topic, we’ll design the{" "}
          <span className="text-primary">PPT</span>slides!
        </h2>
        <p className="text-xl text-gray-600 ">
          Your design will be saved as new project
        </p>

        <InputGroup>
          <InputGroupTextarea
            className="min-h-38"
            placeholder="Enter what kind of slide you want to create"
            onChange={(e) => setUserInput(e.target.value)}
          />

          <InputGroupAddon align={"block-end"}>
            {/* <InputGroupButton>
        <PlusIcon/>
        </InputGroupButton> */}

            <Select onValueChange={(value) => setNoofSlides(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select no. of slider" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>No. Of Slider</SelectLabel>
                  <SelectItem value="apple">4-6 Slider</SelectItem>
                  <SelectItem value="6 to 8">6 to 8 Slider</SelectItem>
                  <SelectItem value="8 to 12">8 to 12 Slider</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <InputGroupButton
              variant="default"
              className="rounded-full size={icon-sm} ml-auto"
              onClick={() => CreateAndSaveInput()}
              disabled={!userInput}
            >
              {loading ? <Loader2Icon className="animate-spin" /> : <ArrowUp />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}

export default PromtBox;
