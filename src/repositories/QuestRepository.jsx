
import { Quest } from "../models/Quest";
import { ItemRepository } from "./ItemRepository";

// Mapper
export const QuestMapper = {
  fromDTO: (doc) => new Quest({ 
    id: doc.id || "",
    userId: doc.userId || "",
    isSubQuest: Boolean(doc.isSubQuest),
    motherQuestsFks: doc.motherQuestsFks || [],
    name: doc.name || "",
    // Date (formatted as 'YYYY-MM-DD HH:mm' in toDTO)
    deadline: doc.deadline ? new Date(doc.deadline) : null,
    difficulty: Number(doc.difficulty) || 0,
    comment: doc.comment || "",
    progressMetricsName: doc.progressMetricsName || "",
    progressMetricsValue: doc.progressMetricsValue ?? null,
  }),
  toDTO: (quest) => {
    return {
      id: quest.id,
      userId: quest.userId,
      isSubQuest: quest.isSubQuest,
      motherQuestsFks: quest.motherQuestsFks,
      name: quest.name,
      deadline: quest.deadline instanceof Date && !isNaN(quest.deadline)
      ? quest.deadline.toISOString().slice(0,16).replace("T", " ")
      : null,
      difficulty: quest.difficulty,
      comment: quest.comment,
      progressMetricsName: quest.progressMetricsName,
      progressMetricsValue: quest.progressMetricsValue,
    }
  },
};

// Repository
export const QuestRepository = new ItemRepository("quests", QuestMapper);
