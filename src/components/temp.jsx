import { auth, googleProvider } from "../config/firebase-config";
import {
  signInWithPopup,
  signOut,
} from "firebase/auth";

export const Auth = () => {
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={signInWithGoogle}> Sign In With Google</button>
      {/* <button onClick={logout}> Logout </button> */}
    </div>
  );
};