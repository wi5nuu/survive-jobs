import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxg1UifXQOWJpTEQLU_EGlBjmRSJEatu8",
  authDomain: "survivejob.firebaseapp.com",
  projectId: "survivejob",
  storageBucket: "survivejob.firebasestorage.app",
  messagingSenderId: "458942316653",
  appId: "1:458942316653:web:8279b527b6f299d29e7f64",
  measurementId: "G-VTLZS85XYK"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
