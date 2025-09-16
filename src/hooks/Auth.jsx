// useAuth.js
import { useState, useEffect } from "react";
import { auth, googleProvider } from "../config/firebase-config";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { UserRepository } from "../repositories/UserRepository";
import { User } from "../models/User";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveUser = async (firebaseUser) => {
    const userModel = new User({
      uid: firebaseUser.uid,
      firstName: firebaseUser.displayName?.split(" ")[0] || "",
      lastName: firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
      email: firebaseUser.email,
    });
    await UserRepository.save(userModel).catch(console.error);
    setUser(userModel);
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      saveUser(result.user);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    await signOut(auth).catch(console.error);
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) saveUser(firebaseUser);
      else setUser(null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading, signInWithGoogle, logout };
};
