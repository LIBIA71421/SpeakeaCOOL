import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyADpQX_fLzvNCoulI7fnfl7ak5RBhQ8xNo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "speakeacool.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "speakeacool",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "speakeacool.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "256240090874",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:256240090874:web:44324ad99094f82600d343",
};

export function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}
