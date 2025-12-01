// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; no need remove inside

import { getFirestore } from "firebase/firestore";
import {
  getAI,
  getGenerativeModel,
  getLiveGenerativeModel,
  GoogleAIBackend,
  ResponseModality,
} from "firebase/ai";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create a `GenerativeModel` instance with a model that supports your use case
export const GeminiAiModel = getGenerativeModel(ai, {
  model: "gemini-2.5-flash",
});

// Create a `LiveGenerativeModel` instance with the flash-live model (only model that supports the Live API)
export const GeminiAiLiveModel = getLiveGenerativeModel(ai, {
  model: "gemini-2.0-flash-live-001",
  // Configure the model to respond with text
  generationConfig: {
    responseModalities: [ResponseModality.TEXT],
  },
});
