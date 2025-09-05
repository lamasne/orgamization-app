import { doc, setDoc } from "firebase/firestore";

export const saveQuests = async (db, userId, quests) => {
  const ref = doc(db, "userQuests", userId);
  await setDoc(ref, { quests });
};