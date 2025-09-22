import { useEffect } from "react";
import { QuestRepository } from "../repositories/QuestRepository";
import { questCategoryRepository } from "../repositories/QuestCategoryRepository";
import useCommonTabManager from "./useCommonTabManager";
import { getAuth } from "firebase/auth";
import { useState } from "react";

export default function useQuestTabManager() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [pendingQuests, setPendingQuests] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [allMotherQuestsMap, setAllMotherQuestsMap] = useState({});
  const [allMotherCategoriesMap, setAllMotherCategoriesMap] = useState({});
  const [expandedQuestIds, setExpandedQuestIds] = useState([]);
  
  useEffect(() => {
    if (!user) return;

    async function attachProgress(quest) {
      const progress = await quest.getCurrentProgress();
      quest.currentProgress = progress; // preserve class methods
      return quest;
    }

    async function withProgress(quests) {
      return Promise.all(quests.map(attachProgress));
  }

  const unsubscribeQuests = QuestRepository.onFieldChange("userId", user.uid, async (quests) => {
    const [pending, completed] = await Promise.all([
      withProgress(quests.filter(q => !q.isDone)),
      withProgress(quests.filter(q => q.isDone)),
    ]);
    setPendingQuests(pending);
    setCompletedQuests(completed);
  });

  const updateItemsMap = (items, setAllItemsMap) => {
    const updatedMap = {};
    items.forEach(item => { updatedMap[item.id] = item; });
    setAllItemsMap(updatedMap);
  };

  const unsubscribeMotherQuests = QuestRepository.onFieldChange("userId", user.uid, (quests) => {
    updateItemsMap(quests, setAllMotherQuestsMap);
  });

  questCategoryRepository.findAll()
  .then((categories) => {
    updateItemsMap(categories, setAllMotherCategoriesMap);
  })
  .catch((err) => {
    console.error("Error fetching categories", err);
  });


  return () => {
    unsubscribeQuests();
    unsubscribeMotherQuests();
  };
}, [user]);

  const changeStatus = async (quest) => {
    console.log("Request to change status of quest", quest.id, "by user", user.uid);
    const updated = { ...quest, status: quest.isDone ? "pending" : "completed" };
    await QuestRepository.save(user.uid, updated);
  };

  const save = async (quest) => {
    await QuestRepository.save(user.uid, quest);
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure? This action is irreversible.")) return;
    await QuestRepository.deleteMany(user.uid, [id]);
  };

  function toggleExpand(qid) {
    setExpandedQuestIds(prev =>
      prev.includes(qid) ? prev.filter(id => id !== qid) : [...prev, qid]
    );
  }  
 
  const common = useCommonTabManager({ changeStatus, remove });

  return {
    pendingQuests,
    completedQuests,
    allMotherQuestsMap,
    allMotherCategoriesMap,
    expandedQuestIds,
    save,
    remove,
    changeStatus,
    toggleExpand,
    ...common,
  };
}