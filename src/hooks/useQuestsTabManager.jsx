import { useEffect } from "react";
import { GoalRepository } from "../repositories/GoalRepository";

export default function useQuestsTabManager({ 
  user, pendingQuests, setPendingQuests, completedQuests, setCompletedQuests, activeTab, thisTab, 
  setAllGoalsMap, saveItem, deleteItems 
}) {

  const loadUserGoals = async () => {
    if (!user) return;
    const goals = await GoalRepository.findUserGoals(user.uid);
    const map = {};
    goals.forEach(g => { map[g.id] = g.name; });
    setAllGoalsMap(map);
  };

  useEffect(() => {
    if (activeTab === thisTab) loadUserGoals();
  }, [activeTab, user]);

  const changeStatus = async (quest) => {
    const updated = { ...quest, done: !quest.done };
    await saveItem(user.uid, updated);

    const newPending = pendingQuests.filter(q => q.id !== quest.id);
    const newCompleted = completedQuests.filter(q => q.id !== quest.id);

    if (updated.done) {
      setPendingQuests(newPending);
      setCompletedQuests([...newCompleted, updated]);
    } else {
      setCompletedQuests(newCompleted);
      setPendingQuests([...newPending, updated]);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure? This action is irreversible.")) return;
    await deleteItems(user.uid, [id]);
    setPendingQuests(pendingQuests.filter(q => q.id !== id));
    setCompletedQuests(completedQuests.filter(q => q.id !== id));
  };

  return {
    changeStatus,
    remove,
  };
}
