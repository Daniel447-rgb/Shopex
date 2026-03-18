// src/firebase/config.js
// Replace these values with your Firebase project config from:
// Firebase Console → Project Settings → Your apps → Web app
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBH-iu0YUyPyuarkukR_wYpjw09yHqmNII",
  authDomain: "shopex-547e6.firebaseapp.com",
  projectId: "shopex-547e6",
  storageBucket: "shopex-547e6.firebasestorage.app",
  messagingSenderId: "657566617557",
  appId: "1:657566617557:web:09e359fb036ce7b9edb75c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

