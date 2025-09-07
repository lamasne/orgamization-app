import { doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import { collection, query, where } from "firebase/firestore";

export const collectionName = "goals";

export const fetchGoalsByIds = async (userId, goalsIds) => {
  if (!userId || !goalsIds?.length) {
    console.log("Invalid userId or goalsIds:", userId, goalsIds);
    return [];
  }

  const goals = [];
  const snapshot = await getDocs(query(collection(db, collectionName), where("userId", "==", userId), where("id", "in", goalsIds)));
  snapshot.forEach(doc => {
    goals.push({ id: doc.id, ...doc.data() });
  });
  return goals;
};

export const fetchUserGoals = async (userId) => {
  if (!userId) {
    console.log("Invalid userId");
    return [];
  }

  const goals = [];
  const snapshot = await getDocs(query(collection(db, collectionName), where("userId", "==", userId)));
  snapshot.forEach(doc => {
    goals.push({ id: doc.id, ...doc.data() });
  });
  return goals;
};

export const saveGoal = async (userId, goal) => {
  if (!userId || !goal) {
    console.log("Invalid userId or goal");
    return;
  }

  // Ensure goal has its userId field
  const goalWithUser = { ...goal, userId };

  // Use goal.id as the Firestore document ID
  const ref = doc(db, collectionName, goal.id);
  await setDoc(ref, goalWithUser, { merge: true });
};

export const deleteGoals = async (userId, goalsIds) => {
  if (!userId || !goalsIds?.length) {
    console.log("Invalid userId or goalsIds:", userId, goalsIds);
    return;
  }

  const deletes = goalsIds.map(id => {
    const ref = doc(db, collectionName, id);
    return deleteDoc(ref);
  });

  await Promise.all(deletes);
};