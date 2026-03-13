import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Header from "@/components/layout/Header";
import PromtBox from "@/features/projects/components/PromptBox";
import MyProject from "@/features/projects/components/ProjectList";

function WorkSpace() {
  const { user, isLoaded } = useUser();
  const location = useLocation();



  if (!user && isLoaded) {
    return (
      <div>
        {" "}
        Please Sign in To acess the Workspace
        <Link to="/">
          <Button>Sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Header />
      {location.pathname === "/workspace" && (
        <div>
          <PromtBox />
          <MyProject />
        </div>
      )}

      <Outlet />
    </div>
  );
}

export default WorkSpace;
