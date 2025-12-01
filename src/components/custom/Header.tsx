import React, { useContext } from 'react'

import logo from '../../assets/logo.png';
import { Button } from '../ui/button';
import { SignInButton, useAuth, UserButton, useUser } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import { Gem } from 'lucide-react';
import { UserDetailContext } from './../../../context/UserDetailContext';

const MenuOption =[
  {
    name:'workspace',
    path: './workspace'
  },
  {
    name:'Pricing',
    path:'workspace/pricing'
  }
]

function Header() {
  const {user} = useUser();

  const location = useLocation();
  console.log(location.pathname);

  const {has} = useAuth();
  const hasUnlimitedAccess = has&&has({ plan: 'unlimited' })
  console.log('hasUnlimitedAccess');

  const {userDetail,setUserDetail} = useContext(UserDetailContext);

  return (
    <div className='flex items-center justify-between px-10 shadow'>

        <img src={logo} alt="logo" height={130} width={130}/>
       {!user? 
       <SignInButton mode='modal'>
       <Button>Get Started</Button>
       </SignInButton>
    
       :<div className='flex gap-5 items-center'>
        <UserButton/>
        { location.pathname.includes('workspace') ?
        !hasUnlimitedAccess && <div className='flex gap- 2 items-center p-2 px-4 bg-emerald-300 rounded-full'> 
          <Gem/> {userDetail?.credits??0}
        </div>:

        <Link to='/workspace'>
        <Button> Go To WorkSpace</Button>
        </Link>
        }
       </div> }

    </div>
  )
}

export default Header