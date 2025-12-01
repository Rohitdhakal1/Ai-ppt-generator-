import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { Outdent } from "lucide-react";
import React, { useContext } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { firebaseDb } from "./../../config/FirebaseConfig";
import { type Firestore } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { setDoc } from "firebase/firestore";
import { useEffect } from "react";
import { UserDetailContext } from "./../../context/UserDetailContext";
import Header from "@/components/custom/Header";
import PromtBox from "@/components/custom/PromtBox";
import MyProject from "@/components/custom/MyProject";

function WorkSpace() {
  const { user, isLoaded } = useUser();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);

  const location = useLocation();

  useEffect(() => {
    user && CreateNewUser(); // if user signin then go to create new user
  }, [user]);

  const CreateNewUser = async () => {
    if (user) {
      // if user sign in then it work

      const docRef = doc(
        firebaseDb,
        "users",
        user?.primaryEmailAddress?.emailAddress ?? ""
      ); // it just make referance to check to firebase or say return email or '
      const docSnap = await getDoc(docRef); // it pass docred which contain email or '' and go to database to check if present true otherwise false

      if (docSnap.exists()) {
        // if exist it show this
        console.log("Document data:", docSnap.data());
        setUserDetail(docSnap.data());
      } else {
        // insert new user  if not prsent in database
        const data = {
          fullName: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          createdAt: new Date(),
          credits: 2,
        };

        await setDoc(
          doc(
            firebaseDb,
            "users",
            user.primaryEmailAddress?.emailAddress ?? ""
          ),
          {
            ...data,
          }
        );
        setUserDetail(data);
      }
    }
  };

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
