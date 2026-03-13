import { createContext } from "react";

// we need that too acces current user info so first 
// wrap in into app using provider so every child of app or route or componenet can use usercontext

export const UserDetailContext = createContext<any>(null)