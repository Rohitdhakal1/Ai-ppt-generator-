// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY!,
  authDomain: "ai-ppt-generator-b3072.firebaseapp.com",
  projectId: "ai-ppt-generator-b3072",
  storageBucket: "ai-ppt-generator-b3072.firebasestorage.app",
  messagingSenderId: "53097035655",
  appId: "1:53097035655:web:63a45a9ed754867c090522",
  measurementId: "G-694JN0XTPR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseDb = getFirestore(app);
