import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYduxQlHN51OKdHNBrc81ADBUVwd7gi-c",
  authDomain: "quant-prep.firebaseapp.com",
  projectId: "quant-prep",
  storageBucket: "quant-prep.firebasestorage.app",
  messagingSenderId: "524453485385",
  appId: "1:524453485385:web:a1fd5f2d44c085c97dd898",
  measurementId: "G-H1LHETK4ZV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);