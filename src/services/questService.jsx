import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";

export const collectionName = "quests";

export const saveQuest = async (userId, quest) => {
  if (!userId || !quest) {
    console.log("Invalid userId or quest");
    return;
  }

  // Ensure quest has its userId field
  const questWithUser = { ...quest, userId };

  // Use quest.id as the Firestore document ID
  const ref = doc(db, collectionName, quest.id);
  await setDoc(ref, questWithUser, { merge: true });
};

export const deleteQuests = async (userId, questsIds) => {
  if (!userId || !questsIds?.length) {
    console.log("Invalid userId or questsIds");
    return;
  }

  const deletes = questsIds.map(id => {
    const ref = doc(db, collectionName, id);
    return deleteDoc(ref);
  });

  await Promise.all(deletes);
};
