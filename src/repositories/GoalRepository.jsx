import { Goal } from "../domain/goal";

// Mapper
export const GoalMapper = {
  fromDTO: (doc) => new Goal({
    id: doc.id,
    userId: doc.userId,
    name: doc.name || "",
    categoriesFKs: doc.categoriesFKs || [],
    deadline: doc.deadline ? new Date(doc.deadline) : null,
    done: Boolean(doc.done || false),
    comment: doc.comment || "",
  }),
  toDTO: (goal) => ({
    id: goal.id,
    userId: goal.userId,
    name: goal.name,
    categoriesFKs: goal.categoriesFKs,
    deadline: goal.deadline instanceof Date ? goal.deadline.toISOString() : goal.deadline,
    done: goal.done,
    comment: goal.comment,
  })
};

// Repository
import { collection, doc, getDocs, setDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../config/firebase-config";

export const GoalRepository = {
  collectionName: "goals",

  async findByIds(userId, goalsIds) {
    if (!userId || !goalsIds?.length) return [];

    const goals = [];
    const q = query(
      collection(db, this.collectionName),
      where("userId", "==", userId),
      where("id", "in", goalsIds)
    );

    const snapshot = await getDocs(q);
    snapshot.forEach(doc => goals.push(GoalMapper.fromDTO({ id: doc.id, ...doc.data() })));

    return goals;
  },

  async findUserGoals(userId) {
    if (!userId) return [];

    const goals = [];
    const q = query(collection(db, this.collectionName), where("userId", "==", userId));

    const snapshot = await getDocs(q);
    snapshot.forEach(doc => goals.push(GoalMapper.fromDTO({ id: doc.id, ...doc.data() })));

    return goals;
  },

  async save(userId, goal) {
    if (!userId || !goal) return;

    const goalWithUser = { ...GoalMapper.toDTO(goal), userId };
    const ref = doc(db, this.collectionName, goal.id);
    await setDoc(ref, goalWithUser, { merge: true });
  },

  async deleteMany(userId, goalsIds) {
    if (!userId || !goalsIds?.length) return;

    const deletes = goalsIds.map(id => deleteDoc(doc(db, this.collectionName, id)));
    await Promise.all(deletes);
  }
};
