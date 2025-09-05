import { doc, setDoc } from "firebase/firestore";

export const collectionName = "userQuests";

export const saveQuests = async (db, userId, quests) => {
  const ref = doc(db, collectionName, userId);
  await setDoc(ref, { quests });
};