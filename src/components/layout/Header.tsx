import { useContext, useEffect } from 'react'
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseDb } from "../../config/firebase";

import logo from '../../assets/logo.png';
import { Button } from '../ui/button';
import { SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import { Gem } from 'lucide-react';
import { UserDetailContext } from "../../contexts/UserDetailContext";



function Header() {
  const {user} = useUser();
  const location = useLocation();

  const {userDetail,setUserDetail} = useContext(UserDetailContext);

  useEffect(() => {
    user && CreateNewUser();
  }, [user]);

  const CreateNewUser = async () => {
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
    if (!email) {
      return;
    }

    try {
      const docRef = doc(firebaseDb, "users", email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserDetail(docSnap.data());
      } else {
        const data = {
          fullName: user?.fullName,
          email: email,
          createdAt: new Date(),
          credits: 10,
        };
        await setDoc(doc(firebaseDb, "users", email), data);
        setUserDetail(data);
      }
    } catch (error) {
    }
  };

  return (
    <div className='flex items-center justify-between px-10 shadow py-2'>

        <img src={logo} alt="logo" height={80} width={80} className="object-contain" />
       {!user? 
       <SignInButton mode='modal'>
       <Button>Get Started</Button>
       </SignInButton>
    
       :<div className='flex gap-5 items-center'>
        { location.pathname.includes('workspace') &&
          <div className='flex gap-3 items-center'>
            <div className='flex gap-2 items-center p-2 px-4 bg-emerald-300 rounded-full font-bold shadow-sm'> 
              <Gem className='text-emerald-700'/> {userDetail?.credits??0}
            </div>
            <Link to='/workspace/pricing'>
              <Button variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold rounded-full">
                Buy Credits
              </Button>
            </Link>
          </div>
        }
        
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Link 
              label="Buy Credits" 
              labelIcon={<Gem size={16} />} 
              href="/workspace/pricing" 
            />
          </UserButton.MenuItems>
        </UserButton>

        { !location.pathname.includes('workspace') &&
          <Link to='/workspace'>
            <Button> Go To WorkSpace</Button>
          </Link>
        }
       </div> }

    </div>
  )
}

export default Header