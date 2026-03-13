import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ArrowUp, Loader2Icon } from "lucide-react";
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
import { firebaseDb } from "../../../config/firebase";
import { useUser } from "@clerk/clerk-react";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { UserDetailContext } from "../../../contexts/UserDetailContext";
import { useContext } from "react";

function PromtBox() {
  const [userInput, setUserInput] = useState<string>();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [NoofSlides, setNoofSlides] = useState<string>("7");
  const navigate = useNavigate();
  const { userDetail } = useContext(UserDetailContext);

  // Naya project save karne ka logic
  const CreateAndSaveInput = async () => {
    const projectId = uuidv4();

    if ((userDetail?.credits ?? 0) <= 0) {
      navigate('/workspace/pricing');
      return;
    }

    setLoading(true);
    try {
      const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "unknown";
      await setDoc(doc(firebaseDb, "projects", projectId), {
        projectId: projectId,
        userInputPrompt: userInput,
        createdBy: email,
        createdAt: Date.now(),
        noOfSlider: NoofSlides,
      });
    } catch (err) {
      console.error("🔥 Firestore error while saving project:", err);
    } finally {
      setLoading(false);
      navigate(`/workspace/Project/${projectId}/outline`);
    }
  };

  return (
    <div id="create-prompt" className="w-full flex items-center justify-center mt-10 mb-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <h2 className="font-bold text-4xl text-center">
          Describe your topic, we’ll design the PPT slides!
        </h2>
        <p className="text-xl text-gray-600 ">
          Your design will be saved as new project
        </p>

        <InputGroup>
          <InputGroupTextarea
            id="prompt-textarea"
            className="min-h-38"
            placeholder="Enter what kind of slide you want to create"
            onChange={(e) => setUserInput(e.target.value)}
          />

          <InputGroupAddon align={"block-end"}>
            {/* <InputGroupButton>
        <PlusIcon/>
        </InputGroupButton> */}

            <Select defaultValue="7" onValueChange={(value) => setNoofSlides(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select no. of slides" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Number of Slides</SelectLabel>
                  <SelectItem value="5">5 Slides</SelectItem>
                  <SelectItem value="6">6 Slides</SelectItem>
                  <SelectItem value="7">7 Slides</SelectItem>
                  <SelectItem value="8">8 Slides</SelectItem>
                  <SelectItem value="9">9 Slides</SelectItem>
                  <SelectItem value="10">10 Slides</SelectItem>
                  <SelectItem value="11">11 Slides</SelectItem>
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
