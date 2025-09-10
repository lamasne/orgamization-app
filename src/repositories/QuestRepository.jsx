
import { Quest } from "../models/Quest";

// Mapper
export const QuestMapper = {
  fromDTO: (doc) => new Quest({ 
    id: doc.id || "",
    userId: doc.userId || "",
    name : doc.name || "",
    motherGoalsFks: doc.motherGoalsFks || [],
    // Date (formatted as 'YYYY-MM-DD HH:mm')
    startEstimate: doc.startEstimate
      ? new Date(doc.startEstimate)
      : null,
    hoursRange: doc.hoursRange ? doc.hoursRange.map(Number) : [],
    deadline: doc.deadline
      ? new Date(doc.deadline)
      : null,
    hoursSpent: Number(doc.hoursSpent),
    done: Boolean(doc.done),
    difficulty: Number(doc.difficulty),
    comment: doc.comment,
  }),
  toDTO: (quest) => {
    return {
      id: quest.id,
      userId: quest.userId,
      motherGoalsFks: quest.motherGoalsFks,
      name: quest.name,
      startEstimate: quest.startEstimate ? quest.startEstimate.toISOString() : null,
      hoursRange: quest.hoursRange,
      deadline: quest.deadline
        ? quest.deadline.toISOString().slice(0,16).replace('T', ' ')
        : null, 
      // deadline: quest.deadline ? quest.deadline.toISOString() : null,
      hoursSpent: quest.hoursSpent,
      done: quest.done,
      difficulty: quest.difficulty,
      comment: quest.comment,
    }
  },
};

// Repository
import { doc, getDocs, setDoc, deleteDoc, query, collection, where } from "firebase/firestore";
import { db } from "../config/firebase-config";

export const QuestRepository = {
  collectionName: "quests",

  async findByUserId(userId) {
    if (!userId) {
      console.log("Invalid userId");
      return [];
    }

    const q = query(
      collection(db, QuestRepository.collectionName),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);

    const quests = [];
    snap.forEach(doc => {
      quests.push(QuestMapper.fromDTO(doc.data()));
    });
    return quests;
  },

  async save(userId, quest) {
    if (!userId || !quest) {
      console.log("Invalid userId or quest");
      return;
    }

    const questWithUser = { ...QuestMapper.toDTO(quest), userId };
    const ref = doc(db, QuestRepository.collectionName, quest.id);
    await setDoc(ref, questWithUser, { merge: true });
  },

  async deleteMany(userId, questsIds) {
    if (!userId || !questsIds?.length) {
      console.log("Invalid userId or questsIds");
      return;
    }

    const deletes = questsIds.map(id => deleteDoc(doc(db, QuestRepository.collectionName, id)));
    await Promise.all(deletes);
  }
};
