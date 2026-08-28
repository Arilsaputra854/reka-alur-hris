import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDt02Qa3iO3LidH7Q84bneP_krGkFxDmN4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "reka-alur-hris.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "reka-alur-hris",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "reka-alur-hris.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "400289301130",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:400289301130:web:82c0225944364029a1a373",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
