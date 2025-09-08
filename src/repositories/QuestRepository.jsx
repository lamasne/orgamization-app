
import { Quest } from "../domain/quest";

// Mapper
export const QuestMapper = {
  fromDTO: (doc) => new Quest({ 
    id: doc.id || "",
    userId: doc.userId || "",
    name : doc.name || "",
    motherGoalsFKs: doc.motherGoalsFKs || [],
    // Date (formatted as 'YYYY-MM-DD HH:mm')
    startEstimate: doc.startEstimate
      ? new Date(doc.startEstimate)
      : null,
    hoursEstimate: doc.hoursEstimate ? doc.hoursEstimate.map(Number) : [],
    deadline: doc.deadline
      ? new Date(doc.deadline)
      : null,
    hoursSpent: Number(doc.hoursSpent),
    done: Boolean(doc.done),
    difficulty: Number(doc.difficulty),
    comment: doc.comment,
  }),
  toDTO: (quest) => ({
      id: quest.id,
      userId: quest.userId,
      motherGoalsFKs: quest.motherGoalsFKs,
      name: quest.name,
      startEstimate: quest.startEstimate ? quest.startEstimate.toISOString() : null,
      hoursEstimate: quest.hoursEstimate,
      deadline: quest.deadline
        ? new Date(quest.deadline).toISOString().slice(0,16).replace('T', ' ')
        : null, 
      // deadline: quest.deadline ? quest.deadline.toISOString() : null,
      hoursSpent: quest.hoursSpent,
      done: quest.done,
      difficulty: quest.difficulty,
      comment: quest.comment,
  })
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
      collection(db, this.collectionName),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);

    const quests = [];
    snap.forEach(doc => {
      quests.push(QuestMapper.fromDTO(doc.data()));
    });
    return quests;
  },

  async saveQuest(userId, quest) {
    if (!userId || !quest) {
      console.log("Invalid userId or quest");
      return;
    }

    const questWithUser = { ...QuestMapper.toDTO(quest), userId };
    const ref = doc(db, this.collectionName, quest.id);
    await setDoc(ref, questWithUser, { merge: true });
  },

  async deleteMany(userId, questsIds) {
    if (!userId || !questsIds?.length) {
      console.log("Invalid userId or questsIds");
      return;
    }

    const deletes = questsIds.map(id => deleteDoc(doc(db, this.collectionName, id)));
    await Promise.all(deletes);
  }
};
